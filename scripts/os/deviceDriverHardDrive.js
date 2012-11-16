/* ----------
   deviceDriverHardDrive.js
   
   
   ---------- */
  
DeviceDriverHardDrive.prototype = new DeviceDriver;

function DeviceDriverHardDrive()
{
	this.hardDrive = null;
}

DeviceDriver.prototype.driverEntry = function()
{
	this.hardDrive = new HardDrive();
};

