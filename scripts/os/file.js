/* ----------
   file.js
   
   Represents a file containing user data to be stored on the hard drive.
   
   These file objects contain a status, TSB linked to the next block of the file (if it exists), and
   the data. The data stored in the actual object is the data represented as a string. For example,
   if the user creates a file named "abc.txt", the data for the file object will be "abc.txt". 
   
   When the data is stored to the hard drive it will be converted to a binary representation
   according to the JavaScript character codes. For example, "a" will be converted to "61" hex.
   "abc.txt" will be converted to "6162632E747874" hex.
   
   Although this wastes local storage (storing 2 hex characters for every single character of a 
   file), local storage is something we have plenty of. Furthermore, this representation more 
   accurrately emulates a real hard drive, which stores the data as bit strings. 
   
   Binary data to be stored can be specified when setting the data. This will maintain the true form
   of the data when storing it to the hard drive, which is useful for displaying the data when 
   swapping, for example. Binary data "ABCD" hex will be stored to the drive as "ABCD", rather than 
   storing the character codes for each hex digit.
   ---------- */

File.STATUS_AVAILABLE = 0;
File.STATUS_OCCUPIED_TEXT = 1;
File.STATUS_OCCUPIED_BIN = 2;

// The maximum size of the data per block in bytes. For now, 4 is a magic number, relying on the 
//   number of tracks, sectors, and blocks per to be 4, 8, and 8, respectively.
File.DATA_SIZE = HardDrive.BLOCK_SIZE - 4;

/**
 * Creates a file for storing text data on the hard drive. 
 * 
 * @param {String} data the data to be stored in the file
 * @param {Boolean} isBinaryData true if the data passed to the file is binary data (i.e. it
 *     should not be converted as text).
 */
function File(data, isBinaryData)
{	
	// Status and TSB
	this.status = File.STATUS_OCCUPIED_TEXT;
	this.track = 0;
	this.sector = 0;
	this.block = 0;
	
	// TSB linked to
	this.linkedTrack = 0;
	this.linkedSector = 0;
	this.linkedBlock = 0;
	// The data
	this.data = "";
	
	if (data)
		this.setData(data, isBinaryData);
}

File.prototype.setWithFileString = function(fileStr)
{
	// File string is of the form: Status T  S  B  Data
	//             Hex Characters: 00     00 00 00 00000000...
	if (!fileStr)
		throw "Invalid string to set file.";
	
	fileStr = fileStr.replace(/\s+/g, "");
	
	this.status = parseInt(fileStr.substr(0, 2), 16);
	this.linkedTrack = parseInt(fileStr.substr(2, 2), 16);
	this.linkedSector = parseInt(fileStr.substr(4, 2), 16);
	this.linkedBlock = parseInt(fileStr.substr(6, 2), 16);
	this.data = File.revertData(fileStr.substr(8));
};

File.prototype.setTSB = function(track, sector, block)
{
	this.track = track;
	this.sector = sector;
	this.block = block;
};

File.prototype.setLinkedTSB = function(track, sector, block)
{
	this.linkedTrack = track;
	this.linkedSector = sector;
	this.linkedBlock = block;
};

File.prototype.setData = function(data, isBinaryData)
{
	if (isBinaryData) // Hex
	{
		if (data.length % 2 === 1)
			throw "Binary data must be a whole number of bytes.";
		
		this.data = File.revertData(data);
		this.status = File.STATUS_OCCUPIED_BIN;
	}
	else // Text
	{
		this.data = data;
		this.status = File.STATUS_OCCUPIED_TEXT;
	}
};

File.prototype.getData = function()
{
	if (this.status === File.STATUS_OCCUPIED_TEXT)
	{
		// Remove null characters
		return this.data.replace(/\x00+/g, "");
	}
	
	if (this.status === File.STATUS_OCCUPIED_BIN)
	{
		return File.convertData(this.data)[0];
	}
	
	return null;
}

File.prototype.isAvailable = function()
{
	return this.status === File.STATUS_AVAILABLE;
};

File.prototype.isLinked = function()
{
	return !(this.linkedTrack === 0 && this.linkedSector === 0 && this.linkedBlock === 0);
}

File.prototype.toFileString = function()
{
	// File string is of the form: Status T  S  B  Data
	//             Hex Characters: 00     00 00 00 00000000...
	
	var str = "", part;
	
	str += this.status.toString(16).prepad(2, "0");
	str += this.linkedTrack.toString(16).prepad(2, "0");
	str += this.linkedSector.toString(16).prepad(2, "0");
	str += this.linkedBlock.toString(16).prepad(2, "0");
	
	var data = File.convertData(this.data);
	
	if (data.length > 1)
		console.log("WARN: File data spans more than one block. Data will be truncated.");

	return str + data[0];
};

File.prototype.writeToDrive = function(hardDrive)
{		
	hardDrive.write(this.track, this.sector, this.block, this.toFileString());
}

File.prototype.deleteFromDrive = function(hardDrive)
{
	this.status = File.STATUS_AVAILABLE;
	hardDrive.write(this.track, this.sector, this.block, this.toFileString());
};

/**
 * Converts the specified data string to a form appropriate for storage on the hard drive.
 * 
 * @param {String} data the data to convert
 * 
 * @return {Array} an array of data strings to be stored on the hard drive. The array will only be
 *     of size 1 if the data does not exceed the block size.
 */
File.convertData = function(data)
{
	data += "\0"; // Null terminate
	
    var maxLength = File.DATA_SIZE * 2; // 2 Hex chars per byte
    var convertedData = "", convertedArray = [], dataPiece;
    
    for (var i = 0; i < data.length; i++)
    {
    	dataPiece = data.charCodeAt(i).toString(16);
		convertedData += dataPiece.length < 2 ? "0" + dataPiece : dataPiece;
        
        if (convertedData.length + 1 > maxLength)
        {
            convertedArray.push(convertedData.toUpperCase());
            convertedData = "";
        }
    }
    
    // Extend to the data size
    convertedData = convertedData.pad(maxLength, "00");
    	
	convertedArray.push(convertedData.toUpperCase());
    
	return convertedArray;
};

/**
 * Reverts the hard drive data string for a file to a string representation.
 * 
 * @param {String} data
 */
File.revertData = function(data)
{
	var revertedData = "";
	
	for (var i = 0; i < data.length; i += 2)
		revertedData += String.fromCharCode(parseInt(data.substr(i, 2), 16));
	
	return revertedData;
};

File.filesFromData = function(data, isBinaryData)
{
	var dataParts = File.convertData(data);
	var files = [];
	
	for (var i = 0; i < dataParts.length; i++)
		files.push(new File(File.revertData(dataParts[i]), isBinaryData));
	
	return files;
};

File.fileFromStr = function(fileStr)
{
	var file = new File();
	file.setWithFileString(fileStr);
	
	return file;
};
