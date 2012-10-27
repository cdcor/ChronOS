/* ------------  
   control.js

   Requires global.js, jquery-1.8.1.min.js, jquery-ui-1.8.23.custom.min.js.
   
   Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code that
   hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in 
   both the host and client environments.
   
   This (and other host/simulation scripts) is the only place that we should see "web" code, like 
   DOM manipulation and JavaScript event handling, and so on.  (index.html is the only place for markup.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
  
// Document Initialization
$(document).ready(function() 
{
    Control.init();
});

// When the windows is resized...
$(window).resize(function() {
	//Control.windowResized();
});

function Control() {}

// Initializes the necessary elements to simulate the virtual machine in the browser.
Control.init = function() 
{
    // Set up the web stuff
    $("#tableContent").hide();
    
    StatusBar.setStatus("Shutdown");
    
    CpuDisplay.init();
    MemoryDisplay.init();
    
    ProgramInput.init();
    DisplaySecret.init();
    
    Control.windowResized();
};

Control.windowResized = function()
{
    $("#mainContainer").css("width", window.innerWidth);
    DisplaySecret.resize();
};

Control.getCanvas = function()
{
    return $('#display')[0];
};

// Logs a message to the host's log.
Control.log = function(message, source)
{
    // Check the source.
    if (!source)
        source = '?';

    // Note the OS CLOCK.
    var clock = _OSclock;

    // Update the log console.
    Log.add(message, source, clock);
    // Optionally udpate a log database or some streaming service.
};

// Simulates starting the machine given the start "button."
Control.hostStart = function(button)
{
    if (button) // The button called this function
    {
        // Disable the start button...
        button.disabled = true;
    
        // Start starting animation
        StatusBar.setStatus("Starting...");
        $('#tableContent').fadeIn(500, Control.hostStart);
    }
    else // This function is calling the second part of this function after the animation.
    {
        // Enable the Halt and Reset buttons ...
        document.getElementById("btnHaltOS").disabled = false;
        document.getElementById("btnReset").disabled = false;
        
        // Create and initialize the CPU
        _CPU = new Cpu();
        
        // Then set the clock pulse simulation.
        Control.hardwareClockId = setInterval(Control.clockPulse, CPU_CLOCK_INTERVAL);
        // Call the OS Kernel Bootstrap routine.
        Kernel.bootstrap();
        
        // Indicate to user that the machine has started.
        StatusBar.setStatus("Operating");
    }
};

// Simulates halting the machine given the halt "button."
Control.hostHalt = function(button)
{
    if (!button)
        button = document.getElementById("btnHaltOS");
        
    button.disabled = true;
    
    Control.log("Emergency halt.", "Host");
    Control.log("Attempting Kernel shutdown.", "Host");
    
    // Call the OS sutdown routine.
    Kernel.shutdown();
    // Stop the JavaScript interval that's simulating our clock pulse.
    clearInterval(Control.hardwareClockId);
    
    // TODO: Is there anything else we need to do here?
    
    // Indicate to user the OS has halted
    StatusBar.setStatus("Halted");
};

// Simulates reseting the machine given the reset "button."
Control.hostReset = function(button)
{
    if (button)
    {
        StatusBar.setStatus("Shutting down...");
        $('#tableContent').fadeOut(500, Control.hostReset);
    }
    else
    {
        // The easiest and most thorough way to do this is to reload (not refresh) the document.
        location.reload(true);
    }
};

Control.hardwareClockId = null;
Control.singleStep = false;

// Toggles the single step functionality
Control.toggleSingleStep = function()
{
	if (Control.singleStep)
	{
		$("#chkbxSingleStep").css("background-image", "url('images/check-empty.png')");
		if (Control.hardwareClockId == null)
			Control.hardwareClockId = setInterval(Control.clockPulse, CPU_CLOCK_INTERVAL);
	}
	else
	{
		$("#chkbxSingleStep").css("background-image", "url('images/check-full.png')");
	}
	
	Control.singleStep = !Control.singleStep;
}

Control.clockPulse = function(button)
{
    // Increment the hardware (host) clock.
   	_OSclock++;
   	// Call the kernel clock pulse event handler.
   	Kernel.onCpuClockPulse(button);
   	
   	// If the CPU is not executing, update the displays regardless of single step status.
   	//   Else the CPU is executing, don't update if single step is enabled unless the single step
   	//   button was pressed.
   	// When this function is called by the interval, no button is passed in.
   	if (!_CPU.isExecuting || !Control.singleStep || button != null)
   	{
	   	// Update the CPU display.
	    CpuDisplay.update();
	    // Update the memory display.
	    MemoryDisplay.update();
    }
};

Control.onKeypress = function(event)
{
    // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
    if (event.target.id == "display")
    {
        event.preventDefault();
        // Note the pressed key code in the params (Mozilla-specific).
        var params = new Array(event.which, event.shiftKey, event.ctrlKey);
        // Enqueue this interrupt on the kernal interrupt queue so that it gets to the Interrupt handler.
        Kernel.interruptQueue.enqueue(new Interrupt(KEYBOARD_IRQ, params));
    }
};

Control.enableKeyboardInterrupt = function()
{
    // Listen for key presses (keydown, actually) in the document 
    // and call the simulation processor, which will in turn call the 
    // os interrupt handler.
    document.addEventListener("keydown", Control.onKeypress, false);
};

Control.disableKeyboardInterrupt = function()
{
    document.removeEventListener("keydown", Control.onKeypress, false);
};