/* ----------
   memory.js
   
   Defines an array of main memory to be used by the OS.
   ---------- */

function Memory(size)
{
    this.memory = new Array();
    this.size = size;
    
    for (var address = 0; address < size; address++)
        this.memory[address] = new MemoryWord();
}

// Reads and returns the data at the specified memory address.
Memory.prototype.read = function(address)
{
	this.memory[address].status = MemoryWord.STATUS_READ;
    return this.memory[address].data;
};

// Writes the given data to the specified memory address.
Memory.prototype.write = function(address, data)
{
	this.memory[address].status = MemoryWord.STATUS_WRITTEN;
    this.memory[address].data = data;
};

Memory.prototype.getDisplayContents = function()
{
	return this.memory;
};

Memory.prototype.resetDisplayContents = function()
{
	for (i in this.memory)
		this.memory[i].status = MemoryWord.STATUS_NORMAL;
};

MemoryWord.STATUS_NORMAL = 0;
MemoryWord.STATUS_READ = 1;
MemoryWord.STATUS_WRITTEN = 2;  

function MemoryWord()
{
	this.data = 0;
	this.status = MemoryWord.STATUS_NORMAL;
}
