/* ------------
   kernel.js
   
   Requires globals.js, memoryManager.js
   
   Routines for the Operataing System, NOT the host.
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5   
   ------------ */

function Kernel() {}

Kernel.interruptQueue = null;
Kernel.buffers = null;
Kernel.inputQueue = null; 

Kernel.memoryManager = null;

Kernel.residentList = null;
Kernel.readyQueue = null;
Kernel.runningProcess = null;

Kernel.keyboardDriver = null;

// ---------- OS Startup and Shutdown Routines ----------

Kernel.bootstrap = function() // Page 8.
{
    Control.log("Bootstrap.", "Host");
    
    // Queues and buffers.
    Kernel.interruptQueue = new Queue();
    Kernel.buffers = new Array();
    Kernel.inputQueue = new Queue();
    
    // Memory Manager
    Kernel.memoryManager = new MemoryManager();
    
    // Process Lists/Queues
    Kernel.residentList = new Array();
    Kernel.readyQueue = new Queue();
    
    // Initialize the Console.
    _Console = new Console(Control.getCanvas());
    
    // Initialize standard input and output to the _Console.
    _StdIn  = _Console;
    _StdOut = _Console;
    
    // Load the Keyboard Device Driver
    Kernel.trace("Loading the keyboard device driver.");
    Kernel.keyboardDriver = new DeviceDriverKeyboard();
    Kernel.keyboardDriver.driverEntry();
    Kernel.trace(Kernel.keyboardDriver.status);    
    
    // More?
    
    // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
    Kernel.trace("Enabling the interrupts.");
    Kernel.enableInterrupts();
    // Launch the shell.
    Kernel.trace("Creating and launching the shell.");
    _OsShell = new Shell();
};

Kernel.shutdown = function()
{
    Kernel.trace("Begin shutdown OS.");
    StatusBar.setStatus("Shutting down...");
    
    // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...    
    // ... Disable the Interruupts.
    Kernel.trace("Disabling the interrupts.");
    Kernel.disableInterrupts();
    // 
    // Unload the Device Drivers?
    // More?
    //
    Kernel.trace("End shutdown OS.");
    StatusBar.setStatus("Shutdown");
};

Kernel.onCpuClockPulse = function(button)
{
    // This gets called from the host hardware every time there is a hardware clock pulse. 
    // This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
    // This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel 
    // that it has to look for interrupts and process them if it finds any.
    // Check for an interrupt, are any. Page 560

    // Check for an interrupt, are any. Page 560
    if (Kernel.interruptQueue.getSize() > 0)
    {
        var interrupt = Kernel.interruptQueue.dequeue();
        Kernel.interruptHandler(interrupt.irq, interrupt.params); 
    }
    else if (_CPU.isExecuting) // If there are no interrupts then run a CPU cycle if there is anything being processed.
    {
    	// If single step is not enabled, cycle the CPU regularly.
    	//   Else single step is enabled, only cycle when the step button is pressed
    	//   (it is passed to this function when it is pressed)
    	if (!Control.singleStep || button != null)
        	_CPU.cycle();
    }
    else if (Kernel.readyQueue.getSize() > 0)
    {
    	Kernel.dispatchNextProcess();
    }
    else // If there are no interrupts and there is nothing being executed then just be idle.
    {
        Kernel.trace("Idle");
    }
};

// Loads the specified code into memory.
Kernel.loadMemory = function(code)
{
    Kernel.trace("Loading program.");
    
    // Create new PCB for the program.
    var pcb = new Pcb();
    
     // Allcate memory.
    var isAllocated = Kernel.memoryManager.allocate(pcb);
    
    if (isAllocated)
    {
    	// Set relocation register.
	    Kernel.memoryManager.setRelocationRegister(pcb);
	    
	    Kernel.trace("Loading code into memory. Base address: " + pcb.base);
	    
	    // Load into memory.
	    codePieces = code.split(" ");
	    
	    for (var address = 0; address < codePieces.length; address++)
	    {
	    	try
	    	{
	    		Kernel.memoryManager.write(address, codePieces[address]);
	    	}
	    	catch(error)
	    	{
	    		Kernel.trace("Load failed: " + error);
	    		_StdIn.putText("Load failed: " + error);
	    		
	    		Kernel.memoryManager.deallocate(pcb);
	    		
	    		return;
	    	}
	    }
	    
	    // Send the PID to the console.
		_StdIn.putText("PID: " + pcb.pid);
		MemoryDisplay.informNewData(pcb.base);
		
		// Place on resident list
		Kernel.residentList[pcb.pid] = pcb;
		pcb.status = "Resident";
	}
	else
	{
		_StdIn.putText("Not enough memory for process.");
	}
};

