/* ----------
   controlDisplays.js

   Requires globals.js
   
   Handles all interaction associated with the memory display
   ---------- */
  
function MemoryDisplay() {}

MemoryDisplay.display = null;

MemoryDisplay.lineHeight = 18;
MemoryDisplay.autoscroll = false;

/**
 * Initializes memory display.
 */ 
MemoryDisplay.init = function()
{
	MemoryDisplay.display = $("#memoryDisplay");
	MemoryDisplay.toggleAutoscroll();
};

/**
 * Updates the memory display with the current contents of memory.
 */
MemoryDisplay.update = function()
{
	if (Kernel.memoryManager == null)
		return;
	
	var memory = Kernel.memoryManager.getDisplayContents();
	var earliestChangedAddress = MEMORY_SIZE;
	var subIndex;
	
	var displayData = '<table id="memoryDisplayTable">';
	
	for (var i = 0; i < memory.length; i++)
	{
		subIndex = i % MEMORY_DISPLAY_ADDRESSES_PER_LINE;
		
		if (subIndex === 0) // Move to next line
			displayData += "<tr><td>" + MemoryDisplay.formatAddress(i) + "</td>";
			
		// Color the data according to the current status of the word.
		if (memory[i].status === MemoryWord.STATUS_NORMAL)
			displayData += "<td>" + MemoryDisplay.formatData(memory[i].data) + "</td>";
		else if (memory[i].status === MemoryWord.STATUS_READ)
		{
			displayData += '<td><span style="color: green;"><strong>' + MemoryDisplay.formatData(memory[i].data) + "</strong></span></td>";
			
			if (earliestChangedAddress > i)
				earliestChangedAddress = i;
		}
		else if (memory[i].status === MemoryWord.STATUS_WRITTEN)
		{
			displayData += '<td><span style="color: blue;"><strong>' + MemoryDisplay.formatData(memory[i].data) + "</strong></span></td>";
			
			if (earliestChangedAddress > i)
				earliestChangedAddress = i;
		}
		
		if (subIndex === MEMORY_DISPLAY_ADDRESSES_PER_LINE - 1)
			displayData += "</tr>";
	}
	
	displayData += "</table>";
	
	// Update div with new contents
	MemoryDisplay.display.html(displayData);
	
	if (earliestChangedAddress === MEMORY_SIZE)
		earliestChangedAddress = 0;
	
	if (MemoryDisplay.autoscroll)
		MemoryDisplay.scrollTo(earliestChangedAddress);
	
	Kernel.memoryManager.resetDisplayContents();
};

MemoryDisplay.clear = function()
{
	MemoryDisplay.display.html("");
};

/**
 * Formats the given address to a representation appropriate for the display.
 * 
 * @param {Number} address the address to format
 * 
 * @return {String} the formatted address
 */ 
MemoryDisplay.formatAddress = function(address)
{
	// Convert to base 16.
	var displayAddress = address.toString(16).toUpperCase();
	// Prepend 0s to reach a consistent length.
	for (var i = displayAddress.length; i < 3; i++)
		displayAddress = "0" + displayAddress;
	// Prepend 0x to indicate a hex number.
	return "0x" + displayAddress;
};

/**
 * Formats the given data to a representation appropriate for the display.
 *  
 * @param {Number} data the data to format
 * 
 * @return {String} the formatted data
 */
MemoryDisplay.formatData = function(data)
{
	// Convert to base 16.
	var displayData = data.toString(16).toUpperCase();
	// Prepend a 0 if length is 1.
	return displayData.length === 1 ? "0" + displayData : displayData;
};

/**
 * Scrolls the display to the given address.
 * 
 * @param {Number} address the address to scroll to
 * @param {Number} speed (optional) the speed at which to animate the scroll
 */ 
MemoryDisplay.scrollTo = function(address, speed)
{
	if (!speed)
		MemoryDisplay.display[0].scrollTop = MemoryDisplay.lineHeight * Math.floor(address / MEMORY_DISPLAY_ADDRESSES_PER_LINE);
	else
	{
		MemoryDisplay.display.animate({
			scrollTop : MemoryDisplay.lineHeight * Math.floor(address / MEMORY_DISPLAY_ADDRESSES_PER_LINE)
		}, speed, "swing");
	}
};

/**
 * Toggles autoscrolling of the display on each update.
 */ 
MemoryDisplay.toggleAutoscroll = function()
{
	if (MemoryDisplay.autoscroll)
		$("#chkbxAutoscroll").css("background-image", "url('images/check-empty.png')");
	else
		$("#chkbxAutoscroll").css("background-image", "url('images/check-full.png')");
	
	MemoryDisplay.autoscroll = !MemoryDisplay.autoscroll;
}
