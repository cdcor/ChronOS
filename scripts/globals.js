/* ------------  
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
  
// ---------- Global Constants ----------

// General
var APP_NAME = "ChronOS";
var APP_VERSION = "0.1";

var MAX_LOG_SIZE = 5000; // in number of characters

// Host stuff
var CPU_CLOCK_INTERVAL = 100;   // in ms, or milliseconds, so 1000 = 1 second.

var MEMORY_SIZE = 768; // In bytes
var MEMORY_BLOCK_SIZE = 256; // Block of memory to assign to a process, ideally should be a factor of MEMORY_SIZE.

var MEMORY_DISPLAY_ADDRESSES_PER_LINE = 6; // Addresses per line to display.

// IRQs
var TIMER_IRQ    = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority). 
                       // NOTE: The timer is different from hardware clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var PROCESS_FAULT_IRQ = 2;
var PROCESS_TERMINATED_IRQ = 3;
var CONTEXT_SWITCH_IRQ = 4;
var SYSTEM_CALL_IRQ = 5;

// Console
var DEFAULT_FONT = "sans";
var DEFAULT_FONT_SIZE = 13;     
var FONT_HEIGHT_MARGIN = 4; // Additional space added to font size when advancing a line.

// OS
var KERNEL_MODE = 0;
var USER_MODE = 1;

var DEFAULT_SCHEDULING_QUATUM = 6;


// ---------- Global Variables ----------

var _CPU = null;

var _OSclock = 0; // Page 23.

var _Mode = KERNEL_MODE; // Page 21.

// Default the OS trace to be on.
var _Trace = true;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console = null;
var _OsShell = null;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

var _KlingonMode = false;