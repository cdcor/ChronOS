/* ----------
   hardDrive.js
   
   Uses HTML5 local storage to simulate a hard disk drive.
   ---------- */

// Number of tracks
HardDrive.tracks = 4;
// Number of sectors
HardDrive.sectors = 8;
// Number of blocks per track and sector
HardDrive.blocksPer = 8;
// Block size in bytes
HardDrive.blockSize = 8;

// The disk index which refers to the section of local storage this disk will refer to. That is,
//   if two hard drives are created with index 0, they will refer to the same section of storage, 
//   which should not happen.
HardDrive.diskIndex = 0;

/**
 * Creates a new hard drive. 
 */
function HardDrive()
{
	// Ensure local storage is supported.
	if (!html5StorageSupported())
		throw "Cannot create hard drive; local storage is not supported.";
	
	// Number of tracks, sectors, and blocks, and bytes per block
	this.tracks = HardDrive.tracks;
	this.sectors = HardDrive.sectors;
	this.blocksPer = HardDrive.blocksPer;
	this.blockSize = HardDrive.blockSize;
	
	// Size in blocks
	this.size = this.tracks * this.sectors * this.blocksPer;
	this.indexOffset = HardDrive.diskIndex++ * this.size;
	
	// Number of bits to shift the track index and sector index to convert each TSB to a single index,
	//   representing the key to store the object under in local storage.
	this.trackShift = Math.ceil(Math.log(this.sectors) / Math.log(2))      // Bits to represent the sector
			          + Math.ceil(Math.log(this.blocksPer) / Math.log(2)); // Bits to represent the block
	this.sectorShift = Math.ceil(Math.log(this.blocksPer) / Math.log(2));  // Bits to represent the block
}

/**
 * Returns the data at the specified TSB.
 * 
 * @param {String} track the track
 * @param {String} sector the sector
 * @param {String} block the block
 * 
 * @return {String} the data
 */
HardDrive.prototype.read = function(track, sector, block)
{
	return localStorage.getItem(this.toIndex(track, sector, block))
};

/**
 * Writes the data at the specified TSB.
 * 
 * @param {String} track the track
 * @param {String} sector the sector
 * @param {String} block the block
 * @param {String} data the data to write
 */
HardDrive.prototype.write = function(track, sector, block, data)
{
	// Ensure data doesn't exceed block size. Data is in hex, each character is then 4 bits, so the
	//   block size * 16 will yield the maximum length of the data string.
	if (data.length > this.blockSize * 16)
		throw "Data exceeds block size";
	
	localStorage.setItem(this.toIndex(track, sector, block), "");
};

/**
 * Converts the specified TSB to an index representing the key in local storage.
 * 
 * @param {String} track the track
 * @param {String} sector the sector
 * @param {String} block the block
 * 
 * @return {Number} the index/key 
 */
HardDrive.prototype.toIndex = function(track, sector, block)
{
	track = parseInt(track, 16);
	sector = parseInt(sector, 16);
	block = parseInt(block, 16);
	
	// This check is lengthy operation-wise, but necessary to avoid possible very bad logical errors.
	//   It does not check for non-negative parameters (that does seem a bit excessive)
	if (track > this.tracks || sector > this.sectors || block > this.blocksPer)
		throw "Requested TSB is outside hard drive size.";
	
	// In terms of bits, TTSSSBBB (for the default size, anyway)
	var index = (track << this.trackShift) | (sector << this.sectorShift) | block;
	
	return index + this.indexOffset;
};

/**
 * Returns true if HTML5 local storage is supported.
 * 
 * @return {Boolean} true if HTML5 local storage is supported. 
 */
function html5StorageSupported() 
{
	try 
	{
		return "localStorage" in window && window["localStorage"] !== null;
	} 
	catch (e) 
	{
		return false;
	}
}