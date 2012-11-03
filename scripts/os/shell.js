/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) or interpreter for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell()
{
    // Properties
    this.promptStr   = ">";
    this.commandList = [];
    this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies   = "[sorry]";
    
    this.init();
}

Shell.prototype.init = function()
{
    var sc = null;
    
    // Load the command list.

    // ver
    sc = new ShellCommand();
    sc.command = "ver";
    sc.description = "- Displays the current version data."
    sc.funct = shellVer;
    this.commandList.push(sc);
    
    // help
    sc = new ShellCommand();
    sc.command = "help";
    sc.description = "- This is the help command. Seek help."
    sc.funct = shellHelp;
    this.commandList.push(sc);
    
    // shutdown
    sc = new ShellCommand();
    sc.command = "shutdown";
    sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running."
    sc.funct = shellShutdown;
    this.commandList.push(sc);

    // cls
    sc = new ShellCommand();
    sc.command = "cls";
    sc.description = "- Clears the screen and resets the cursor position."
    sc.funct = shellCls;
    this.commandList.push(sc);

    // man <topic>
    sc = new ShellCommand();
    sc.command = "man";
    sc.description = "<topic> - Displays the MANual page for <topic>.";
    sc.funct = shellMan;
    this.commandList.push(sc);
    
    // trace <on | off>
    sc = new ShellCommand();
    sc.command = "trace";
    sc.description = "<on | off> - Turns the OS trace on or off.";
    sc.funct = shellTrace;
    this.commandList.push(sc);

    // rot13 <string>
    sc = new ShellCommand();
    sc.command = "rot13";
    sc.description = "<string> - Does rot13 obfuscation on <string>.";
    sc.funct = shellRot13;
    this.commandList.push(sc);

    // prompt <string>
    sc = new ShellCommand();
    sc.command = "prompt";
    sc.description = "<string> - Sets the prompt.";
    sc.funct = shellPrompt;
    this.commandList.push(sc);

    // date
    sc = new ShellCommand();
    sc.command = "date";
    sc.description = "- Displays the current time.";
    sc.funct = shellDate;
    this.commandList.push(sc);

    // status
    sc = new ShellCommand();
    sc.command = "status";
    sc.description = "<string> - Sets the current status.";
    sc.funct = shellStatus;
    this.commandList.push(sc);

    // whereami
    sc = new ShellCommand();
    sc.command = "whereami";
    sc.description = "- Displays your location.";
    sc.funct = shellWhereAmI;
    this.commandList.push(sc);
    
    // fail
    sc = new ShellCommand();
    sc.command = "fail";
    sc.description = "- Produce an OS error to be trapped.";
    sc.funct = shellTrap;
    this.commandList.push(sc);
    
    // klingon mode
    sc = new ShellCommand();
    sc.command = "quv"
    sc.description = "'ej batlh - ???";
    sc.funct = ControlMode.toggleKlingonMode;
    this.commandList.push(sc);
    
    // load
    sc = new ShellCommand();
    sc.command = "load";
    sc.description = "- Loads the machine code into memory.";
    sc.funct = shellLoad;
    this.commandList.push(sc);
    
    // run
    sc = new ShellCommand();
    sc.command = "run";
    sc.description = "<PID0> [<PID1> ...] - Runs the given processes.";
    sc.funct = shellRunProcess;
    this.commandList.push(sc);

	// round-robin quantum
	sc = new ShellCommand();
	sc.command = "quantum"
	sc.description = "<value> - Sets the round robin quantum.";
	sc.funct = shellSetRoundRobinQuantum;
	this.commandList.push(sc);

    // processes - list the running processes and their IDs
    // kill <id> - kills the specified process id.

    //
    // Display the initial prompt.
    this.putPrompt();
};

Shell.prototype.putPrompt = function()
{
    _StdIn.putText(this.promptStr);
};

Shell.prototype.handleInput = function(buffer)
{
    Kernel.trace("Shell Command~" + buffer);
    // 
    // Parse the input...
    //
    var userCommand = new UserCommand();
    userCommand = this.parseInput(buffer);
    // ... and assign the command and args to local variables.
    var cmd = userCommand.command;
    
    if (cmd == "")
    {
    	_StdIn.advanceLine();
    	this.putPrompt();
    	return;
    }
    
    var args = userCommand.args;
    //
    // Determine the command and execute it.
    //
    // Javascript may not support associative arrays (one of the few nice features of PHP, actually)
    // so we have to iterate over the command list in attempt to find a match.  TODO: Is there a better way?
    var index = 0;
    var found = false;
    while (!found && index < this.commandList.length)
    {
        if (this.commandList[index].command === cmd)
        {
            found = true;
            fn = this.commandList[index].funct;
        }
        else
        {
            ++index;
        }
    }
    if (found)
    {
        this.execute(fn, args);
    }
    else
    {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
        {
            this.execute(shellCurse);
        }
        else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apoligies.
        {
            this.execute(shellApology);
        }
        else    // It's just a bad command.
        {
            this.execute(shellInvalidCommand);
        }
    }
};


Shell.prototype.parseInput = function(buffer)
{
    var retVal = new UserCommand();
    //
    // 1. Remove leading and trailing spaces.
    buffer = trim(buffer);
    // 2. Lower-case it.
    //buffer = buffer.toLowerCase();
    // 3. Separate on spaces so we can determine the command and command-line args, if any.
    var tempList = buffer.split(" ");
    // 4. Take the first (zeroth) element and use that as the command.
    var cmd = tempList.shift();
    // 4.1 Remove any left-over spaces.
    cmd = trim(cmd);
    // 4.2 Record it in the return value.
    retVal.command = cmd;
    // 5. Now create the args array from what's left.
    for (var i in tempList)
    {
        var arg = trim(tempList[i]);
        if (arg != "")
        {
            retVal.args[retVal.args.length] = tempList[i];
        }
    }
    return retVal;
};


