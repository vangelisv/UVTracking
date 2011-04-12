var win = Titanium.UI.currentWindow;
var annotations = [];

var isAndroid = false;
if (Titanium.Platform.name == 'android') {
	isAndroid = true;
}


Ti.include('uvindex.js');
Ti.include('locations.js');



var centerAnnotation = Titanium.Map.createAnnotation({
	latitude:40,
	longitude:20,
	title:'center',
	pincolor:Titanium.Map.ANNOTATION_RED,
	animate:true
	});
var mountainView = Titanium.Map.createAnnotation({
	latitude:37.390749,
	longitude:-122.081651,
	title:"Appcelerator Headquarters",
	subtitle:'Mountain View, CA',
	pincolor: isAndroid ? "orange" : Titanium.Map.ANNOTATION_RED,
	animate:true,
	leftButton: '../images/appcelerator_small.png',
	rightButton: '../images/apple_logo.jpg',
	myid:1 // CUSTOM ATTRIBUTE THAT IS PASSED INTO EVENT OBJECTS
});


//
// PRE-DEFINED REGIONS
//
var regionAtlanta = {latitude:33.74511,longitude:-84.38993,animate:true,latitudeDelta:0.04, longitudeDelta:0.04};
var regionSV = {latitude:37.337681,longitude:-122.038193,animate:true,latitudeDelta:0.04, longitudeDelta:0.04};

//
// CREATE MAP VIEW
//
var mapview = Titanium.Map.createView({
	mapType: Titanium.Map.STANDARD_TYPE,
	region:{latitude:40.62, longitude:22.94, latitudeDelta:0.5, longitudeDelta:0.5},
	animate:true,
	regionFit:true,
	userLocation:true,
	annotations:[]
});

//
// CREATE ANNOTATIONS FROM LOCATIONS
//

function locations_to_annotations() {

	var annot;
	mapview.removeAllAnnotations();
	for(var ii=0;ii<locations.length;ii++) {
		annot = Titanium.Map.createAnnotation({
			latitude:locations[ii].latitude,
			longitude:locations[ii].longitude,
			title:locations[ii].title,
			pincolor:Titanium.Map.ANNOTATION_GREEN,
			pincolor: locations[ii].track ? Titanium.Map.ANNOTATION_GREEN : 3,
			animate:true
		});
		
		Ti.API.info('create annot from location' + annot + ' ' + annot.title);
		Ti.API.info('annot ' + ii + ' title =' + annot.title);
		Ti.API.info('annot ' + ii + ' lat =' + annot.latitude);
		Ti.API.info('annot ' + ii + ' long =' + annot.longitude);
		mapview.addAnnotation(annot);
	}	
}

locations_to_annotations();
mapview.addAnnotation(centerAnnotation);
Ti.API.info('annot count='+mapview.annotations.length);

if (!isAndroid) {
	mapview.addAnnotation(atlanta);
}

//mapview.selectAnnotation(centerAnnotation);
win.add(mapview);


//
// NAVBAR - MENU BUTTONS
//

var mtmAddNewCenter = null;
var mtmAddNewHere = null;
var mtmRemoveRow = null;
var mtmMapTable = null;
var mtmSat = null;
var mtmStd = null;
var mtmHyb = null;
var mtmZoomin = null;
var mtmZoomout = null;
		
function wireClickHandlers() {
		
	// Menu item click on add new location at center of map
	mtmAddNewCenter.addEventListener('click', function() {
		// Add new Location at center of map
		var newLocation = {title:'new location',
						subtitle:'description',
						leftButton:null, 
						rightButton:null,
						animation:true,
						pincolor:Titanium.Map.ANNOTATION_RED,
						myId:{id:locations.lentgh,track:true},
						track:true,
						latitude:centerAnnotation.latitude,
						longitude:centerAnnotation.longitude};	
		Ti.API.info('loc.length before adding'+locations.length)	;								  
		locations.push(newLocation);			
		Ti.API.info('loc.length after adding'+locations.length)	;
		locationsTable.appendRow(populate_location_row(locations.length-1));						
		winLocations.open();			
	});

	// Menu item click on add new location here (current location) 
	mtmAddNewHere.addEventListener('click', function() {
		// Get Geo location first here 
		var newLocation = {title:'new location',
						subtitle:'description',
						leftButton:null, 
						rightButton:null,
						animation:true,
						pincolor:Titanium.Map.ANNOTATION_RED,
						myId:{id:locations.lentgh,track:true},
						track:true,
						latitude:centerAnnotation.latitude,
						longitude:centerAnnotation.longitude};						  
		locations.push(newLocation);			
		locationsTable.appendRow(populate_location_row(locations.length));		
		winLocations.open();			
	});


	mtmRemoveRow.addEventListener('click', function() {
		// here: remove currentorow
		// remove locations and update locationsTable
		locationsTable.deleteRow(currentLocationRow);
		for(cc=currentLocationRow;cc<locationsTable.data.length;cc++) {
			locations[cc] = locations[cc] + 1;
		}
		locations.pop();
		save_locations();
	});


	mtmMapTable.addEventListener('click', function() {
		// Show Location management (tableview)
		var annot;
		if (flgWinLocations) {
			winLocations.close(); // on close we save the locations
			locations_to_annotations();
			mapview.addAnnotation(centerAnnotation);
		}
		else {
			winLocations.open();
		}
	});
		
	mtmSat.addEventListener('click',function() {
		// set map type to satellite
		mapview.setMapType(Titanium.Map.SATELLITE_TYPE);
	});
	
	mtmStd.addEventListener('click',function() {
		// set map type to standard
		mapview.setMapType(Titanium.Map.STANDARD_TYPE);
	});
	
	mtmHyb.addEventListener('click',function() {
		// set map type to hybrid
		mapview.setMapType(Titanium.Map.HYBRID_TYPE);
	});
	
	mtmZoomin.addEventListener('click',function() {
		mapview.zoom(1);
	});
	
	mtmZoomout.addEventListener('click',function() {
		mapview.zoom(-1);
	});
}		

