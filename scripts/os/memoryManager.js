/* ----------
   memoryManager.js
   
   Requires globals.js, memory.js, memoryBlock.js.
   
   Handles all communication with main memory.
   ---------- */
  
function MemoryManager() 
{
    this.memory = new Memory(MEMORY_SIZE);
    this.numberOfBlocks = MEMORY_SIZE / MEMORY_BLOCK_SIZE;
    this.blockPcbs = [];
    
    this.relocationRegister = 0;
}

/**
 * Sets the base and limit registers for the given process based on availability. Also sets the 
 * block as allocated according to the PID. Returns true if the procces was successfully allocated.
 * 
 * @param {Pcb} pcb the process to allocate
 */
MemoryManager.prototype.allocate = function(pcb)
{	
    // Find the next available block
    var block;
    
    for (var i = 0; i < this.numberOfBlocks; i++)
    {
        if (this.blockPcbs[i] == null) // The block is available
        {
            // Use this block
            block = i;
            // Assign the process ID to this block
            this.blockPcbs[i] = pcb;
            break;
        }
    }
    
    if (block != null) // No more free blocks
    {
    	// Set the base and limit according to the block.
        pcb.base = block * MEMORY_BLOCK_SIZE;
        pcb.limit = MEMORY_BLOCK_SIZE;
        return true;
       
    }
    else
    {
    	// Roll out a process and try to allocate again
    	this.rollOut(this.getMostRecentlyAccessedProcess());
    	return this.allocate(pcb);
    }
};

/**
 * Deallocates the memory block associated with the given process.
 *  
 * @param {Pcb} pcb the process to deallocate
 */
MemoryManager.prototype.deallocate = function(pcb)
{
	Kernel.trace("Deallocating memory.");
	
    // Find the block containing the process
    var processContents = "", i, j;
    
    for (i = 0; i < this.blockPcbs.length && i < this.numberOfBlocks; i++)
    {
        if (this.blockPcbs[i] === pcb)
        {
            this.blockPcbs[i] = null;
            
            // Zero-out the block.
            var savedRelocationReg = this.relocationRegister;
            
            this.relocationRegister = pcb.base;
            
            for (j = 0; j < pcb.limit; j++)
            {
            	processContents += this.read(j).toString(16).prepad(2, "0");
            	this.write(j, 0);
            }
           	
           	pcb.base = null;
           	pcb.limit = null;
           	
            this.relocationRegister = savedRelocationReg;
        }
    }
    
    if (processContents == "")
    {
    	Kernel.trace("Memory deallocation failed: Process not found.");
    	return null;
    }
    
    return processContents;
};

MemoryManager.prototype.loadProcess = function(pcb, code)
{
    this.allocate(pcb);
    
	// Set relocation register.
    this.relocationRegister = pcb.base;
    
    Kernel.trace("Loading process into memory. Base address: " + pcb.base);
    
    // Load into memory.
    code = code.replace(/\s+/g, "");
    var codePieces = [];
    
    for (var i = 0; i < code.length; i += 2)
    	codePieces.push(code.substr(i, 2));
    	
    for (var address = 0; address < codePieces.length && address < MEMORY_BLOCK_SIZE; address++)
    	Kernel.memoryManager.write(address, codePieces[address]);
};

MemoryManager.prototype.rollIn = function(pcb)
{
	// TODO If possible, figure out a way to cleanly do this with an HDD interrupt.
	Kernel.trace("Rolling in process (PID " + pcb.pid + ").");
	
	try
	{
		var processContents = Kernel.hddDriver.readFile(pcb.swapFileName());
		Kernel.interrupt(HDD_IRQ, ["swap-delete", pcb.swapFileName()]);
		
		this.loadProcess(pcb, processContents);
	}
	catch (e)
	{
		Kernel.trace("Roll in failed: " + e);
	}
};

MemoryManager.prototype.rollOut = function(pcb)
{
	Kernel.trace("Rolling out process (PID " + pcb.pid + ").");
	
	var processContents = this.deallocate(pcb);
	
    if (processContents)
    {
    	var swapFile = pcb.swapFileName();
    	
    	Kernel.interrupt(HDD_IRQ, ["swap-write", swapFile, processContents]);    	
    }
    else
    	Kernel.trace("Roll out failed: Process not found.");
};

MemoryManager.prototype.getMostRecentlyAccessedProcess = function()
{
	var priority = -1;
	var pcb = null;
	
	for (var i = 0; i < this.blockPcbs.length; i++)
    {
    	if (this.blockPcbs[i].lastAccessTime > priority)
    	{
    		pcb = this.blockPcbs[i];
    		priority = pcb.lastAccessTime;
    	}
    }
    
    return pcb;
};

/**
 * Sets the relocation register according to the given process.
 *  
 * @param {Pcb} pcb the process to set the relocation register for
 */
MemoryManager.prototype.setRelocationRegister = function(pcb)
{
	if (pcb.base == null) // Swapped out
		this.rollIn(pcb);
	
	Kernel.trace("Setting relocation register to " + pcb.base + " (PID " + pcb.pid + ").");
    this.relocationRegister = pcb.base;
};

/**
 * Reads the data located in the given logical address from memory.
 * 
 * @param {Number} address the logical address to read
 */
MemoryManager.prototype.read = function(address)
{
    // Ensure valid address.
    if (address < 0 || address >= MEMORY_BLOCK_SIZE)
        throw "Memory access out of bounds.";
    else if (this.relocationRegister != null) // Process has been allocated
        return this.memory.read(address + this.relocationRegister);
};

/**
 * Writes the given data to memory at the specified logical address.
 *  
 * @param {Number} address the logical address to write the data to
 * @param {Number} data the data to write
 */
MemoryManager.prototype.write = function(address, data)
{
	// Convert to number
	if (typeof data === 'string')
		data = parseInt(data, 16);
	
    // Ensure valid address and data.
    if (address < 0 || address >= MEMORY_BLOCK_SIZE)
    {
    	if (arguments.callee.caller == Kernel.loadProgram)
    		throw "Not enough memory.";
    	else
        	throw "Memory access out of bounds.";
    }
    else if (data % 1 !== 0 || data < 0 || data > 0xFF)
        throw "Invalid memory data.";
    else if (this.relocationRegister != null) // Process has been allocated
        this.memory.write(address + this.relocationRegister, data);
};

/**
 * Returns the contents of memory as an array. For display purposes only. 
 * 
 * @return {Array} the contents of memory
 */
MemoryManager.prototype.getDisplayContents = function() 
{
	return this.memory.getDisplayContents();
};

/**
 * Resets the read/write status of each word in memory. For display purposes only. 
 */
MemoryManager.prototype.resetDisplayContents = function()
{
	this.memory.resetDisplayContents();
}
