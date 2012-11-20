/* ----------
   deviceDriverHardDrive.js
   
   
   ---------- */
  
DeviceDriverHDD.prototype = new DeviceDriver;

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
	
};

/**
 * Reads the specified file.
 * 
 * @param filename the file
 */
DeviceDriverHDD.prototype.readFile = function(filename)
{
	
};

/**
 * Writes data to the specified file (overwrites; does not append).
 * 
 * @param filename the file
 */
DeviceDriverHDD.prototype.writeFile = function(filename, data)
{
	
};

/**
 * Deletes the specified file.
 * 
 * @param filename the file
 */
DeviceDriverHDD.prototype.deleteFile = function(filename)
{
	
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
	for (var i = 0; i < this.hardDrive.blockSize * 2; i++)
		data += "0";
	
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