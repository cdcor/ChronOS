/* ----------
   controlProgramInput.js
   
   Handles textarea for program input. Also verifies that the textbox contains valud machine code.
   ---------- */
  
function ProgramInput() {}

ProgramInput.container = null;
ProgramInput.subContainer = null;
ProgramInput.input = null;

ProgramInput.regularTop = null;
ProgramInput.regularHeight = null;
ProgramInput.regularWidth = null;

ProgramInput.animateSpeed = 500;

ProgramInput.init = function()
{
	ProgramInput.container = $("#programInputContainer");
	ProgramInput.subContainer = $("#programInputSubContainer");
	ProgramInput.input = $("#programInput")[0];
	
	ProgramInput.regularTop = ProgramInput.container.css("top");
	ProgramInput.regularHeight = ProgramInput.subContainer.css("height");
	ProgramInput.regularWidth = ProgramInput.subContainer.css("width");
	
    ProgramInput.input.value = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 " +
							   "EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 " +
                               "A2 02 A0 42 FF 00";
};

ProgramInput.expand = function()
{
	ProgramInput.container.animate({
		top: "401px",
	}, ProgramInput.animateSpeed);
	
	ProgramInput.subContainer.animate({
		width: "377px",
		height: "179px"
	}, ProgramInput.animateSpeed);
};

ProgramInput.restore = function()
{
	ProgramInput.container.animate({
		top: ProgramInput.regularTop,
	}, ProgramInput.animateSpeed);
	
	ProgramInput.subContainer.animate({
		width: ProgramInput.regularWidth,
		height: ProgramInput.regularHeight
	}, ProgramInput.animateSpeed);
};

ProgramInput.verify = function() 
{
    // Disable input for duration of this function.
    ProgramInput.input.disabled = true;
    
    var text = ProgramInput.input.value;
    
    // Make uppercase.
    text = text.toUpperCase();
    // Remove all non-hex characters.
    text = text.replace(/[^0-9A-F]+/g, "");
    // Insert space every 2 hex characters.
    for (var i = 2; i < text.length; i += 3)
        text = text.slice(0, i) + " " + text.slice(i, text.length);
    
    ProgramInput.input.value = text;
    ProgramInput.input.disabled = false;
};

ProgramInput.get = function() 
{
	return ProgramInput.input.value; //.replace(/\s+/g, "");
};
