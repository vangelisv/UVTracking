var win = Titanium.UI.currentWindow;
var prevLocTime;
var currLocTIme;
var trackSelection;

Ti.include('uvindex.js');

prevLocTime = {};
var trackAlert = Titanium.UI.createAlertDialog(
	{title: 'UV Service error',message: 'Do you want to track UV in this location?',buttonNames: ['Yes','No']});
	
trackAlert.addEventListener('click', function(evt) 
{
	Ti.API.info('clicked button' + evt.index);	
	if (evt.index == 0) {
		trackSelection = true
	} else {trackSelection = false};
}
)		


win.add(tblUVData);  // add table to the window	

// this is a call back from the Onload in the get_uvi_date
// when uv data have been received from the service, show them 
// in the uv tracking window. 
function show_uvi_tracking () {
	
	var data = [];
	UVIData = JSON.parse(this.responseText);	
	actInd.hide();
			
	tblUVData.setData([])
	for (var cc=0;cc<UVIData.length;cc++) {	
		Ti.API.info('preparing row '+ cc);		
		data.push(populate_uvdata_row(UVIData[cc]));		
	}	
	tblUVData.setData(data);
}

function known_location(Location) {
	return(true);
}

function track() {
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	Ti.API.info(hours+':'+minutes);
	if (prevLocTime == {})  // no previous LocTime, tracking just started
	{
	 	prevLocTime = {latitude:0,longitude:0,time:currentTime,tracking:true};		
		return;
	};	 
	if (prevLocTime.tracking) {  // if previous location was a tracking location
		// do the actual tracking here
	}
	LocTime = {
		latitude: 0,
		longitude: 0,
		time: currentTime,
		tracking: false // unknown yet at this point
	};
	// code here to check if LocTime is a known location.
	if (known_location(LocTime)) {		
		// since it is known you also know if it is a tracking or not
		Ti.API.info('known location');
	} else { 
		// location unknown here. Offer to save it as a known location 
		Ti.API.info('unknown location');
		trackAlert.show();
	};
	// now you now if loc is a tracking location
	prevLocTime = LocTime;
	get_uvi_data(LocTime.latitude,LocTime.longitude, show_uvi_tracking);
}

// Here we set the track function to be executed at time intervals (4 sec)  
var irvlfun = setInterval(track, 4000);
//clearInterval(irvlfun);
// var irvlfun = setInterval(track, 4000);
