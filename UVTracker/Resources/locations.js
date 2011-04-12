// var win = Titanium.UI.currentWindow;

var winLocations = Titanium.UI.createWindow({title:'Locations', backgroundColor:'#fff'});
var locationsTable = Titanium.UI.createTableView();
var locationsFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'locations.json');
var flgWinLocations; // true if WinLocations is open / false if not. In open/close listeners 
var table = Titanium.UI.createTableView();
// What row from table is clicked - edited.
var currentLocationRow;
var locations = [];


var isAndroid = false;
if (Titanium.Platform.name == 'android') {
	isAndroid = true;
}

function populate_location_row(cc) {
		var viewrow = Ti.UI.createTableViewRow({height:80});

		var	imgLeftButton = Titanium.UI.createImageView({image:locations[cc].leftButton,
							color:'#336699',top:5,left:10,height:60,width:60,
							borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE});
							
		imgLeftButton.addEventListener('click',  function(){	
			Titanium.Media.openPhotoGallery({
			success:function(event) 	{
				var cropRect = event.cropRect;
				var image = event.media;
		        Ti.API.info('openPhotoGallery success');
				// set image view
				Ti.API.debug('Our type was: '+event.mediaType);
				if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
				{
					imgLeftButton.image = image;
					var filename = Titanium.Filesystem.applicationDataDirectory + "/" + 'locationpicture' + cc + ".jpg";
					Ti.API.info(filename);
		 			Titanium.Filesystem.getFile(filename).write(imgLeftButton.image);			
				}
				else
				{
					Ti.API.info('Incorrect media type selected (no photo)');
				}
				Titanium.API.info('PHOTO GALLERY SUCCESS cropRect.x ' + cropRect.x + ' cropRect.y ' + cropRect.y  + ' cropRect.height ' + cropRect.height + ' cropRect.width ' + cropRect.width);
			},
			cancel:function() 	{
				Ti.API.info('openPhotoGallery cancel');
			},
			error:function(error) 	{
				Ti.API.info('openPhotoGallery error');
			},
			allowEditing:true,
			//popoverView:popoverView,
			//arrowDirection:arrowDirection,
			mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO,Ti.Media.MEDIA_TYPE_PHOTO]
		   });
		});							
				 				
		var	txtTitle = Titanium.UI.createTextField({
			value:locations[cc].title,
			color:'#336699',
			height:'auto',top:5,left:75,width:225,
			hintText:'new location',
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE
		});	
		
		var	imgRightButton = Titanium.UI.createImageView({image:locations[cc].rightButton,
							color:'#336699',left:330,height:60,width:60,
							borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE});

		var	txtSubTitle = Titanium.UI.createTextField({
			value:locations[cc].subtitle,
			color:'#336699',
			height:35,top:45,left:75,width:170,
			hintText:'subtitle',
			font: {fontSize: 10},
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE
		});	
		
		var lblLat = Titanium.UI.createLabel({
		    text:'Lat:'+locations[cc].latitude,
		    height:'auto', width:'auto',
		    textAlign:'left',font: {fontSize: 8},
			top:65,	left:5
		});	

		
		var lblLong = Titanium.UI.createLabel({
		    text:'Long:'+locations[cc].longitude,
		    height:'auto', width:'auto',font: {fontSize: 8},
		    textAlign:'left',
			top:65,	left:40
		});	
		
		//Ti.API.info(locations[cc].track);
		// locations[cc].track = true;	
		// Ti.API.info(locations[cc].track);
		
		var swcTrack = Titanium.UI.createSwitch({
			title:'Track',height:35, width:'auto',
			top:45,	left:275,
			value:locations[cc].track
		});
		
		
		viewrow.add(imgLeftButton);
		viewrow.add(txtTitle);
		viewrow.add(imgRightButton); 		
		viewrow.add(txtSubTitle);
		viewrow.add(lblLat);
		viewrow.add(lblLong);
		viewrow.add(swcTrack);		
		viewrow.hasChild = false;
		viewrow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
		viewrow.className = 'control';
		Ti.API.info('viewrow title text'+viewrow.children[1].text);
		return(viewrow);
}




