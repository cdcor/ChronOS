/* ----------
   controlMode.js
   ---------- */
  
function ControlMode() {}

ControlMode.mBanner = null;
ControlMode.kBanner = null;

ControlMode.animateSpeed = 1000;

ControlMode.init = function()
{
	ControlMode.mBanner = $("#mBanner");
	ControlMode.kBanner = $("#kBanner");
};

ControlMode.toggleKlingonMode = function()
{
	_KlingonMode = !_KlingonMode;
	
	if (_KlingonMode)
	{
		ControlMode.mBanner.animate({
			"background-position" : "-40px",
			"opacity" : "0.0"
		}, ControlMode.animateSpeed);
		
		ControlMode.kBanner.animate({
			"background-position" : "-40px",
			"opacity" : "1.0"
		}, ControlMode.animateSpeed);
		
		$("#tableBanner").animate({
			"height" : "110px"
		}, ControlMode.animateSpeed);
		
		$("#kShellBackground").animate({
			"opacity" : "0.4"
		}, ControlMode.animateSpeed);
	}
	else
	{
		ControlMode.mBanner.animate({
			"background-position" : "0px",
			"opacity" : "1.0"
		}, ControlMode.animateSpeed);
		
		ControlMode.kBanner.animate({
			"background-position" : "0px",
			"opacity" : "0.0"
		}, ControlMode.animateSpeed);
		
		$("#tableBanner").animate({
			"height" : "100px"
		}, ControlMode.animateSpeed);
		
		$("#kShellBackground").animate({
			"opacity" : "0.0"
		}, ControlMode.animateSpeed);
	}
};