// Runs the specified process (i.e. moves it from the resident list to the ready queue).
Kernel.runProcess = function(pid)
{
	// Get the PCB.
	var pcb = Kernel.residentList[pid];
	
	// Check if the PCB defines a valid process.
	if (pcb != null)
	{
		Kernel.trace("Running process: " + pid);
		// Place on the ready queue.
		Kernel.readyQueue.enqueue(pcb);
		pcb.status = "Ready";
		// Remove from resident list.
		Kernel.residentList[pid] = undefined;
	}
	else // Process does not exist.
		_StdIn.putText("There is no process with that ID.");
};

// Dispatches the specified process to the CPU to be executed.
Kernel.dispatchNextProcess = function()
{
	var pcb = Kernel.readyQueue.dequeue();
	
	Kernel.runningProcess = pcb;
	
	Kernel.memoryManager.setRelocationRegister(pcb);
	_CPU.setRegisters(pcb);
	_CPU.isExecuting = true;
};

// ---------- Interrupt servicing ----------

Kernel.enableInterrupts = function()
{
    // Keyboard
    Control.enableKeyboardInterrupt();
    // More...?
};

Kernel.disableInterrupts = function()
{
    // Keyboard
    Control.disableKeyboardInterrupt();
    // More...?
};

// This is the Interrupt Handler Routine.  Page 8.
Kernel.interruptHandler = function(irq, params)
{
    // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
    Kernel.trace("Handling IRQ~" + irq);

    // Save CPU state. (I think we do this elsewhere.)

    // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
    // TODO: Use Interrupt Vector in the future.
    // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.  
    //       Maybe the hardware simulation will grow to support/require that in the future.
    switch (irq)
    {
        case TIMER_IRQ: 
            Kernel.timerIsr();                   // Kernel built-in routine for timers (not the clock).
            break;
        case KEYBOARD_IRQ: 
            Kernel.keyboardDriver.isr(params);   // Kernel mode device driver
            _StdIn.handleInput();
            break;
        case PROCESS_FAULT_IRQ:
        	Kernel.processFaultIsr(params);
        	break;
        case PROCESS_TERMINATED_IRQ:
        	Kernel.processTerminatedIsr();
        case SYSTEM_CALL_IRQ:
        	Kernel.systemCallIsr(params);
        	break;
        default: 
            Kernel.trapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
    }

    // 3. Restore the saved state.  TODO: Question: Should we restore the state via IRET in the ISR instead of here? p560.
};

// The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
Kernel.timerIsr = function()  
{
    // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
};

// ISR for when a process performs an invalid action.
Kernel.processFaultIsr = function(message)
{	
	var fullMessage = "Process aborted (PID " + Kernel.runningProcess.pid + ")" + (message != null ? ": " + message : ".");
	Kernel.trace(fullMessage);
	_StdIn.putText(fullMessage);
	
	// Stop CPU execution
	_CPU.isExecuting = false;
	_CPU.clearRegisters();
	
	// Move process back to resident list (since it's still in memory)
	Kernel.residentList[Kernel.runningProcess.pid] = Kernel.runningProcess;
	Kernel.runningProcess = null;
};

// ISR for when a process terminates.
Kernel.processTerminatedIsr = function()
{
	Kernel.trace("Process completed (PID " + Kernel.runningProcess.pid + ").");
	
	// Stop CPU execution
	_CPU.isExecuting = false;
	_CPU.clearRegisters();
	
	// Remove process
	Kernel.memoryManager.deallocate(Kernel.runningProcess);
	Kernel.runningProcess = null;
};

Kernel.systemCallIsr = function(param)
{
	if (param == 1)
		_StdIn.putText("" + _CPU.yReg.data);
	else if (param == 2)
	{
		var address = _CPU.yReg.data;
		var data = null;
		
		while (data !== 0)
		{
			data = Kernel.memoryManager.read(address);
			_StdIn.putText(String.fromCharCode(data));
			address++;
		}
	}
};

// ---------- OS Utility Routines ----------

Kernel.trace = function(message)
{
    // Check globals to see if trace is set ON.  If so, then (maybe) log the message. 
    if (_Trace)
    {
        if (message === "Idle")
        {
            // Don't log every idle clock pulse.
            if (_OSclock % 10 == 0)  // Dependent on CPU_CLOCK_INTERVAL
                Control.log(message, "OS");
        }
        else
            Control.log(message, "OS");
    }
};

Kernel.trapError = function(message)
{
    Control.log("OS ERROR - TRAP: " + message);
    
    // Show BSoD
    _StdIn.bsod();

	Control.hostHalt();
    //Kernel.shutdown();
};