// function to load users from a json file and populate the tableview rows
function load_locations() {
	// Ti.API.info(userFile.nativePath);
	// load the file into the users variable
	var data = [];
	if (locationsFile.exists()) {		
		Ti.API.info('file locations.json exists');		
		// These lines initialise locations
		//locations = [];
		//Ti.API.info('create json emtpy locations file');
		//locationsFile.write(JSON.stringify(locations));	
		// Remove initialisation here			
	}
	else {
		locations = [];
		Ti.API.info('create json emtpy locations file');
		locationsFile.write(JSON.stringify(locations));		
	};	
    locations = JSON.parse(locationsFile.read().text);
        
	// for each record in locations, create a viewrow,populate it with location data 
	// and append it to tableview
	for (var cc=0;cc<locations.length;cc++) {
		data.push(populate_location_row(cc));				
	}
	locationsTable.setData(data);
	Ti.API.info('load_locations completed');
}

function save_locations() {

	locationsFile.write(JSON.stringify(locations));
} 	

locationsTable.addEventListener('click',function(ev) {	

    Ti.API.info(ev.index);	
	currentLocationRow = ev.index;
			
	locations[ev.index].leftButton = Titanium.Filesystem.applicationDataDirectory + "/" + 'locationpicture' + currentLocationRow + ".jpg";;
	locations[ev.index].title = ev.rowData.children[1].value;
	locations[ev.index].rightButton = ev.row.children[2].image;		
	locations[ev.index].subtitle = ev.rowData.children[3].value;
	
	// Long lat are read only
	// locations[ev.index].latitude = ev.rowData.children[4].text; 
	// locations[ev.index].longitude = ev.rowData.children[5].text;
	locations[ev.index].track = ev.rowData.children[6].value;   
	locations.pincolor = isAndroid ? "orange" : Titanium.Map.ANNOTATION_RED;	
	save_locations();	
})

load_locations();
winLocations.add(locationsTable);


winLocations.addEventListener('open', function(evt) {
	flgWinLocations = true;
})

winLocations.addEventListener('close', function(evt) {
	// save the locations from tableview into locations and file.
	save_locations();
	flgWinLocations = false;
})

// user image / picture
var	imgPicture = Titanium.UI.createImageView({image:'images/chat.png',
		color:'#336699',
		height:60,
		top:100,
		left:70,
		width:60,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE
	});

imgPicture.addEventListener('click', function() {
	
	Titanium.Media.openPhotoGallery({
	success:function(event) 	{
		var cropRect = event.cropRect;
		var image = event.media;
        Ti.API.info('openPhotoGallery success');
		// set image view
		Ti.API.debug('Our type was: '+event.mediaType);
		if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
		{
			imgPicture.image = image;
			var filename = Titanium.Filesystem.applicationDataDirectory + "/" + 'userpicture' + currentUserRow + ".jpg";
			Ti.API.info(filename);
 			Titanium.Filesystem.getFile(filename).write(imgPicture.image);			
		}
		else
		{
			Ti.API.info('Incorrect media type selected (no photo)');
		}
		Titanium.API.info('PHOTO GALLERY SUCCESS cropRect.x ' + cropRect.x + ' cropRect.y ' + cropRect.y  + ' cropRect.height ' + cropRect.height + ' cropRect.width ' + cropRect.width);
	},
	cancel:function() 	{
		Ti.API.info('openPhotoGallery cancel');
	},
	error:function(error) 	{
		Ti.API.info('openPhotoGallery error');
	},
	allowEditing:true,
	//popoverView:popoverView,
	//arrowDirection:arrowDirection,
	mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO,Ti.Media.MEDIA_TYPE_PHOTO]
   });
});



// Save button clicked
/*
saveChanges.addEventListener('click', function() {
	Ti.API.info('saveChanges button clicked, name ' + txtName.value + ' in row ' + currentLocationRow);	
	// here we need to save user dialog changes to the file (JSON) and also to 
	locations[currentlocationRow].name = txtName.value;
	Ti.API.info(imgPicture.image +  ' ' + imgPicture.url);
	users[currentUserRow].picture = Titanium.Filesystem.applicationDataDirectory + "/" + 'userpicture' + currentUserRow + ".jpg"
	users[currentUserRow].age = sldAge.value;
	users[currentUserRow].skintype = imgSkinType.image;
	userFile.write(JSON.stringify(users));		
	
	// update the tableview 	
	table.updateRow(currentUserRow,user_to_viewrow(currentUserRow));
	winUserDialog.close();
});
*/

