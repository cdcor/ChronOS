/* ----------
   pcb.js
   
   Defines a Process Control Block (PCB), which stores the information necessary to halt and resume a process.
   ---------- */

function Pcb()
{
    this.pid   = Pcb.lastPid++; // Process ID
    this.pc    = 0;  // Program Counter
    this.xReg  = 0;  // X register
    this.yReg  = 0;  // Y register
    this.zFlag = 0;  // Z-ero flag (Think of it as "isZero")
    
    this.status = "New";
    
    // For memory; to be set by the MMU.
    this.base  = null;
    this.limit = null;
}

Pcb.lastPid = 0;

/**
 * Sets the registers of this PCB based on the registers of the specified CPU.
 * 
 * @param {Object} cpu the CPU 
 */
Pcb.prototype.setRegisters = function(cpu)
{
	this.pc = cpu.pc.data;
	this.xReg = cpu.xReg.data;
	this.yReg = cpu.yReg.data;
	this.zFlag = cpu.zFlag.data;
};

/**
 * Returns a string representation of this PCB. 
 * 
 * @param {Boolean} html (optional) true if the string should be formatted for insertion into an 
 *        html document.
 * 
 * @return {String} a string representation of this PCB
 */
Pcb.prototype.toString = function(html)
{
	var page = Math.floor(this.base / MEMORY_BLOCK_SIZE);
	
	var interChar = html ? ":" : ":";
	var spaceChar = html ? "&nbsp;&nbsp;" : " ";
	
	return "[ PID" + interChar + this.pid + spaceChar + "PC" + interChar + this.pc + spaceChar + 
			"X" + interChar + this.xReg + spaceChar + "Y" + interChar + this.yReg + spaceChar + 
			"Z" + interChar + this.zFlag + spaceChar + "Page" + interChar + page + " ]";
};
