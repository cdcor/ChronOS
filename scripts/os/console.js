/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */
  
function Console(canvas)
{
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    
    this.currentFont = DEFAULT_FONT;
    this.currentFontSize = DEFAULT_FONT_SIZE;
    this.currentXPosition = 0;
    this.previousLineXPosition = 0; // For handling backspacing to previous line, saves cursor position at end of line
                                    //   which varies based on the characters entered on that line
                                    // TODO: convert to a stack to handle an arbitrary number of lines to retreat
    this.currentYPosition = DEFAULT_FONT_SIZE;
    this.buffer = "";
    
    this.init();
}

Console.prototype.init = function()
{
    // Enable the added-in canvas text functions (see canvastext.js for provenance and details).
    CanvasTextFunctions.enable(this.context);
    
    this.clearScreen();
    this.resetXY();
};

Console.prototype.clearScreen = function()
{
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Console.prototype.resetXY = function()
{
    this.currentXPosition = 0;
    this.currentYPosition = this.currentFontSize;
};

Console.prototype.handleInput = function()
{
    while (Kernel.inputQueue.size() > 0)
    {
        // Get the next character from the kernel input queue.
        var chr = Kernel.inputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
        if (chr == String.fromCharCode(13))  // Enter key   
        {
            // The enter key marks the end of a console command, so ...
            // ... tell the shell ... 
            _OsShell.handleInput(this.buffer);
            // ... and reset our buffer.
            this.buffer = "";
        }
        // TODO: Write a case for Ctrl-C.
        else if (chr == String.fromCharCode(8)) // Backspace key
        {
            // Only has any effect if the buffer is not empty
            if (this.buffer.length > 0) 
            {
                // Remove from the screen
                this.deleteChar(this.buffer.charAt(this.buffer.length - 1));
                // Remove last char from the buffer
                this.buffer = this.buffer.slice(0, this.buffer.length - 1);
            }
        }
        else
        {               
            // This is a "normal" character, so ...
            // ... draw it on the screen...
            this.putText(chr);
            // ... and add it to our buffer.
            this.buffer += chr;
        }
    }
};

Console.prototype.putText = function(text)
{
    // For wrapping to next line. TODO: Word wrapping if time
    for (var i = 0; i < text.length; i++)
    {
        // Get character and offset
        var chr = text.charAt(i);
        var offset = this.context.measureText(this.currentFont, this.currentFontSize, chr);
        
        // Advance line if there isn't enough room to draw the character.
        if (this.currentXPosition > this.canvas.width - offset)
        {
            // Save last X position in case of backspace
            this.previousLineXPosition = this.currentXPosition;
            this.advanceLine();
        }
            
        // Draw the text at the current X and Y coordinates.
        this.context.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, chr);
        // Move the current X position.
        this.currentXPosition += offset;
    }
};

Console.prototype.deleteChar = function(chr)
{
    // Move the current X postion to before the character.
    var offset = this.context.measureText(this.currentFont, this.currentFontSize, chr);
    this.currentXPosition -= offset;
    
    // Clear the area where the character was.
    this.context.clearRect(this.currentXPosition - 1, this.currentYPosition - DEFAULT_FONT_SIZE - 1, offset + 1, DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN + 2);
    
    if (this.CurrentXPosition <= 0)
        this.retreatLine(offset);
};

Console.prototype.advanceLine = function()
{
    this.currentXPosition = 0;
    this.currentYPosition += DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN;
    
    // If the Y position goes off the canvas...
    if (this.currentYPosition >= this.canvas.height)
        this.scroll(2);
};

Console.prototype.retreatLine = function()
{
    this.currentXPosition = this.previousLineXPosition;
    this.currentYPosition -= DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN;
};

Console.prototype.scroll = function(lines)
{
    // Default to 1 if lines is null.
    lines = lines == null ? 1 : lines;
    
    // Calculate offset base on number of lines to scroll.
    var offset = lines * (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN);
    
    // Move canvas contents up.
    var imageData = this.context.getImageData(0, offset, this.canvas.width, this.canvas.height - offset);
    this.context.putImageData(imageData, 0, 0);
    this.context.clearRect(0, this.canvas.height - offset, this.canvas.width, offset);
    
    // Set current Y position according to amount scrolled.
    this.currentYPosition -= offset;
};

Console.prototype.bsod = function()
{
    // var bsod = new Image();
    // bsod.src = 'images/bsod.png';
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.context.drawImage(bsod, 0, 0, this.canvas.width, this.canvas.height);
    
    // Drawing BSoD on canvas does not work everytime. Workaround:
    var bsod = '<img src="images/bsod.png" alt="bsod.png" style="border: 2px solid #666;"/>';
    $('#tdDisplay').html(bsod);
};
