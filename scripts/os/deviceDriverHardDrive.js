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
	
	// Each hex character is 4 bits, so the block size in bytes * 2 will yield number of digits per block.
	data = data.pad(this.hardDrive.blockSize * 2, "0");
	//for (var i = 0; i < this.hardDrive.blockSize * 2; i++)
	//	data += "0";
	
	for (t = 0; t < this.hardDrive.tracks; t++)
	{
		for (s = 0; s < this.hardDrive.sectors; s++)
		{
			for (b = 0; b < this.hardDrive.blocksPer; b++)
			{
				this.hardDrive.write(t, s, b, data);
			}
		}
	}
	
	this.hardDrive.write(0, 0, 0, Kernel.MBR.toFileString());
};

DeviceDriverHDD.prototype.findFreeFile = function()
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
	
	this.track = startingTrack ? startingTrack : 0;
	this.sector = startingSector ? startingSector : 0;
	this.block = startingBlock ? startingBlock : 0;
	
	this.nextElement = this.hardDrive.read(this.track, this.sector, this.block);
}

/**
 * Returns the next element of the hardDrive or null if the element doesn't exist.
 * 
 * @return {Object} the next element read from the hard drive.
 */
HardDriveIterator.prototype.next = function()
{
	var data = this.nextElement;
	this.increment();
	this.nextElement = this.hardDrive.read(this.track, this.sector, this.block);
	return data;
}

/**
 * Returns true if this iterator has a next element.
 * 
 * @return {Boolean} true if this iterator has a next element, false otherwise
 */
HardDriveIterator.prototype.hasNext = function()
{
	return this.nextElement != null;
}

/** 
 * Moves this iterator to the next iteration. 
 */
HardDriveIterator.prototype.increment = function()
{
	this.block++;
	
	if (this.block >= this.hardDrive.blocksPer)
	{
		this.block = 0;
		this.sector++;
		
		if (this.sector >= this.hardDrive.sectors)
		{
			this.sector = 0;
			this.track++;
		}
	}
	
	/*
	while (this.track < this.hardDrive.tracks)
	{
		while (this.sector < this.hardDrive.sectors)
		{
			while (this.block < this.hardDrive.blocksPer)
			{
				this.block++;
				return;
			}
			
			this.sector++;
			this.block = 0;
			return;
		}
		
		this.track++;
		this.sector = 0;
		this.block = 0;
		return;
	}
	*/
}
