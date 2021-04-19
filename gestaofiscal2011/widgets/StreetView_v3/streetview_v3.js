////////////////////////////////////////////////////////////////////////////////
////                  ////
////    street view specific events        ////
////                  ////
////////////////////////////////////////////////////////////////////////////////
var panorama;
var streetviewHeight=250;
var visibleStreetView = false;
var sv = new google.maps.StreetViewService();
function initialize_container()
{

 // create container
 var obj = getSWF("theApp");
 // console.log(obj);
 obj.height = getPageHeight() - streetviewHeight;
 
 
 //div principal
// var divMain = document.createElement("div");   
// divMain.id = "main";                
// divMain.style.height = svh;
// divMain.style.position = "absolute";
// divMain.style.bottom = "0px";
// divMain.style.right = "0px";
// divMain.style.left = "0px";

 //div panoramico, onde fica o street view
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
	addEvent(window, "resize", windowResized ); 

// divMain.style.bottom = "0px";
// divMain.style.right = "0px";
// divMain.style.left = "0px";
// divTag.style.bottom = "0px";



// //div do botão full screen
// var divCmd = document.createElement("div");   
// divCmd.id = "divBto";                
// divCmd.style.width = "100%";
// divCmd.style.position = "absolute";
// divCmd.style.zIndex = "999999999999999999";
// 
// //botão full screen
// var btoFullScreen = document.createElement("input");
// btoFullScreen.id = "btoFullScreen";
// btoFullScreen.type = "BUTTON";
// btoFullScreen.name = "FullScreen";
// btoFullScreen.value = "FullScreen";
// btoFullScreen.style.cssFloat = "right";
 
 //adicionando divi´s uma a outra
// divCmd.appendChild(btoFullScreen);
// divMain.appendChild(divTag);
// divMain.appendChild(divCmd);
// document.body.appendChild(divMain);

 //document.body.appendChild(btoFullScreen);


}
function initialize_streetview(long,lat,head)
{
 try {
 	 
     var loc = new google.maps.LatLng(long,lat);
     var panoramaOptions = {
      position: loc,
      pov: {
        heading:head,
        pitch:0,
        zoom:1
      }};

     if (document.getElementById("pano"))
     {
	      panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), panoramaOptions); 
	      google.maps.event.addListener(panorama, 'visible_changed',showPanoData);
	      google.maps.event.addListener(panorama, 'position_changed', position_changed);
	      google.maps.event.addListener(panorama, 'pov_changed', pov_changed);
	      sv.getPanoramaByLocation(loc,50, function(result, status){
	    	 if(status != "OK"){
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
	    	 
	      });
	      
	      
	    	
     }

 } catch(err) {
  alert(err + "\n" + "Is here"); 
 }
 
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
	panorama.setLocationAndPOV(panoData.location.latlng);
}

function openPopup(url)
{
	var popup = window.open(url, "_blank", "menubar=1,location=0,toolbar=0,status=0,directories=0,width=" + screen.width + ",height=" + screen.height);
	popup.moveTo(0, 0);
}

function position_changed()
{
 
 visibleStreetView = true;
 var pt = panorama.getPosition();
 var head = panorama.getPov().heading;
 var obj= getSWF("theApp");
 // console.log(obj);
 obj.theFlexFunction(pt.lat(),pt.lng(),head);
 // console.log("theFlexFunction");

}
function pov_changed()
{
 visibleStreetView = true;
 var pt = panorama.getPosition();
 var head = panorama.getPov().heading;
 var obj = getSWF("theApp");
 obj.theFlexFunction(pt.lat(),pt.lng(),head);
}


function removeStreetview()
{
 try{
  var theDiv = document.getElementById("pano");
  if(theDiv !=null)
  {
   document.body.removeChild(theDiv); 
   theDiv = null;
   panorama = null;
   var obj= getSWF("theApp");
   obj.height = "100%";
  }
    }catch(err){
  alert(err);
 }
}
function restoreStreetview()
{
 try
 {
  var theDiv = document.getElementById("pano");
  if(theDiv!=null)
  {
   var obj= getSWF("theApp");
   obj.height = getPageHeight() - streetviewHeight;
   theDiv.style.display = "block";
  }
 }catch(err){
 }
}
function minimizeStreetview()
{
 try
 {
  var theDiv = document.getElementById("pano");
  if(theDiv!=null)
  {
   var obj= getSWF("theApp");
   obj.height = "100%";
   theDiv.style.display = "none";
  } 
 }catch(err){
  alert(err);
 }
}
////////////////////////////////////////////////////////////////////////////////
////                  ////
////    default page events          ////
////                  ////
////////////////////////////////////////////////////////////////////////////////
var addEvent = function(elem, type, eventHandle) { 
    if (elem == null || elem == undefined) return; 
    if ( elem.addEventListener ) { 
        elem.addEventListener( type, eventHandle, false ); 
    } else if ( elem.attachEvent ) { 
        elem.attachEvent( "on" + type, eventHandle ); 
    } 
}; 
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
function windowResized()
{
 try{
  if(panorama!=null){
   var theDiv = document.getElementById("pano");
   if(theDiv!=null)
   {
    if (theDiv.style.display != "none")
    {
     var obj= getSWF("theApp");
     obj.height = getPageHeight() - streetviewHeight;
     panorama.checkResize();
     
    }
   }
  } 
 }catch(err){
 }
}