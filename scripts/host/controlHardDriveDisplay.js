/* ----------
   controlHardDriveDisplay.js
   ---------- */
  
function HardDriveDisplay() {}

HardDriveDisplay.container = null;
HardDriveDisplay.display = null;
HardDriveDisplay.displayOptions = null;

HardDriveDisplay.hoverInfo = null;

HardDriveDisplay.regularTop = null;
HardDriveDisplay.regularLeft = null;
HardDriveDisplay.regularWidth = null;
HardDriveDisplay.regularHeight = null;
HardDriveDisplay.optionsRegularLeft = null;

HardDriveDisplay.animateSpeed = 400;

HardDriveDisplay.init = function()
{
	HardDriveDisplay.container = $("#memoryContainer");
	HardDriveDisplay.display = $("#hddDisplay");
	HardDriveDisplay.displayOptions = $("#hddOptions");
	
	HardDriveDisplay.hoverInfo = $("#hddHoverInfo");
	
	HardDriveDisplay.display.mouseenter(function() {
		HardDriveDisplay.hoverInfo.show();
	});
	
	HardDriveDisplay.display.mouseleave(function() {
		HardDriveDisplay.hoverInfo.hide();
	});	
	
	$(document).mousemove(function(e) {
		var width = parseInt(HardDriveDisplay.hoverInfo.css("width")) + 4;
		var windowWidth = parseInt($(window).width());
		HardDriveDisplay.hoverInfo.css("left", e.pageX + width > windowWidth ? windowWidth - width : e.pageX);
		HardDriveDisplay.hoverInfo.css("top", e.pageY + 10);
   	});
	
	HardDriveDisplay.regularTop = HardDriveDisplay.container.css("top");
	HardDriveDisplay.regularLeft = HardDriveDisplay.container.css("left");
	HardDriveDisplay.regularWidth = HardDriveDisplay.display.css("width");
	HardDriveDisplay.regularHeight = HardDriveDisplay.display.css("height");
	HardDriveDisplay.optionsRegularLeft = HardDriveDisplay.displayOptions.css("left");
}

HardDriveDisplay.update = function()
{
	var data = Kernel.hddDriver.getContents(), currentData;
	
	var displayData = "";
	
	var t, s, b, row = 0, zeroCount = 0, breakPlaced = false;
	
	for (t = 0; t < data.length; t++)
	{
		for (s = 0; s < data[t].length; s++)
		{
			for (b = 0; b < data[t][s].length; b++)
			{
				currentData = data[t][s][b];
				
				if (!currentData)
				{
					HardDriveDisplay.display.html("Drive is corrupted.<br><br>Run shell command 'format'.");
					return;
				}
				
				if (!(/[^\s0]/).test(currentData)) // All zeros
					zeroCount++;
				else
					zeroCount = 0;
				
				// If already placed two rows of zeros or at the end of the iteration
				if (zeroCount < 2 || ((t === data.length - 1) && (s === data[t].length - 1) && (b >= data[t][s].length - 2)))
				{
					displayData += '<div><strong>' + t + ':' + s + ':' + b + '&nbsp;</strong>' 
				                + '<div class="hddData">'
				                + currentData.substr(0, 2) + ' ' // Status
				                + currentData.substr(2, 6) + ' ' // TSB
				                + currentData.substr(8)          // Data
				                + '</div></div>';
					breakPlaced = false;
				}
				else if (!breakPlaced)
				{
					displayData += '<hr>';
					breakPlaced = true;
				}
				
				row++;
				
				if (row % 4 == 0)
					displayData += '<div class="separator"></div>';
			}
		}
	}
	
	HardDriveDisplay.display.html(displayData);
	
	HardDriveDisplay.setHoverFunction();
};

HardDriveDisplay.linkedBlock = null;

HardDriveDisplay.setHoverFunction = function()
{
	var blocks = $(".hddData"), block;
	
	for (var i = 0; i < blocks.length; i++)
	{
		block = $(blocks[i]);
		
		block.mouseenter(function() {
			var fileStr = $(this).html();
			HardDriveDisplay.hoverInfo.html(HardDriveDisplay.toDisplayTable(File.fileFromStr(fileStr)));
			
			var linkedTSB = parseInt(fileStr.substr(3, 2)) + ":" + parseInt(fileStr.substr(5, 2)) + ":" + parseInt(fileStr.substr(7, 2));
			if (linkedTSB !== "0:0:0")
			{
				HardDriveDisplay.linkedBlock = $('#hddDisplay div:contains("' + linkedTSB + '")');
				HardDriveDisplay.linkedBlock.css("background-color", "#19F7FF");
			}
		});
		
		block.mouseleave(function() {
			if (HardDriveDisplay.linkedBlock)
				HardDriveDisplay.linkedBlock.css("background-color", "transparent");
		})
	}
};

HardDriveDisplay.toDisplayTable = function(file)
{
	var status = file.status === File.STATUS_AVAILABLE ? "Available" : "Occupied";
	
	var table = '<table><tr><td>Status</td><td>Linked TSB</td><td>Data</td></tr>';
	
	table += '<tr><td>' + status + '</td><td>' + file.linkedTrack + ':' + file.linkedSector
		     + ':' + file.linkedBlock + '</td><td>' + file.data + '</td></tr></table>';
		     
	return table;
};

HardDriveDisplay.expand = function()
{	
	$("#hddHeader").hide();
	$("#hddExpandedHeader").show();
	
	HardDriveDisplay.container.css("z-index", "100");
	
	$("#btnExpandHdd").hide();
	$("#btnRestoreHdd").show();
	
	HardDriveDisplay.container.animate({
		top: "1px",
		left: "-628px" // "-520px"
	}, HardDriveDisplay.animateSpeed, "swing");
	
	HardDriveDisplay.display.animate({
		width: "1106px", // "891px"
		height: "580px"
	}, HardDriveDisplay.animateSpeed, "swing");
	
	HardDriveDisplay.displayOptions.animate({
		left: "1112px" // "897px"
	}, HardDriveDisplay.animateSpeed, "swing");
};

HardDriveDisplay.restore = function()
{
	var afterRestore = function()
	{
		$("#hddExpandedHeader").hide();
		$("#hddHeader").show();
		
		HardDriveDisplay.container.css("z-index", "0");
		
		$("#btnRestoreHdd").hide();
		$("#btnExpandHdd").show();
	};
	
	HardDriveDisplay.container.animate({
		top: HardDriveDisplay.regularTop,
		left: HardDriveDisplay.regularLeft
	}, HardDriveDisplay.animateSpeed, "swing");
	
	HardDriveDisplay.display.animate({
		width: HardDriveDisplay.regularWidth,
		height: HardDriveDisplay.regularHeight
	}, HardDriveDisplay.animateSpeed, "swing", afterRestore);
	
	HardDriveDisplay.displayOptions.animate({
		left: HardDriveDisplay.optionsRegularLeft
	}, HardDriveDisplay.animateSpeed, "swing");
};
