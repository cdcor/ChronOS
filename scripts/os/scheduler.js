/* ----------
   scheduler.js
   
   Requires kernel.js
   
   An extension of the kernel to handle CPU scheduling using a round robin algorithm.
   ---------- */

// The round robin scheduling quantum.
Kernel.schedulingQuantum = DEFAULT_SCHEDULING_QUATUM;

Kernel.previousQuantum = DEFAULT_SCHEDULING_QUATUM;

// The number of cycles a process has been executing.
Kernel.processCycles = 0;

/**
 * Runs the specified process (i.e. moves it from the resident list to the ready queue).
 * 
 * @param {Number} pid the process to run
 */
Kernel.runProcess = function(pid)
{
	// Get the PCB.
	var process = Kernel.residentList[pid];
	
	// Check if the PCB defines a valid process.
	if (process)
	{
		Kernel.trace("Running process: " + pid);
		// Place on the ready queue.
		Kernel.readyQueue.enqueue(process);
		process.status = "Ready";
		// Remove from resident list.
		Kernel.residentList[pid] = null;
	}
	else // Process does not exist.
		_StdIn.putText("There is no process with that ID.");
};

/**
 * Runs all resident processes (i.e. moves them to the ready queue). 
 */
Kernel.runAllProcesses = function()
{
	var process;
	
	for (var i = 0; i < Kernel.residentList.length; i++)
	{
		process = Kernel.residentList[i];
		
		if (process)
		{
			Kernel.trace("Running process: " + process.pid);
			// Place on the ready queue.
			Kernel.readyQueue.enqueue(process);
			process.status = "Ready";
			// Remove from resident list.
			Kernel.residentList[i] = null;
		}
	}
};

/**
 * Terminates the process with the specified ID.
 * 
 * @param {Number} pid the ID of the process 
 */
Kernel.killProcess = function(pid)
{
	var processes = Kernel.getActiveProcesses(), process;
	
	// Search for the process from the active processes
	for (var i = 0; i < processes.length; i++)
	{
		if (processes[i].pid === pid)
		{
			process = processes[i];
			break;
		}
	}
	
	if (process)
	{
		Kernel.trace("Killing process: " + process.pid);
		
		if (process.status === "Running")
			Kernel.interrupt(PROCESS_TERMINATED_IRQ, "User terminated process.");
		else // Ready
			Kernel.readyQueue.remove(i - 1);
	}
	else
		_StdIn.putText("There is no process with that ID.");
};

/**
 * Performs appropriate operations to execute ready and running processes simultaneously on the CPU.
 * 
 * @param {Object} step exists if the single step button was pressed 
 */
Kernel.scheduleCycle = function(step)
{
	if (_CPU.isExecuting)
	{
		if (!Control.singleStep || step)
		{
        	_CPU.cycle();
        	Kernel.processCycles++;
        	
        	if ((Kernel.processCycles >= Kernel.schedulingQuantum) && (Kernel.readyQueue.size() > 0))
        	{
        		Kernel.interrupt(CONTEXT_SWITCH_IRQ);
        	}
        }
	}
	else if (Kernel.readyQueue.size() > 0)
	{
		Kernel.dispatchNextProcess();
	}
};

/**
 * Dispatches the next process to the CPU to be executed. 
 */
Kernel.dispatchNextProcess = function()
{
	var nextProcess = Kernel.getNextProcess();
	
	Kernel.runningProcess = nextProcess;
	nextProcess.status = "Running";
	
	Kernel.memoryManager.setRelocationRegister(nextProcess);
	_CPU.setRegisters(nextProcess);
	_CPU.isExecuting = true;
	
	_Mode = USER_MODE;
};

/**
 * A bit of a hack to simulate a priority queue for priority scheduling.
 * TODO get the real priority queue working. The only thing it breaks is the kill command.
 */
Kernel.getNextProcess = function()
{
	var nextProcess;
	
	if (_SchedulingMode === SCHEDULING_ROUND_ROBIN)
	{
		nextProcess = Kernel.readyQueue.dequeue();
	}
	else
	{
		var processes = Kernel.readyQueue.getContents();
		
		nextProcess = processes[0];
		var processIndex = 0;
		
		for (var i = 1; i < processes.length; i++)
		{
			if (processes[i].schedulingPriority() < nextProcess.schedulingPriority())
			{
				processIndex = i;
				nextProcess = processes[i];
			}
		}
		
		Kernel.readyQueue.remove(processIndex)
	}
	
	return nextProcess;
}

