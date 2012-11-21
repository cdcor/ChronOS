/* ----------
   deviceDriverHardDrive.js
   
   
   ---------- */
  
DeviceDriverHDD.prototype = new DeviceDriver;

// The main directory sectore
DeviceDriverHDD.DIRECTORY_SECTOR = 0;

/**
 * Creates a new Hard Drive Device Driver. 
 */
function DeviceDriverHDD()
{
	this.hardDrive = null;
}

/**
 * Hard Drive Device Driver initialization. 
 */
DeviceDriverHDD.prototype.driverEntry = function()
{
	this.hardDrive = new HardDrive();
};

/**
 * The interrupt servicing routine for the hard drive.
 * 
 * @param params an array of parameters to act upon in this ISR. 
 */
DeviceDriverHDD.prototype.isr = function(params)
{
	var command = params[0];
	var filename = params[1]; // Will be undefined if the command is format.
	var data = params[2]; // Will be undefined if the command is not write.
	
	switch (command)
	{
		case "create":
			this.createFile(filename);
			break;
		case "read":
			this.readFile(filename);
			break;
		case "write":
			this.writeFile(filename, data);
			break;
		case "delete":
			this.deleteFile(filename);
			break;
		case "format":
			this.format();
			break;
		default:
			throw "Invalid HDD Driver command.";
	}
};

/**
 * Creates the specified file.
 * 
 * @param filename the file
 */
DeviceDriverHDD.prototype.createFile = function(filename)
{
	console.log("Create " + filename);
	
	var file = this.findFreeFile();
	
	file.setData(filename);
	
	
};

/**
 * Reads the specified file.
 * 
 * @param filename the file
 */
DeviceDriverHDD.prototype.readFile = function(filename)
{
	console.log("Read " + filename);
};

/**
 * Writes data to the specified file (overwrites; does not append).
 * 
 * @param filename the file
 */
DeviceDriverHDD.prototype.writeFile = function(filename, data)
{
	console.log("Write " + filename + " " + data);
};

/**
 * Deletes the specified file.
 * 
 * @param filename the file
 */
DeviceDriverHDD.prototype.deleteFile = function(filename)
{
	console.log("Delete " + filename);
};

/**
 * Formats the hard drive (i.e. zero-fills it) .
 */
DeviceDriverHDD.prototype.format = function()
{
	Kernel.trace("Formatting hard drive...");
	
	var t, s, b;
	
	var data = "";
	
	// Each hex character is 4 bits, so the block size in bytes * 2 will yield number of hex digits per block.
	data = data.pad(this.hardDrive.blockSize * 2, "0");
	
	var iterator = new HardDriveIterator(this.hardDrive);
	
	while (iterator.next())
		this.hardDrive.write(iterator.track, iterator.sector, iterator.block, data);
	
	this.hardDrive.write(0, 0, 0, Kernel.MBR.toFileString());
};

/**
 * Finds and return the first free file space to store a file name in the main directory. 
 * 
 * @return {File} the first free file space
 */
DeviceDriverHDD.prototype.findFreeFile = function()
{
	var iterator = new HardDriveIterator(this.hardDrive), element, file;
	iterator.setTermination(1, 0, 0);
	
	while (element = iterator.next())
	{
		file = File.fileFromStr(element);
		if (file.isAvailable())
			return file;
	}
}

DeviceDriverHDD.prototype.findFreeFileSpace = function()
{
	
}

/**
 * Returns the contents of the hard drive. For display purposes only. 
 */
DeviceDriverHDD.prototype.getContents = function()
{
	var t, s, b;
	
	var data = [];
	
	for (t = 0; t < this.hardDrive.tracks; t++)
	{
		data.push([]);
		
		for (s = 0; s < this.hardDrive.sectors; s++)
		{
			data[t].push([]);
			
			for (b = 0; b < this.hardDrive.blocksPer; b++)
			{
				data[t][s].push(this.hardDrive.read(t, s, b));
			}
		}
	}
	
	return data;
};


/**
 * A convenience object used to iterate through a hard drive.
 *  
 * @param {Object} hardDrive the hardDrive to be iterated.
 */
function HardDriveIterator(hardDrive, startingTrack, startingSector, startingBlock)
{
	this.hardDrive = hardDrive;
	
	this.track = startingTrack != null ? startingTrack : 0;
	this.sector = startingSector != null ? startingSector : 0;
	this.block = startingBlock != null ? startingBlock - 1 : -1; // Start 1 less as the iterator will increment it
	
	this.terminationTrack = this.hardDrive.tracks - 1;
	this.terminationSector = this.hardDrive.sectors - 1;
	this.terminationBlock = this.hardDrive.blocksPer - 1;
	
	this.terminated = false;
}

/**
 * Test function to test the iterator. 
 */
HardDriveIterator.prototype.iterate = function()
{
	this.setTermination(0,7,7);
	
	var element, i = 0;
	while (element = this.next())
	{
		console.log((i++) + " " + this.track + ":" + this.sector + ":" + this.block + " " + element);
	}
	
	//console.log((i++) + " " + this.track + ":" + this.sector + ":" + this.block + " " + element);
};

/**
 * Returns the next element of the hard drive or null if the element doesn't exist.
 * 
 * @return {String} the next element
 */
HardDriveIterator.prototype.next = function()
{
	this.increment();
	return this.hardDrive.read(this.track, this.sector, this.block);
};

/** 
 * Sets the track, sector, and block to terminate at (inclusive).
 * 
 * @param {Number} track the track
 * @param {Number} sector the sector
 * @param {Number} block the block
 */
HardDriveIterator.prototype.setTermination = function(track, sector, block)
{
	this.terminationTrack = track != null ? track : this.terminationTrack;
	this.terminationSector = sector != null ? sector : this.terminationSector;
	this.terminationBlock = block != null ? block : this.terminationBlock;
};

/**
 * Terminates the iterator. 
 */
HardDriveIterator.prototype.terminate = function()
{
	this.track = -1;
	this.sector = -1;
	this.block = -1;
	this.terminated = true;
}

/** 
 * Moves this iterator to the next iteration. 
 */
HardDriveIterator.prototype.increment = function()
{	
	// Check for termination.
	if (this.terminated)
		return;
	if (this.track === this.terminationTrack &&
		this.sector === this.terminationSector &&
		this.block === this.terminationBlock)
	{
		this.terminate();
		return;
	}
	
	// Increment TSB
	this.block++;
	
	if (this.block >= this.hardDrive.blocksPer)
	{
		this.block = 0;
		this.sector++;
		
		if (this.sector >= this.hardDrive.sectors)
		{
			this.sector = 0;
			this.track++;
			
			if (this.track > this.hardDrive.tracks)
			{
				this.terminate();
			}
		}
	}
};
