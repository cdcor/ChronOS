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
		HardDriveDisplay.hoverInfo.css("left", e.pageX);
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
	console.log("Update");
	
	var data = Kernel.hddDriver.getContents(), currentData;
	
	var displayData = "";
	
	var t, s, b, row = 0;
	
	for (t = 0; t < data.length; t++)
	{
		for (s = 0; s < data[t].length; s++)
		{
			for (b = 0; b < data[t][s].length; b++)
			{
				currentData = data[t][s][b];
				
				if (!currentData)
				{
					HardDriveDisplay.display.html("Drive is corrupted.<br><br>" + 
							"Run shell command 'format'.");
					return;
				}
				
				displayData += '<div><strong>' + t + ':' + s + ':' + b + '&nbsp;</strong><div class="hddData">'
				               + currentData.substr(0, 2) + ' ' // Status
				               + currentData.substr(2, 6) + ' ' // TSB
				               + currentData.substr(8)
				               + '</div></div>';
				
				row++;
				
				if (row % 4 == 0)
					displayData += '<div class="separator"></div>';
			}
		}
		
		displayData += '<hr>';
	}
	
	HardDriveDisplay.display.html(displayData);
	
	HardDriveDisplay.setHoverFunction();
};

HardDriveDisplay.setHoverFunction = function()
{
	var blocks = $(".hddData"), block;
	
	for (var i = 0; i < blocks.length; i++)
	{
		block = $(blocks[i]);
		
		block.mouseenter(function() {
			HardDriveDisplay.hoverInfo.html(HardDriveDisplay.toDisplayTable(new File($(this).html())));
		});
	}
};

HardDriveDisplay.toDisplayTable = function(file)
{
	var status = file.status === File.STATUS_AVAILABLE ? "Available" : "Occupied";
	
	var table = '<table><tr><td>Status</td><td>Linked TSB</td><td>Data</td></tr>';
	
	table += '<tr><td>' + status + '</td><td>' + file.track + ':' + file.sector
		     + ':' + file.block + '</td><td>' + file.data + '</td></tr></table>';
		     
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
