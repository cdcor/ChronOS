/* ------------------------------
   DeviceDriver.js
   
   The "base class" (or 'prototype') for all Device Drivers.
   ------------------------------ */

function DeviceDriver()
{
    // Base Attributes
    this.version = "0.07";
    this.status = "unloaded";
    this.preemptable = false;
    // this.queue = [];     // TODO: We will eventually want a queue for, well, queueing requests for this device to be handled by deferred proceedure calls (DPCs).
}

// Base Method pointers.
DeviceDriver.prototype.driverEntry = null; // Initialization routine.  Should be called when the driver is loaded.
DeviceDriver.prototype.isr = null; // Interrupt Service Routine
// TODO: this.dpc = null;   // Deferred Procedure Call routine - Start next queued operation on this device.