if (!isAndroid) {
	//
	// TOOLBAR BUTTONS
	//
		
	// activate annotation
	mapview.selectAnnotation(mapview.annotations[0].title,true);

	win.rightNavButton = removeAll;

	mapview.addEventListener('complete', function() {
		Ti.API.info("map has completed loaded region");
	});
		
	var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});

	mtmAddNewCenter = Titanium.UI.createButton({style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,title:'Add new at center'});;
	mtmAddNewHere = Titanium.UI.createButton({style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,title:'Add new here'});
	mtmRemoveRow = Titanium.UI.createButton({style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,title:'Remove Row'});
	mtmMapTable = Titanium.UI.createButton({style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,title:'Show Table'});


	// button to change map type to SAT
	mtmSat = Titanium.UI.createButton({title:'Sat',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	// button to change map type to STD
	mtmStd = Titanium.UI.createButton({title:'Std',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	// button to change map type to HYBRID
	mtmHyb = Titanium.UI.createButton({title:'Hyb',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	// button to zoom-in
	mtmZoomin = Titanium.UI.createButton({title:'+',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	// button to zoom-out
	mtmZoomout = Titanium.UI.createButton({title:'-',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	wireClickHandlers();	
	win.setToolbar([flexSpace,std,flexSpace,hyb,flexSpace,sat,flexSpace,btnLocMgt,flexSpace,sv,flexSpace,zoomin,flexSpace,zoomout,flexSpace]);
} else {
	var activity = Ti.Android.currentActivity;
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
	
		mtmAddNewCenter = menu.add({title : 'Add new at center'});
		mtmAddNewHere = menu.add({title : 'Add new here'});
		mtmRemoveRow = menu.add({title : 'Remove Row'});	
		mtmMapTable = menu.add({title : 'Show Table'});
		Ti.API.info('in onCreateOptionsMenu');
		mtmSat = menu.add({title : 'Sat'});
		mtmStd = menu.add({title : 'Std'});
		mtmHyb = menu.add({title : 'Hyb'});
		mtmZoomin = menu.add({title : "Zoom In"});
		mtmZoomout = menu.add({title : 'Zoom Out'});
				
		wireClickHandlers();
	}
}

activity.onPrepareOptionsMenu = function(e) {
    var menu = e.menu;

	Ti.API.info('in onPrepareOptionsMenu');	
	if (flgWinLocations) {
		menu.getItem(2).setVisible(true);
		menu.getItem(3).setTitle('Show Map');
	}	
	else {
		menu.getItem(2).setVisible(false);
		menu.getItem(3).setTitle('Show Table');	
	}
	Ti.API.info('exit onPrepareOptionsMenu');
};

//
// EVENT LISTENERS
//

// region change event listener
mapview.addEventListener('regionChanged',function(evt)
{
	Titanium.API.info('maps region has updated to '+evt.longitude+','+evt.latitude);
	// Ti.API.fireEvent('locationChanged',{latitude:evt.latitude,longitude:evt.longitude});
	Ti.API.info('locationChanged event fired' + evt.latitude + evt.longitude);
	mapview.removeAnnotation(centerAnnotation);	
	centerAnnotation.latitude = evt.latitude;
	centerAnnotation.longitude = evt.longitude;
	mapview.addAnnotation(centerAnnotation);	

	mapview.selectAnnotation(centerAnnotation);
});

var annotationAdded = false;


function show_uv_index(){
	// Here all the story on updatin the table goes
		UVIData = JSON.parse(this.responseText);
		Ti.API.info(UVIData[0].date);
		actInd.hide();
		Ti.API.info('uv window open here');
		
		tblUVData.setData([])
		Titanium.UI.currentTab.open(winUVIndex, {animated: true});		
};

// map view click event listener
mapview.addEventListener('click',function(evt)
{
	// map event properties
	var annotation = evt.annotation;
	var title = evt.title;
	var clickSource = evt.clicksource;

	// custom annotation attribute
	var myid = (evt.annotation)?evt.annotation.myid:-1;

	Ti.API.info('mapview click clicksource = ' + clickSource + ' on ann title:' + annotation.title);
	if (annotation.title=='center') {
		get_uvi_data(evt.latitude, evt.longitude, show_uv_index);			
	}
	// use custom event attribute to determine if atlanta annotation was clicked
	if (myid == 3 && evt.clicksource == 'rightButton')
	{
		//  change the annotation on the fly
		evt.annotation.rightView = Titanium.UI.createView({width:20,height:20,backgroundColor:'red'});
		evt.annotation.leftView = Titanium.UI.createView({width:20,height:20,backgroundColor:'#336699'});
		evt.annotation.title = "Atlanta?";
		evt.annotation.pincolor = Titanium.Map.ANNOTATION_GREEN;
		evt.annotation.subtitle = 'Appcelerator used to be near here';
		evt.annotation.leftButton = 'images/appcelerator_small.png';
	}
	// mapview.selectAnnotation(annotation.title);
});

// annotation click event listener (same as above except only fires for a given annotation)
centerAnnotation.addEventListener('click', function(evt)
{
	var annotation = evt.source;
	var clicksource = evt.clicksource;

	Ti.API.info('center annotation click clicksource = ' + clicksource);
	winUVIndex.open();	
});


