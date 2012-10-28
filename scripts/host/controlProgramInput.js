/* ----------
   controlProgramInput.js
   
   Handles program input. Also verifies that the textbox contains valid machine code.
   ---------- */
  
function ProgramInput() {}

ProgramInput.container = null;
ProgramInput.subContainer = null;
ProgramInput.input = null;

ProgramInput.regularTop = null;
ProgramInput.regularHeight = null;
ProgramInput.regularWidth = null;

ProgramInput.animateSpeed = 400;

/**
 * Initializes the program input handler. 
 */
ProgramInput.init = function()
{
	ProgramInput.container = $("#programInputContainer");
	ProgramInput.subContainer = $("#programInputSubContainer");
	ProgramInput.input = $("#programInput")[0];
	
	ProgramInput.regularTop = ProgramInput.container.css("top");
	ProgramInput.regularHeight = ProgramInput.subContainer.css("height");
	ProgramInput.regularWidth = ProgramInput.subContainer.css("width");
	
	// Default program: prints 12DONE
    ProgramInput.input.value = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 " +
							   "EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 " +
                               "A2 02 A0 42 FF 00";
};

/**
 * Expands the program input container to a size apprpriate for editing. 
 */
ProgramInput.expand = function()
{
	ProgramInput.container.animate({
		top: "401px",
	}, ProgramInput.animateSpeed, "swing");
	
	ProgramInput.subContainer.animate({
		width: "377px",
		height: "179px"
	}, ProgramInput.animateSpeed, "swing");
};

/**
 * Restores the program input container to its normal size. 
 */
ProgramInput.restore = function()
{
	ProgramInput.container.animate({
		top: ProgramInput.regularTop,
	}, ProgramInput.animateSpeed, "swing");
	
	ProgramInput.subContainer.animate({
		width: ProgramInput.regularWidth,
		height: ProgramInput.regularHeight
	}, ProgramInput.animateSpeed, "swing");
};

/**
 * Displays a "transfer" animatation to the memory display. 
 */
ProgramInput.transferAnimate = function()
{
	console.log("HI");
	ProgramInput.subContainer.effect("transfer", { to: $("#memoryDisplay") }, 500);
};

/**
 * Validates the program input. 
 */
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

/**
 * Returns the currently entered program.
 * 
 * @return {string} the entered program 
 */
ProgramInput.get = function() 
{
	return ProgramInput.input.value; //.replace(/\s+/g, "");
};
