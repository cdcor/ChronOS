/* ----------
   controlReadyQueueDisplay.js
   
   Handles all interaction associated with the ready queue display.
   ---------- */
  
function ReadyQueueDisplay() {}

ReadyQueueDisplay.display = null;

/**
 * Initializes the ready queue display. 
 */
ReadyQueueDisplay.init = function()
{
	ReadyQueueDisplay.display = $("#readyQueueDisplay");
};

/**
 * Updates the ready queue display. 
 */
ReadyQueueDisplay.update = function()
{
	var displayData = "", processes = Kernel.readyQueue.getContents();
	
	for (var i = 0; i < processes.length; i++)
		displayData += "<br>" + processes[i].toString(true);
	
	// Remove first line break.
	displayData = displayData.replace("<br>", "");
	
	ReadyQueueDisplay.display.html(displayData);
};
