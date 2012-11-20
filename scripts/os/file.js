/* ----------
   file.js
   
   Represents a file containing user data to be stored on the hard drive.
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
	// Status and linked TSB
	this.status = File.STATUS_OCCUPIED_TEXT;
	this.track = 0;
	this.sector = 0;
	this.block = 0;
	// The data
	this.data = 0;
	
	if (data)
		this.setData(data, isBinaryData);
}

File.prototype.setWithFileString = function(fileStr)
{
	// File string is of the form: Status T  S  B  Data
	//             Hex Characters: 00     00 00 00 00000000...
	
	fileStr = fileStr.replace(/\s+/g, "");
	
	this.status = parseInt(fileStr.substr(0, 2), 16);
	this.track = parseInt(fileStr.substr(2, 2), 16);
	this.sector = parseInt(fileStr.substr(4, 2), 16);
	this.block = parseInt(fileStr.substr(6, 2), 16);
	this.data = File.revertData(fileStr.substr(8));
};

File.prototype.setTSB = function(track, sector, block)
{
	this.track = track;
	this.sector = sector;
	this.block = block;
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
}

File.prototype.toFileString = function()
{
	// File string is of the form: Status T  S  B  Data
	//             Hex Characters: 00     00 00 00 00000000...
	
	var str = "", part;
	
	str += this.status.toString(16).prepad(2, "0");
	str += this.track.toString(16).prepad(2, "0");
	str += this.sector.toString(16).prepad(2, "0");
	str += this.block.toString(16).prepad(2, "0");
	
	var data = File.convertData(this.data);
	
	if (data.length > 1)
		console.log("WARN: File data spans more than one block. Data will be truncated.");
	
	str += data[0];
	
	return str;
};

File.prototype.toString = function()
{
	return this.status + " " + this.track + ":" + this.sector + ":" + this.block + " " + this.data;
}

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
		files.push(new File(dataParts[i]), isBinaryData);
	
	return files;
};

File.fileFromStr = function(fileStr)
{
	var file = new File();
	file.setWithFileString(fileStr);
	
	return file;
};
