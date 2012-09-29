/* ----------
   Handles the suprise console command.
   ---------- */
  
function DisplaySecret() {}

DisplaySecret.init = function() {
    $('#backgroundAnimation').css('background-color', '#999');
    
    DisplaySecret.resize();
    
    $('#backgroundAnimation').hide();
    
    // TODO Temporary
    $('#backgroundCircuit').hide();
};

DisplaySecret.started = false;

DisplaySecret.resize = function()
{
    $('.background').css('height', window.innerHeight);
    $('.background').css('width', window.innerWidth);
};


DisplaySecret.animate = function()
{
    if (!DisplaySecret.started)
    {
        DisplaySecret.started = true;
        setInterval('DisplaySecret.animateStart();', 5000);
    }
};

DisplaySecret.animateStart = function()
{
    $('#backgroundAnimation').effect('blind', { mode: 'show' }, 1000);
    setTimeout('DisplaySecret.animateEnd();', 1000);
};

DisplaySecret.animateEnd = function()
{
    $('#backgroundAnimation').fadeOut(1000);
};