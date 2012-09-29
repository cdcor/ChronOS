/* ------------  
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
  
// ---------- Global Constants ----------
var APP_NAME = "ChronOS";
var APP_VERSION = "0.1";

var MAX_LOG_SIZE = 5000; // in number of characters

var CPU_CLOCK_INTERVAL = 100;   // in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ    = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority). 
                       // NOTE: The timer is different from hardware clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;

// Console
var DEFAULT_FONT = "sans";
var DEFAULT_FONT_SIZE = 13;     
var FONT_HEIGHT_MARGIN = 4; // Additional space added to font size when advancing a line.

// ---------- Global Variables ----------
var _CPU = null;

var _OSclock = 0; // Page 23.

var _Mode = 0; // 0 = Kernel Mode, 1 = User Mode.  See page 21.

// Default the OS trace to be on.
var _Trace = true;

// OS queues
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console = null;
var _OsShell = null;