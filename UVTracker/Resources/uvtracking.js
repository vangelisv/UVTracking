var win = Titanium.UI.currentWindow;
var prevLocTime;
var currLocTime;
var trackSelection;
var LOC_RESOLUTION;   // distance in meters (radius) or in degrees (lat,lon) that defines a different location
var UVI_RESOLUTION;   // distance (meters, radius as above) that defines different UV index location
var TIME_RESOLUTION;  // How often UVI, and/or weather need to be checked

// all values below to come from settings
LOC_RESOLUTION = 20 // meters
UVI_RESOLUTION = 1000 // meters
TIME_RESOLUTION = 30 // seconds, set it to minutes in production


Ti.include('uvindex.js');

// initialise these structures
prevLocTime = {latitude:0,longitude:0,time:new Date(),uvi:0,tracking:true};
currLocTime = {latitude:0,longitude:0,time:new Date(),uvi:0,tracking:true};

var trackAlert = Titanium.UI.createAlertDialog(
	{title: 'UV Service error',message: 'Do you want to track UV in this location?',buttonNames: ['Yes','No']});
	
trackAlert.addEventListener('click', function(evt) 
{
	Ti.API.info('clicked button' + evt.index);	
	if (evt.index == 0) {
		trackSelection = true
	} else {trackSelection = false};
})		



win.add(tblUVData);  // add table to the window	

// this is a call back from the Onload in the get_uvi_date
// when uv data have been received from the service, show them 
// in the uv tracking window. 
function show_uvi_tracking () {
	
	var data = [];
	var ll;
	UVIData = JSON.parse(this.responseText);	
	actInd.hide();
			
	tblUVData.setData([]);
	if (UVIData.length > 2) {
		ll = 2
	}
	else {ll = UVIData.length;
	} 
		
	for (var cc=0;cc<ll;cc++) {	
		Ti.API.info('preparing row '+ cc);		
		data.push(populate_uvdata_row(UVIData[cc]));		
	}	
	tblUVData.setData(data);
}

function known_location(Location) {
	return(true);
}


// Event fired when location changed 
// at the moment from the Map, normally from GeoLocation
Ti.API.addEventListener('locationChanged', function(evt) {
	Ti.API.info('location change event accepted' + evt.latitude + evt.longitude);
	currLocTime.latitude = evt.latitude;
	currLocTime.longitude = evt.longitude;
	
	currLocTime.tracking = false; // unknown yet at this point
	
	// code here to check if LocTime is a known location.
	if (known_location(currLocTime)) {		
		// since it is known you also know if it is a tracking or not
		Ti.API.info('known location');
	} else { 
		// location unknown here. Offer to save it as a known location 
		Ti.API.info('unknown location');
		trackAlert.show();
	};
	uv_track();
});

// Here the actual uv_tracking takes place. This is called either by 
// time_elapsed or by location_changed.
// prevLocTime and currLocTime are known. 
// Calculate UV track as prevLocTime plus the time from currLocTime
// 

function uv_track() {
	
	//var hours = currentTime.getHours();
	//var minutes = currentTime.getMinutes();
	//Ti.API.info(hours+':'+minutes);
	
	Ti.API.info('prevLocTime' + prevLocTime);
	Ti.API.info('currLocTime' + currLocTime);

	if (prevLocTime.tracking) {  // if previous location was a tracking location
		// do the actual tracking here
	}		
	get_uvi_data(currLocTime.latitude,currLocTime.longitude, show_uvi_tracking);
	// Show the current location tracking characteristics on the window
	// Now the currLocTime is saved into previous. Prepare for next tracking
	prevLocTime = currLocTime;
}

function time_elapsed() {
	currLocTime.time = new Date();
	// If time elapsed then currLoc = prevLoc
	currLocTime.latitude = prevLocTime.latitude;
	currLocTime.longitude = prevLocTime.longitude;
	uv_track();
}

// Here we set the track function to be executed at time intervals (4 sec)  
var irvlfun = setInterval(time_elapsed, 300000); // 5 minutes 
//clearInterval(irvlfun);
// var irvlfun = setInterval(track, 4000);
