/* ------------  
   cpu.js

   Requires global.js.
   
   Routines for the host CPU simulation, NOT for the OS itself.  
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   
   Note that PC incrementing is done outside of other staements so the value stays true in the case of an error.
   ------------ */

function Cpu()
{
    this.pc    = new Register();     // Program Counter
    this.ir    = 0;                  // Instruction register
    this.op    = null;               // Holds the decoded instruction
    
    this.acc   = new Register();     // Accumulator
    
    this.xReg  = new Register();     // X register
    this.yReg  = new Register();     // Y register
    this.zFlag = new Register();     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;
}

/**
 * Sets the registers of this CPU based on the contents of the specified PCB.
 * 
 * @param {Pcb} pcb the PCB.
 */
Cpu.prototype.setRegisters = function(pcb)
{
	this.pc.write(pcb.pc);
	this.acc.write(pcb.acc);
	this.xReg.write(pcb.xReg);
	this.yReg.write(pcb.yReg);
	this.zFlag.write(pcb.zFlag);
};

/**
 * Sets the registers of this CPU to 0.
 */
Cpu.prototype.clearRegisters = function()
{
	this.pc.write(0);
	this.acc.write(0);
	this.xReg.write(0);
	this.yReg.write(0);
	this.zFlag.write(0);
};

/**
 * The main CPU cycle to be executed every clock pulse.
 */
Cpu.prototype.cycle = function()
{
    Kernel.trace("CPU cycle.");
    // TODO: Accumulate CPU usage and profiling statistics here.
    
    this.fetch();
    this.decode();
    this.execute();
};

// ---------- CPU Cycle steps ----------

/**
 * Fetches the next instruction from memory and increments the PC or faults if the fetch fails.
 */
Cpu.prototype.fetch = function()
{
	try
	{
		this.ir = Kernel.memoryManager.read(this.pc.data);
		this.pc.increment();
	}
	catch(error) // Memory access out of bounds error.
	{
		this.fault(error);
	}
};

/**
 * "Decodes" the instruction in the instruction register.
 */
Cpu.prototype.decode = function()
{
	this.op = this.opCodes[this.ir];
};

/**
 * Executes the decoded instruction or faults if the instruction is invalid.
 */
Cpu.prototype.execute = function()
{
	if (this.op == null)
		this.fault("Invalid operation.");
	else
	{
		try
		{
			this.op();
		}
		catch (e)
		{
			this.fault(e);
		}
	}
};

// ---------- Interrupt ----------

/**
 * Equeues a new interrupt in the case of the CPU fault.
 * 
 * @param {String} message a descript of why the fault occurred
 */
Cpu.prototype.fault = function(message)
{
	Kernel.interrupt(PROCESS_FAULT_IRQ, message);
};

// ---------- Operations ----------

Cpu.prototype.loadAccWithConstant = function() // A9
{
	this.acc.write(Cpu.toDecimal(this.readFromMemory(1)));
};

Cpu.prototype.loadAccFromMemory = function() // AD
{
	this.acc.write(Cpu.toDecimal(Kernel.memoryManager.read(this.readFromMemory(2))));
};

Cpu.prototype.storeAccInMemory = function() // 8D
{	
	Kernel.memoryManager.write(this.readFromMemory(2), Cpu.toTwosComplement(this.acc.read()));
};

Cpu.prototype.addWithCarry = function() // 6D
{
	this.acc.increment(Cpu.toDecimal(Kernel.memoryManager.read(this.readFromMemory(2))));
};

Cpu.prototype.loadXRegWithConstant = function() // A2
{
	this.xReg.write(Cpu.toDecimal(this.readFromMemory(1)));
};

Cpu.prototype.loadXRegFromMemory = function() // AE
{
	this.xReg.write(Cpu.toDecimal(Kernel.memoryManager.read(this.readFromMemory(2))));
};

Cpu.prototype.loadYRegWithConstant = function() // A0
{
	this.yReg.write(Cpu.toDecimal(this.readFromMemory(1)));
};

Cpu.prototype.loadYRegFromMemory = function() // AC
{
	this.yReg.write(Cpu.toDecimal(Kernel.memoryManager.read(this.readFromMemory(2))));
};

Cpu.prototype.noOperation = function() // EA
{
	// Do nothing - this function must still exist however, otherwise the CPU will see the
	//   opcode "EA" as an invalid instruction and cause a fault.
};

Cpu.prototype.breakOp = function() // 00
{
	Kernel.interrupt(PROCESS_TERMINATED_IRQ);
};

Cpu.prototype.compareXReg = function() // EC
{
	if (this.xReg.read() == Cpu.toDecimal(Kernel.memoryManager.read(this.readFromMemory(2))))
		this.zFlag.write(1);
	else
		this.zFlag.write(0);
};

Cpu.prototype.branchIfZero = function() // D0
{
	if (this.zFlag.read() == 0) 
	{
	    // Original method: use two's complement to branch
	    //this.pc.increment(Cpu.toDecimal(this.readFromMemory(1)));
	    
	    // Subtract memory block size if branch causes PC >= memory block size
	    this.pc.increment(this.readFromMemory(1));
	    
	    if (this.pc.data >= MEMORY_BLOCK_SIZE) {
	        this.pc.increment(-MEMORY_BLOCK_SIZE);
	    }
	}
	else
		this.pc.increment();
};

Cpu.prototype.incrementByte = function() // EE
{
	var address = this.readFromMemory(2);
	var value = Cpu.toDecimal(Kernel.memoryManager.read(address));
	Kernel.memoryManager.write(address, Cpu.toTwosComplement(value + 1));
};

