/* ----------
   memoryManager.js
   
   Requires globals.js, memory.js, memoryBlock.js.
   
   Handles all communication with main memory.
   ---------- */
  
function MemoryManager() 
{
    this.memory = new Memory(MEMORY_SIZE);
    this.numberOfBlocks = MEMORY_SIZE / MEMORY_BLOCK_SIZE;
    this.blockPids = new Array();
    
    this.relocationRegister = 0;
}

// Sets the base and limit registers for the given process based on availability. Also sets the 
// block as allocated according to the PID. Returns true if the procces was successfully allocated.
MemoryManager.prototype.allocate = function(pcb)
{
	Kernel.trace("Allocating memory.");
	
    // Find the next available block
    var block = null;
    
    for (var i = 0; i < this.numberOfBlocks; i++)
    {
        if (this.blockPids[i] == null) // The block is available
        {
            // Use this block
            block = i;
            // Assign the process ID to this block
            this.blockPids[i] = pcb.pid;
            break;
        }
    }
    
    if (block == null) // No more free blocks
    {
        return false;
        // TODO Implement swapping.
    }
    else
    {
        // Set the base and limit according to the block.
        pcb.base = block * MEMORY_BLOCK_SIZE;
        pcb.limit = MEMORY_BLOCK_SIZE;
        return true;
    }
};

// Deallocates the memory block associated with the given process.
MemoryManager.prototype.deallocate = function(pcb)
{
	Kernel.trace("Deallocating memory.");
	
    // Find the block containing the process
    var block = null;
    
    for (var i = 0; i < this.blockPids.length && i < this.numberOfBlocks; i++)
    {
        if (this.blockPids[i] === pcb.pid)
        {
            block = i;
            this.blockPids[i] = undefined;
            
            // Zero-out the block.
            var savedRelocationReg = this.relocationRegister;
            
            this.setRelocationRegister(pcb);
            
            for (var i = 0; i < pcb.limit; i++)
            	this.write(i, 0);
            	
            Kernel.trace("Resetting relocation register to " + savedRelocationReg + ".");
            this.relocationRegister = savedRelocationReg;
        }
    }
    
    if (block == null)
        Kernel.trace("Memory deallocation failed: Process not found.");
};

// Sets the relocation register according to the given process.
MemoryManager.prototype.setRelocationRegister = function(pcb)
{
	Kernel.trace("Setting relocation register to " + pcb.base + " (PID " + pcb.pid + ").");
    this.relocationRegister = pcb.base;
};

// Reads the data located in the given logical address from memory.
MemoryManager.prototype.read = function(address)
{
    // Ensure valid address. Trap error if not.
    if (address < 0 || address >= MEMORY_BLOCK_SIZE)
        throw "Memory access out of bounds.";
    else if (this.relocationRegister != null) // Process has been allocated
        return this.memory.read(address + this.relocationRegister);
};

// Writes the given data to memory at the specified logical address.
MemoryManager.prototype.write = function(address, data)
{
	// Convert to number
	if (typeof data === 'string')
		data = parseInt(data, 16);
	
    // Ensure valid address and data.
    if (address < 0 || address >= MEMORY_BLOCK_SIZE)
    {
    	if (arguments.callee.caller == Kernel.loadMemory)
    		throw "Not enough memory.";
    	else
        	throw "Memory access out of bounds.";
    }
    else if (data % 1 !== 0 || data < 0 || data > 0xFF)
        throw "Invalid memory data.";
    else if (this.relocationRegister != null) // Process has been allocated
        this.memory.write(address + this.relocationRegister, data);
};

// Returns the contents of memory as an array. For display purposes only.
MemoryManager.prototype.getDisplayContents = function() 
{
	return this.memory.getDisplayContents();
};

MemoryManager.prototype.resetDisplayContents = function()
{
	this.memory.resetDisplayContents();
}
