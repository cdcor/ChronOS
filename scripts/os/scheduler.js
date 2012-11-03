/* ----------
   scheduler.js
   
   Requires kernel.js
   
   An extension of the kernel to handle CPU scheduling using a round robin algorithm.
   ---------- */

// The round robin scheduling quantum.
Kernel.schedulingQuantum = DEFAULT_SCHEDULING_QUATUM;

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
	var pcb = Kernel.residentList[pid];
	
	// Check if the PCB defines a valid process.
	if (pcb)
	{
		Kernel.trace("Running process: " + pid);
		// Place on the ready queue.
		Kernel.readyQueue.enqueue(pcb);
		pcb.status = "Ready";
		// Remove from resident list.
		Kernel.residentList[pid] = null;
	}
	else // Process does not exist.
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
        		Kernel.interruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ));
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
	var nextProcess = Kernel.readyQueue.dequeue();
	
	Kernel.runningProcess = nextProcess;
	nextProcess.status = "Running";
	
	Kernel.memoryManager.setRelocationRegister(nextProcess);
	_CPU.setRegisters(nextProcess);
	_CPU.isExecuting = true;
	
	_Mode = USER_MODE;
};

// ---------- Interrupt Servicing ----------

/**
 * ISR to handle a context switch.
 */
Kernel.contextSwitchIsr = function()
{
	var nextProcess = Kernel.readyQueue.dequeue();
	
	Kernel.trace("Context switch: Process " + Kernel.runningProcess.pid + " -> " + nextProcess.pid);
	
	// Move current process to ready queue.
	Kernel.runningProcess.status = "Ready";
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