/**
 * Applies the current scheduling mode to the scheduler. It really only changes the quantum to
 * differentiate between FCFS and RR. Throws an exception if processes are running.
 */
Kernel.applySchedulingMode = function()
{
	if (Kernel.runningProcess || Kernel.readyQueue.size() > 0)
		throw "Cannot apply scheduling mode; Processes are active.";	
	
	Kernel.trace("Applying scheduling mode: " + _SchedulingMode);
	
	var processes = [];
	
	switch (_SchedulingMode)
	{
		case SCHEDULING_FCFS:
			// Fall-through
		case SCHEDULING_PRIORITY:
			Kernel.previousQuantum = Kernel.schedulingQuantum;
			Kernel.schedulingQuantum = Number.MAX_VALUE;
			break;
		case SCHEDULING_ROUND_ROBIN:
			Kernel.schedulingQuantum = Kernel.previousQuantum;
			break;
		default:
			throw "Kernel - Invalid scheduling mode.";
	}
}

// ---------- Interrupt Servicing ----------

/**
 * ISR to handle a context switch.
 */
Kernel.contextSwitchIsr = function()
{
	// Check if there is a process running as it may have already completed or been aborted if
	//   either two events coincide with a context switch.
	if (!Kernel.runningProcess)
	{
		Kernel.trace("Context switch aborted: Process already terminated.")
		return;
	}
	
	var nextProcess = Kernel.getNextProcess();
	
	Kernel.trace("Context switch: Process " + Kernel.runningProcess.pid + " -> " + nextProcess.pid);
	
	// Move current process to ready queue.
	Kernel.runningProcess.status = "Ready";
	Kernel.runningProcess.lastAccessTime = _OsClock;
	Kernel.runningProcess.setRegisters(_CPU);
	Kernel.readyQueue.enqueue(Kernel.runningProcess);
	
	// Dequeue next process and start execution.
	Kernel.runningProcess = nextProcess;
	nextProcess.status = "Running";
	
	Kernel.memoryManager.setRelocationRegister(nextProcess);
	_CPU.setRegisters(nextProcess);
	
	// Reset number of cycles
	Kernel.processCycles = 0;
	
	_Mode = USER_MODE;
};

/**
 * ISR for when a process performs an invalid action.
 * 
 * @param {String} message a message describing why the process aborted
 */
Kernel.processFaultIsr = function(message)
{	
	var fullMessage = "Process aborted (PID " + Kernel.runningProcess.pid + ")" + 
			(message ? ": " + message : ".");
			
	Kernel.trace(fullMessage);
	
	if (_KlingonMode)
	{
		_StdIn.advanceLine();
		_StdIn.putText("If it's in your way, knock it down. (PID: " + Kernel.runningProcess.pid + ")");
	}
	else
		_StdIn.putText(fullMessage);
	
	// Stop CPU execution
	_CPU.isExecuting = false;
	_CPU.clearRegisters();
	
	// Move process back to resident list (since it's still in memory)
	Kernel.residentList[Kernel.runningProcess.pid] = Kernel.runningProcess;
	Kernel.runningProcess = null;
};

/**
 * ISR for when a process terminates.
 */
Kernel.processTerminatedIsr = function()
{
	Kernel.trace("Process completed (PID " + Kernel.runningProcess.pid + ").");
	
	// Stop CPU execution
	_CPU.isExecuting = false;
	_CPU.clearRegisters();
	
	// Remove process
	Kernel.memoryManager.deallocate(Kernel.runningProcess);
	Kernel.runningProcess.status = "Terminated";
	Kernel.runningProcess = null;
	
	if (_KlingonMode)
		_StdIn.putText(" Qapla'! ");
};

/**
 * Returns the active processes: those running and in the ready queue.
 * 
 * @return {Array} the active processes
 */
Kernel.getActiveProcesses = function()
{
	var processes = [Kernel.runningProcess];
	
	var readyProcesses = Kernel.readyQueue.getContents();
	
	if (_SchedulingMode !== SCHEDULING_ROUND_ROBIN)
	{
		readyProcesses.sort(function(pcb1, pcb2) {
			return pcb1.schedulingPriority() - pcb2.schedulingPriority();
		});
	}
	
	for (var i = 0; i < readyProcesses.length; i++)
		processes.push(readyProcesses[i]);
		
	return processes;
};
