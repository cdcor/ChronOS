/* ----------
   file.js
   
   Represents a file containing user data to be stored on the hard drive.
   ---------- */

File.STATUS_AVAILABLE = 0;
File.STATUS_OCCUPIED = 1;

// The maximum size of the data per block in bytes. For now, 4 is a magic number, relying on the 
//   number of tracks, sectors, and blocks per to be 4, 8, and 8, respectively.
File.DATA_SIZE = HardDrive.BLOCK_SIZE - 4;

/**
 * Creates a file for storing text data on the hard drive. This object is for user data, not for swapping.
 * 
 * @param fileStrOrStatus the data string representing the file read from the hard drive OR the
 *     status of the new file to be created
 * @param {Number} track the track of the TSB this file chains to
 * @param {Number} sector the sector of the TSB this file chains to
 * @param {Number} block the block of the TSB this file chains to
 * @param {String} data the data stored in this file.
 */
function File(fileStrOrStatus, track, sector, block, data)
{
	// Status and linked TSB
	this.status = null;
	this.track = null;
	this.sector = null;
	this.block = null;
	// The data
	this.data = null;
	
	if (fileStrOrStatus != null && track != null && sector != null && block != null)
		this.setWithInfo(fileStrOrStatus, track, sector, block);
	else if (fileStrOrStatus)
		this.setWithFileString(fileStrOrStatus);
		
	if (data)
		this.data = data;
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

File.prototype.setWithInfo = function(status, track, sector, block)
{
	this.status = status;
	this.track = track;
	this.sector = sector;
	this.block = block;
};

File.prototype.toFileString = function()
{
	// File string is of the form: Status T  S  B  Data
	//             Hex Characters: 00     00 00 00 00000000...
	
	var str = "", part;
	
	part = this.status.toString(16);
	str += part.length < 2 ? "0" + part : part;
	part = this.track.toString(16);
	str += part.length < 2 ? "0" + part : part;
	part = this.sector.toString(16);
	str += part.length < 2 ? "0" + part : part;
	part = this.block.toString(16);
	str += part.length < 2 ? "0" + part : part;
	
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
    while (convertedData.length < maxLength)
    	convertedData += "00";
    	
	convertedArray.push(convertedData.toUpperCase());
    
	return convertedArray;
};

/**
 * Reverts the hard drive data string for a file to a string representation.
 * 
 * For text only.
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