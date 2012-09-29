/* ----------
   program-input.js
   
   Handles inputting programs for the OS to run through the text area.
   ---------- */
  
function ProgramInput() {
    this.input = '';

    // Initialize
    document.getElementById("programInput").value = "";
}

ProgramInput.verify = function() {
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
