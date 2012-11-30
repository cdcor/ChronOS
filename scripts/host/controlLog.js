/* ----------
   controlLog.js
   
   Requires globals.js.
   
   Manages the log div to simulate the host log.
   ---------- */
  
function Log() {}

Log.lastMessage = "";
Log.repeatedMessageCount = 1;

// Adds the specified message to the log.
Log.add = function(message, source, clock)
{
	var time = Log.getCurrentDateStamp();
	
	if (Log.lastMessage === message)
	{
        if (message != null && source != null && clock != null)
	    {
	        newMessage = '&nbsp;&nbsp;&nbsp;' +
	                     Log.applyStyle(time, '#666', null, '8pt') + '<br />' + 
	                     Log.applyStyle(clock, null, 'bold') + ' '+ 
	                     Log.applyStyle(source, 'blue', 'bold') + ' ' + 
	                     Log.applyStyle('[' + (++Log.repeatedMessageCount) + '] ', null, null, '10pt') + 
	                     Log.applyMessageStyle(message);
	    }
        
        var newContents = $('#log').html().replace(/(.*?<br>){2}/, newMessage + '<br />');
        $('#log').html(newContents.substr(0, MAX_LOG_SIZE));
	}
	else
	{
		Log.repeatedMessageCount = 1;
		
	    if (message != null && source != null && clock != null)
	    {
	        newMessage = '&nbsp;&nbsp;&nbsp;' +
	                     Log.applyStyle(time, '#666', null, '8pt') + '<br />' + 
	                     Log.applyStyle(clock, null, 'bold') + ' '+ 
	                     Log.applyStyle(source, 'blue', 'bold') + ' ' + 
	                     Log.applyMessageStyle(message);
	    }
	    
	    var newContents = newMessage + '<br />' + $('#log').html();
	    $('#log').html(newContents.substr(0, MAX_LOG_SIZE));
   }
   
   Log.lastMessage = message;
};

Log.clear = function() 
{
	$('#log').html("");
};

// Gets a date stamp appropriate for a log.
Log.getCurrentDateStamp = function()
{
    var now = new Date();
    
    var time = [now.getMonth() + 1, 
                now.getDay() + 1, 
                now.getFullYear(), 
                now.getHours(), 
                now.getMinutes(), 
                now.getSeconds(), 
                now.getMilliseconds()];

    // Prepend a '0' to elements < 10
    for (var i = 0; i < time.length; i++)
        time[i] = time[i] < 10 ? '0' + time[i] : time[i];
        
    return time[0] + '.' + time[1] + '.' + time[2] + ' ' + time[3] + ':' + time[4] + ':' + time[5] + '.' + time[6];
};

// Applies the specified style to the parameters given returned in html.
Log.applyStyle = function(text, color, weight, size)
{
    color = color != null ? 'color: ' + color + ';' : '';
    weight = weight != null ? 'weight: ' + weight + ';' : '';
    size = size != null ? 'font-size: ' + size + ';' : '';
    
    return '<span style="' + color + ' ' + weight + ' ' + size + '">' + text + "</span>";
};

// Applies a style to be specifically used for a message.
Log.applyMessageStyle = function(message)
{
    if (message.search(/idle/i) != -1) // Idle shows up more often, so it's more efficient to find it first
        message = message;
    else if (message.search(/(shutdown|failed|fault|abort|terminate|kill|warn)/i) != -1)
        message = Log.applyStyle(message, '#FF7700');
    else if (message.search(/(emergency|halt|error)/i) != -1)
        message = Log.applyStyle(message, 'red');
    else if (message.search(/(file|swap|roll)/i) != -1)
    	message = Log.applyStyle(message, '#7603CE');
    else 
        message = Log.applyStyle(message, 'green');
        
    return message;
}
