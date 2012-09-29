/* ----------
   Handles the system clock display.
   ---------- */
  
function StatusBar() {}

StatusBar.interval = null;

// Sets the status text.
StatusBar.setStatus = function(status)
{
    $('#statusText').html(status);
    
    if (status === 'Operating')
        StatusBar.startClock();
    else if (status === 'Halted' || status === 'BSoD')
        StatusBar.freezeClock();
};

// Starts the status bar's clock.
StatusBar.startClock = function() 
{
    StatusBar.interval = setInterval('StatusBar.tickClock()', 1000);
};

// Updates the current time (should be called once a second).
StatusBar.tickClock = function() 
{
    $('#clock').html(StatusBar.getCurrentTime());
};

// Stops the status bar's clock from updating.
StatusBar.freezeClock = function() 
{
    if (StatusBar.interval != null)
        clearInterval(StatusBar.interval);
};

// Gets the current time appropriate for display in the status bar.
StatusBar.getCurrentTime = function() {
    var now = new Date();
    
    var date = now.toDateString();
    var hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    var minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    var seconds = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    
    return date + ' ' + hours + '.' + minutes + '.' + seconds;
};