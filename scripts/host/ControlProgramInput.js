/* ----------
   controlProgramInput.js
   
   Handles textarea for program input. Also verifies that the textbox contains valud machine code.
   ---------- */
  
function ProgramInput() {}

ProgramInput.init = function()
{
    document.getElementById("programInput").value = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 " +
													"EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 " +
                                                    "A2 02 A0 42 FF 00";
}

ProgramInput.verify = function() 
{
    var input = document.getElementById("programInput");
    // Disable input for duration of this function.
    input.disabled = true;
    
    var text = input.value;
    
    // Make uppercase.
    text = text.toUpperCase();
    // Remove all non-hex characters.
    text = text.replace(/[^0-9A-F]+/g, '');
    // Insert space every 2 hex characters.
    for (var i = 2; i < text.length; i += 3)
        text = text.slice(0, i) + ' ' + text.slice(i, text.length);
    
    input.value = text;
    input.disabled = false;
}

ProgramInput.get = function() 
{
	return document.getElementById("programInput").value; //.replace(/\s+/g, "");
}