Shell.prototype.execute = function(fn, args)
{
    // we just got a command, so advance the line... 
    _StdIn.advanceLine();
    // .. call the command function passing in the args...
    fn(args);
    // Check to see if we need to advance the line again
    if (_StdIn.currentXPosition > 8)
    {
        _StdIn.advanceLine();
    }
    // ... and finally write the prompt again.
    this.putPrompt();
};


//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect Javascript, we'd be 
// able to make then private.  (Actually, we can. Someone look at Crockford's stuff and give me the details, please.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()     
{
    // Properties
    this.command = "";
    this.description = "";
    this.funct = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
    // Properties
    this.command = "";
    this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode)
    {
        _StdIn.putText("Duh. Go back to your Speak & Spell.");
    }
    else
    {
        _StdIn.putText("Type 'help' for, well... help.");
    }
}

function shellCurse()
{
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
}

function shellApology()
{
    _StdIn.putText("Okay. I forgive you. This time.");
    _SarcasticMode = false;
}

function shellVer(args)
{
    _StdIn.putText(APP_NAME + " version " + APP_VERSION);    
}

function shellHelp(args)
{
    _StdIn.putText("Commands:");
    for (i in _OsShell.commandList)
    {
        _StdIn.advanceLine();
        _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
    }    
}

function shellShutdown(args)
{
     _StdIn.putText("Shutting down...");
     // Call Kernal shutdown routine.
    krnShutdown();   
    // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
    _StdIn.clearScreen();
    _StdIn.resetXY();
}

function shellMan(args)
{
    if (args.length > 0)
    {
        var topic = args[0];
        switch (topic)
        {
            case "help": 
                _StdIn.putText("Help displays a list of (hopefully) valid commands.");
                break;
            default:
                _StdIn.putText("No manual entry for " + args[0] + ".");
        }        
    }
    else
    {
        _StdIn.putText("Usage: man <topic>  Please supply a topic.");
    }
}

function shellTrace(args)
{
    if (args.length > 0)
    {
        var setting = args[0];
        switch (setting)
        {
            case "on": 
                if (_Trace && _SarcasticMode)
                {
                    _StdIn.putText("Trace is already on, dumbass.");
                }
                else
                {
                    _Trace = true;
                    _StdIn.putText("Trace ON");
                }
                
                break;
            case "off": 
                _Trace = false;
                _StdIn.putText("Trace OFF");                
                break;                
            default:
                _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
        }        
    }
    else
    {
        _StdIn.putText("Usage: trace <on | off>");
    }
}

function shellRot13(args)
{
    if (args.length > 0)
    {
        _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
    }
    else
    {
        _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
}

function shellPrompt(args)
{
    if (args.length > 0)
    {
        if (args[0].length > 8)
            _StdIn.putText("That prompt is too long.");
        else
            _OsShell.promptStr = args[0];
    }
    else
    {
        _StdIn.putText("Usage: prompt <string>  Please supply a string.");
    }
}

function shellDate()
{
    _StdIn.putText(StatusBar.getCurrentTime());
}

function shellStatus(args)
{
    if (args.length > 0)
    {
        if (args[0].length > 20)
            _StdIn.putText("That status is too long.");
        else
            StatusBar.setStatus(args[0]);
    }
    else
        _StdIn.putText("Usage: status <string>  Please supply a string.");
}

function shellWhereAmI()
{
    // See: http://stackoverflow.com/questions/391979/get-client-ip-using-just-javascript
    if (window.XMLHttpRequest) 
        xmlhttp = new XMLHttpRequest();
    else 
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.open("GET", "http://api.hostip.info/get_html.php", false);
    xmlhttp.send();

    hostipInfo = xmlhttp.responseText.split("\n");

    for (i = 0; hostipInfo.length >= i; i++) {
        ipAddress = hostipInfo[i].split(":");
        if (ipAddress[0] === "IP") 
        {
            _StdIn.putText(ipAddress[1]);
            return;
        }
    }

    _StdIn.putText("unknown");
}

function shellTrap()
{
    // Create trap error.
    Kernel.trapError("MWAHAHAHA");
    // Indicate to user what has happened.
    StatusBar.setStatus("BSoD");
}

function shellLoad()
{
	var input = ProgramInput.get();
	
	if (input == "")
		_StdIn.putText("No program to load.");
	else
	{
		_StdIn.putText("Loading program...");
		_StdIn.advanceLine();
		Kernel.loadMemory(input);
	}
}

function shellRunProcess(args)
{
	if (args.length > 0)
	{
		var pid;
		for (var i in args)
		{
			pid = parseInt(args[i])
			
			if (!isNaN(pid))
				Kernel.runProcess(pid);
			else
				_StdIn.putText("Process ID: " + args[i] + " is invalid.");
		}
	}
	else
		_StdIn.putText("Usage: run <PID>  Please supply a process ID.");
}

function shellSetRoundRobinQuantum(args)
{
	if (args.length > 0)
	{
		var quantum = parseInt(args[0]);
		
		if (!isNaN(quantum) || quantum < 1)
			Kernel.schedulingQuantum = quantum;
		else
			_StdIn.putText("The quantum must a nonzero integer.");
	}
	else
		_StdIn.putText("Usage: quantum <value>  Please supply a value.");
}
