/* ------------
   kernel.js
   
   Requires globals.js
   
   Routines for the Operataing System, NOT the host.
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5   
   ------------ */

function Kernel() {}

Kernel.interruptQueue = null;
Kernel.buffers = null;
Kernel.inputQueue = null; 

Kernel.keyboardDriver = null;

// ---------- OS Startup and Shutdown Routines ----------

Kernel.bootstrap = function() // Page 8.
{
    Control.log("bootstrap", "host");
    
    Kernel.interruptQueue = new Queue();
    Kernel.buffers = new Array();
    Kernel.inputQueue = new Queue();
    
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

Kernel.onCpuClockPulse = function()
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
        _CPU.cycle();
    }
    else // If there are no interrupts and there is nothing being executed then just be idle.
    {
        Kernel.trace("Idle");
    }
};

Kernel.enableInterrupts = function()
{
    // Keyboard
    Control.enableKeyboardInterrupt();
    // More...
};

Kernel.disableInterrupts = function()
{
    // Keyboard
    Control.disableKeyboardInterrupt();
    // More...
};

Kernel.interruptHandler = function(irq, params)    // This is the Interrupt Handler Routine.  Page 8.
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
        default: 
            Kernel.trapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
    }

    // 3. Restore the saved state.  TODO: Question: Should we restore the state via IRET in the ISR instead of here? p560.
};

Kernel.timerIsr = function()  // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
{
    // Check multiprogramming parameters and enfore quanta here. Call the scheduler / context switch here if necessary.
};

// ---------- OS Utility Routines ----------

Kernel.trace = function(message)
{
    // Check globals to see if trace is set ON.  If so, then (maybe) log the message. 
    if (_Trace)
    {
        if (message === "Idle")
        {
            // We can't log every idle clock pulse because it would lag the browser very quickly.
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

    Kernel.shutdown();
};