var g_panorama;   
var panoClient;
var nextPanoId;
var streetviewHeight=250;

var addEvent = function(elem, type, eventHandle) { 
    if (elem == null || elem == undefined) return; 
    if ( elem.addEventListener ) { 
        elem.addEventListener( type, eventHandle, false ); 
    } else if ( elem.attachEvent ) { 
        elem.attachEvent( "on" + type, eventHandle ); 
    } 
}; 
function getPageHeight()
{
	var vpHeight;
	if (typeof window.innerHeight != 'undefined')
	{
		vpHeight = window.innerHeight;
	}
	else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0 )
	{	
		vpHeight = document.documentElement.clientHeight;
	}
	else
	{
		vpHeight = document.getElementsByTagName('body')[0].clientHeight;
	}
	return vpHeight;
}
function loadStreetview(lat,long,theyaw,thepitch)
{
	var obj= getSWF("theApp");
	obj.height = getPageHeight() - streetviewHeight;
	
	var svh = streetviewHeight + "px";
	var divTag = document.createElement("div");                
	divTag.id = "pano";                
	divTag.style.width = "100%";
	divTag.style.height = svh;
	divTag.style.position = "absolute";
	divTag.style.bottom = "0px";
	divTag.style.right = "0px";
	divTag.style.left = "0px";
	document.body.appendChild(divTag);

	  var panoramaOptions = {
		    	streetViewControl: true,	
				navigationControlOptions: true
				
	  };
	panoClient = new GStreetviewClient();  
	g_panorama = new GStreetviewPanorama(document.getElementById("pano"), panoramaOptions);

	pt = new GLatLng(lat,long);
	myPOV = {yaw:theyaw,pitch:thepitch};	
	g_panorama.setLocationAndPOV(pt, myPOV);
	GEvent.addListener(g_panorama, "error", handleNoFlash);
	GEvent.addListener(g_panorama, "yawchanged", streetYaw);
	panoClient.getNearestPanorama(pt, showPanoData);

	addEvent(window, "resize", windowResized ); 
}
function showPanoData(panoData) 
{
	if (panoData.code != 200) {
		//GLog.write('showPanoData: Server rejected with code: ' + panoData.code);
		try{
			var obj= getSWF("theApp");
			obj.noPanoAvailable("false");
		}catch(err){
		}
		return;
	}else{
		try{
			var obj= getSWF("theApp");
			obj.noPanoAvailable("true");
		}catch(err){
		}
	}
	g_panorama.setLocationAndPOV(panoData.location.latlng);
}
function setPanorama( lat, lon ) 
{
	
	panoClient.getNearestPanorama(new GLatLng(lat, lon), showPanoData);
}
function removeStreetview()
{
	try{
		g_panorama = null;
		GUnload();
		var obj= getSWF("theApp");
		obj.height = "100%";
    	var theDiv = document.getElementById("pano");
		if(theDiv)
		{
			document.body.removeChild(theDiv);	
		}
    }catch(err){
		alert(err);
	}
}
function restoreStreetview()
{
	try
	{
		var obj= getSWF("theApp");
		obj.height = getPageHeight() - streetviewHeight;
		var theDiv = document.getElementById("pano");
		theDiv.style.display = "block";
	}catch(err){
	}
}
function minimizeStreetview()
{
	try
	{
		var obj= getSWF("theApp");
		obj.height = "100%";
		var theDiv = document.getElementById("pano");
		theDiv.style.display = "none";
	}catch(err){
		alert(err);
	}
}
function streetYaw(yaw)
{
	try{
		pt = g_panorama.getLatLng();
		var obj= getSWF("theApp");
		obj.theFlexFunction(pt.lat(),pt.lng(),yaw);
	}
	catch(err){//Handle errors here
		//alert(err);
	}	
}
function handleNoFlash(errorCode) 
{
	if (errorCode == 603) 
	{
		alert("Error: Flash doesn't appear to be supported by your browser");
		return;
	}
}
function windowResized()
{
	try{
		if(g_panorama){
			var obj= getSWF("theApp");
			obj.height = getPageHeight() - streetviewHeight;
			g_panorama.checkResize();
		}	
	}catch(err){
	}
}
function getSWF(swfName) {
	if (navigator.appName.indexOf("Microsoft") != -1) {
		return window[swfName];
	}
	else{
		if(document[swfName].length != undefined){
			return document[swfName][1];
		}
	return document[swfName];
	}
}
