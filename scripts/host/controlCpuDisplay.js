/* ----------
   controlCpuDisplay.js
   
   Requires globals.js
   
   Handles all interaction associated with the CPU display.
   ---------- */

function CpuDisplay() {}

CpuDisplay.init = function()
{
	
};

CpuDisplay.update = function()
{
	CpuDisplay.updateElement($("#pcDisplay"), _CPU.pc);
	CpuDisplay.updateElement($("#accDisplay"), _CPU.acc);
	CpuDisplay.updateElement($("#xDisplay"), _CPU.xReg);
	CpuDisplay.updateElement($("#yDisplay"), _CPU.yReg);
	CpuDisplay.updateElement($("#zDisplay"), _CPU.zFlag);
	
	_CPU.resetDisplayContents();
};

CpuDisplay.updateElement = function(element, register)
{
	var data = Cpu.toTwosComplement(register.data).toString(16).toUpperCase();
	
	for (var i = data.length; i < 2; i++)
		data = "0" + data;
		
	data = "<pre>0x" + data + "</pre>";
	
	if (register.status === Register.STATUS_NORMAL)
		element.html(data);
	else if (register.status === Register.STATUS_READ)
		element.html('<span style="color: blue;"><strong>' + data + "</strong></span>");
	else if (register.status === Register.STATUS_WRITTEN)
		element.html('<span style="color: green;"><strong>' + data + "</strong></span>");
};
