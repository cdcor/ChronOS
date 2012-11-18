/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
function DeviceDriverKeyboard() {                   // Add or override specific attributes and method pointers.
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
}

/**
 * Maps a key code (except letters) to the shifted form of it's character.
 */
DeviceDriverKeyboard.prototype.shiftedSymbols = 
{
    '`': '~',
    '0': ')',
    '1': '!',
    '2': '@',
    '3': '#',
    '4': '$',
    '5': '%',
    '6': '^',
    '7': '&',
    '8': '*',
    '9': '(',
    '-': '_',
    '=': '+',
    '[': '{',
    ']': '}',
    ';': ':',
    "'": '"',
    '"': "'",
    ',': '<',
    '.': '>',
    '/': '?',
    '\\': '|'
};

/** 
 * Maps JavaScript to ASCII character codes (at least the ones we care about).
 */
DeviceDriverKeyboard.prototype.specialSymbolCodes = 
{
    192: 96, // `
    189: 45, // -
    187: 61, // =
    219: 91, // [
    221: 93, // ]
    186: 59, // ;
    222: 39, // '
    188: 44, // ,
    190: 46, // .
    191: 47, // /
    220: 92  // \
};

// Override the base method pointers.

DeviceDriverKeyboard.prototype.driverEntry = function()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "Loaded.";
    // More?
};

DeviceDriverKeyboard.prototype.isr = function(params)
{
    // Parse the params.
    var keyCode = params[0];
    var isShifted = params[1];
    
    if (keyCode == null || typeof keyCode !== "number" || isShifted == null)
    {
        Kernel.trapError("Error in keyboard driver ISR.");
        return;
    }
    
    Kernel.trace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";
    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        Kernel.inputQueue.enqueue(chr);        
    }
    else if ( ((keyCode >= 48) && (keyCode <= 57))   ||  // digits...
              ((keyCode >= 186) && (keyCode <= 192)) ||  // special characters...
              ((keyCode >= 219) && (keyCode <= 222)) )   // more special characters...
    {
        // Special keys like `, -, =, et cetera, produce JavaScript codes - convert to ASCII
        if (keyCode > 127)
            keyCode = this.specialSymbolCodes[keyCode];
            
        chr = String.fromCharCode(keyCode);
        if (isShifted)
            chr = this.shiftedSymbols[chr];
        Kernel.inputQueue.enqueue(chr);
    }
    else if ( (keyCode == 32) ||   // space
              (keyCode == 13) ||   // enter
              (keyCode == 8) )     // backspace
    {
        chr = String.fromCharCode(keyCode);
        Kernel.inputQueue.enqueue(chr); 
    }
};
