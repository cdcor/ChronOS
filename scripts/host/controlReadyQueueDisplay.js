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
	var processes = Kernel.getActiveProcesses();
	
	if (processes.length === 1 && !processes[0])
	{
		ReadyQueueDisplay.display.html("");
		return;
	}
	
	var displayData = '<table id="readyQueueDisplayTable">';
	
	displayData += "<tr><td>#</td><td>PID</td><td>PC</td><td>ACC</td><td>X</td><td>Y</td><td>Z</td><td>Page</td></tr>";
	
	for (var i = 0; i < processes.length; i++)
	{
		// Ensure there is an active process
		if (processes[i])
		{
			displayData += "<tr><td>" + (i === 0 ? "A" : i - 1) + "</td>" +
					"<td>" + processes[i].pid + "</td>" +
					"<td>" + processes[i].pc + "</td>" +
					"<td>" + processes[i].acc + "</td>" +
					"<td>" + processes[i].xReg + "</td>" +
					"<td>" + processes[i].yReg + "</td>" +
					"<td>" + processes[i].zFlag + "</td>" +
					"<td>" + Math.floor(processes[i].base / MEMORY_BLOCK_SIZE) + "</td></tr>";
		}
	}
	
	displayData += "</table>";
	
	ReadyQueueDisplay.display.html(displayData);
};

/**
 * Clears the display. 
 */
ReadyQueueDisplay.clear = function()
{
	ReadyQueueDisplay.display.html("");
};
