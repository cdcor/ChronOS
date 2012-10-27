/* ----------
   pcb.js
   
   Defines a Process Control Block (PCB), which stores the information necessary to halt and resume a process.
   ---------- */

function Pcb()
{
    // Properties
    this.pid   = Pcb.lastPid++; // Process ID
    this.pc    = 0;  // Program Counter
    this.xReg  = 0;  // X register
    this.yReg  = 0;  // Y register
    this.zFlag = 0;  // Z-ero flag (Think of it as "isZero".)
    
    this.status = "New";
    
    // For memory; to be set by the MMU.
    this.base  = null;
    this.limit = null;
}

Pcb.lastPid = 0;

// Sets the registers of this PCB based on the registers of the specified CPU.
Pcb.prototype.setRegisters = function(cpu)
{
	this.pc = cpu.pc;
	this.xReg = cpu.xReg;
	this.yReg = cpu.yReg;
	this.zFlag = cpu.zFlag;
};