Cpu.prototype.systemCall = function() // FF
{
	if (this.xReg.read() === 1)
	{
		Kernel.interrupt(SYSTEM_CALL_IRQ, 1);
	}
	else if (this.xReg.read() === 2)
	{
		Kernel.interrupt(SYSTEM_CALL_IRQ, 2);
	}
};

/**
 * The CPU's opcodes. Opcodes located in this map and having a valid associating function will be 
 * seen as valid. Note this map must be placed after the operation functions.
 */
Cpu.prototype.opCodes = {
	0xA9 : Cpu.prototype.loadAccWithConstant,
	0xAD : Cpu.prototype.loadAccFromMemory,
	0x8D : Cpu.prototype.storeAccInMemory,
	0x6D : Cpu.prototype.addWithCarry,
	0xA2 : Cpu.prototype.loadXRegWithConstant,
	0xAE : Cpu.prototype.loadXRegFromMemory,
	0xA0 : Cpu.prototype.loadYRegWithConstant,
	0xAC : Cpu.prototype.loadYRegFromMemory,
	0xEA : Cpu.prototype.noOperation,
	0x00 : Cpu.prototype.breakOp,
	0xEC : Cpu.prototype.compareXReg,
	0xD0 : Cpu.prototype.branchIfZero,
	0xEE : Cpu.prototype.incrementByte,
	0xFF : Cpu.prototype.systemCall
};

// ---------- Helper functions ----------

/**
 * Returns the next specified number of values in memory according to the PC as a number.
 * For 2 argument operations, this will convert the 2 arguments to one number.
 * 
 * E.g. If 03 00 are the next 2 values after a load from memory for example, this will
 *   return 0x0003 or 3 as an integer.
 * 
 * @param {Number} numValues the number of values to read (1 or 2)
 */
Cpu.prototype.readFromMemory = function(numValues)
{
	if (numValues == 1)
	{
		var arg = Kernel.memoryManager.read(this.pc.read());
		this.pc.increment();
		return arg;
	}
	else if (numValues == 2)
	{
		var arg1 = Kernel.memoryManager.read(this.pc.read()).toString(16);
		this.pc.increment();
		var arg2 = Kernel.memoryManager.read(this.pc.read()).toString(16);
		this.pc.increment();
		
		// Prepend 0 to arg1 if it's only a single digit.
		arg1 = arg1.length < 2 ? "0" + arg1 : arg1;
		
		return parseInt((arg2 + arg1), 16);
	}
};

// Helper map to invert the bits of a binary number
Cpu.inversionMap = { 0 : 1, 1 : 0 };

/**
 * Converts the given number (an 8-bit integer) in two's complement to its decimal form.
 * 
 * @param {Number} twosComplement the two's complement number
 * 
 * @return {Number} the decimal number
 */
Cpu.toDecimal = function(twosComplement)
{
	if (twosComplement > 127)
	{
		// Convert to binary.
		var compStr = twosComplement.toString(2);
		
		// Invert the bits.
		var convertedStr = "";
		
		for (var i = 0; i < compStr.length; i++)
			convertedStr += Cpu.inversionMap[compStr[i]];
		
		return -(parseInt(convertedStr, 2) + 1);
	}
	else
	{
		return twosComplement;
	}
};

/**
 * Converts the given number in decimal to its two's complement representaion.
 * 
 * @param {Number} decimal the decimal number to convert
 * 
 * @return {Number} the two's complement number
 */
Cpu.toTwosComplement = function(decimal)
{
	if (decimal < 0)
	{
	    // TODO find a better way to do this.
	    
		// Invert the bits and convert to binary.
		var decStr = (~decimal).toString(2);
		
		// Extend to 8 bits
		for (var i = decStr.length; i < 8; i++)
			decStr = "0" + decStr;
		
		// Invert the bits
		var convertedStr = "";
		
		for (var j = 0; j < decStr.length; j++)
			convertedStr += Cpu.inversionMap[decStr[j]];
		
		return parseInt(convertedStr, 2);
	}
	else
	{
		return decimal;
	}
};

/**
 * Sets the statuses of all the registers of this CPU to normal. (For display purposes).
 */
Cpu.prototype.resetDisplayContents = function()
{
	this.pc.status = Register.STATUS_NORMAL;
	this.acc.status = Register.STATUS_NORMAL;
	this.xReg.status = Register.STATUS_NORMAL;
	this.yReg.status = Register.STATUS_NORMAL;
	this.zFlag.status = Register.STATUS_NORMAL;
};

Register.STATUS_NORMAL = 0;
Register.STATUS_READ = 1;
Register.STATUS_WRITTEN = 2;

/**
 * Defines a register which holds the register's current value and status.
 */
function Register()
{
	// The current value
	this.data = 0;
	// The status of the register (for display purposes).
	this.status = Register.STATUS_NORMAL;
}

Register.prototype.getUnsignedData = function()
{
    return this.data < 0 ? this.data + MEMORY_BLOCK_SIZE : this.data;
};

/**
 * Returns the register's current value.
 * 
 * @return {Number} the register's current value
 */
Register.prototype.read = function()
{
	this.status = Register.STATUS_READ;
	return this.data;
};

/**
 * Writes the specified data to the register.
 * 
 * @param {Number} data the data to write
 */
Register.prototype.write = function(data)
{
	this.status = Register.STATUS_WRITTEN;
	this.data = data;
};

/**
 * Increments the value held by the register by the specified amount.
 * 
 * @param {Number} amount the amount to increment
 */
Register.prototype.increment = function(amount)
{
	this.status = Register.STATUS_WRITTEN;
	
	amount = amount == null ? 1 : amount;
	
	this.data += amount;
};
