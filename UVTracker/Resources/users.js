var win = Titanium.UI.currentWindow;
var users;
var userFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'users.json');
var table = Titanium.UI.createTableView();

Ti.include('skin_types.js');

var isAndroid = false;
if (Titanium.Platform.name == 'android') {
	isAndroid = true;
}

function user_to_viewrow(cc) {
		var viewrow = Ti.UI.createTableViewRow({height:70});

		var	img = Titanium.UI.createImageView({image:users[cc].picture,
							color:'#336699',left:10,height:60,width:60,
							borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE});
				 		
		var label = Titanium.UI.createLabel({text:users[cc].name + ' (' + users[cc].age +')',
											height:'auto',width:'auto',left:75});	
		viewrow.add(img); viewrow.add(label);		
		viewrow.hasChild = true;
		viewrow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
		viewrow.className = 'control';
		return(viewrow);
}

// function to load users from a json file and populate the tableview rows
function load_users() {
	// Ti.API.info(userFile.nativePath);
	// load the file into the users variable
	if (userFile.exists()) {		
		Ti.API.info('file users.json exists');
		// uncomment follow line to initialise		
		//users = [{name:'Minas', picture:'',age:6, skintype:0}, {name:'Maria', picture:'',age:41, skintype:0}, {name:'Theano', picture:'',age:9,skintype:0}];
	}
	else {
		users = [{name:'Minas', picture:'',age:6, skintype:0}, {name:'Maria', picture:'',age:41, skintype:0}, {name:'Theano', picture:'',age:9,skintype:0}];
		Ti.API.info('create json user file with family names');
		userFile.write(JSON.stringify(users));		
	};	
    users = JSON.parse(userFile.read().text);
    Ti.API.info(users[0].name);
    users[0].name = 'Minas Vassiliadis';    

	// for each record in users, create a viewrow,populate it with user data 
	// and append it to tableview
	for (var cc=0;cc<users.length;cc++) {		
		table.appendRow(user_to_viewrow(cc));
	}
	Ti.API.info('load_users completed');
}


// What row from table is clicked - edited.
var currentUserRow;
	
table.addEventListener('click', function(event)
{
	//Ti.API.info(event.index);
	
	currentUserRow = event.index;
	winUserDialog.txtName.value = users[currentUserRow].name;
	winUserDialog.imgPicture.image = users[currentUserRow].picture;
	Ti.API.info('age:' + users[currentUserRow].age);
	winUserDialog.sldAge.value = users[currentUserRow].age;
	winUserDialog.lblAge2.text = users[currentUserRow].age;
	var imgSkinType;
	switch (users[currentUserRow].skintype) {
		case 1:  imgSkinType = 'skin_type_I.png'; break; 
		case 2:  imgSkinType = 'skin_type_II.png'; break;
		case 3:  imgSkinType = 'skin_type_III.png'; break;
		case 4:  imgSkinType = 'skin_type_IV.png'; break;
		case 5:  imgSkinType = 'skin_type_V.png'; break;
		case 6:  imgSkinType = 'skin_type_IV.png'; break;
		default: imgSkinType = 'skin_type_I.png'; break;
	};
	winUserDialog.imgSkinType.image = imgSkinType;
	winUserDialog.open({modal:true});
});

load_users();

win.add(table);
Ti.API.info('table added to win');




//
// NAVBAR BUTTONS
//


var addNew = null;
var editRow = null;
var removeRow = null;

		
var wireClickHandlers = function() {
	addNew.addEventListener('click', function() {
		Ti.API.info('Add new user');
	});

	editRow.addEventListener('click', function() {
		Ti.API.info('Remove user in this row');
	});

	removeRow.addEventListener('click', function() {
		Ti.API.info('Remove user in this row');
	});
}		

if (!isAndroid) {
	// addNew button 
	addNew = Titanium.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		title:'Add new user'
	});
	// removeAll button 
	editRow = Titanium.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		title:'Remove user'
	});
	// removeAll button 
	removeRow = Titanium.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		title:'Remove User'
	});		
	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	
	wireClickHandlers();	
	win.setToolbar([flexSpace,addNew,flexSpace,editRow,flexSpace,removeRow]);
	
} else {
	var activity = Ti.Android.currentActivity;
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		
		addNew = menu.add({title : 'Add new user'});
		editRow = menu.add({title : 'Edit user'});
		removeRow = menu.add({title : 'Remove user'});

		wireClickHandlers();
	}
}



// --------------------------------------------------------------------------------------------------------
// Here starts management of User form in winUserDialog
//

// create the window
var winUserDialog = Titanium.UI.createWindow({
    backgroundColor:'#f9e2dc'
});


var lblName = Titanium.UI.createLabel({
    text:'Name',
    height:'auto',
    width:'auto',
    //shadowColor:'#aaa',
    //shadowOffset:{x:5,y:5},
    //color:'#900',
    //font:{fontSize:48},
    textAlign:'right',
	top:50,
	left:10
});

// user name
var	txtName = Titanium.UI.createTextField({
		color:'#336699',
		height:'auto',
		top:50,
		left:50,
		width:250,
		hintText:'name',
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE
	});


var lblPicture = Titanium.UI.createLabel({
    text:'Picture',
    height:'auto',
    width:'auto',
    //shadowColor:'#aaa',
    //shadowOffset:{x:5,y:5},
    //color:'#900',
    //font:{fontSize:48},
    textAlign:'right',
	top:100,
	left:10
});	


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


var lblAge = Titanium.UI.createLabel({
    text:'Age:',
    height:'auto',
    width:'auto',
    //shadowColor:'#aaa',
    //shadowOffset:{x:5,y:5},
    //color:'#900',
    //font:{fontSize:48},
    textAlign:'right',
	top:180,
	left:10
});	

// user age
var sldAge = Titanium.UI.createSlider({
	min:0,
	max:115,
	value:20,
	width:100,
	height:'auto',
	top:180,left:70,
	selectedThumbImage:'images/slider_thumb.png',
	highlightedThumbImage:'images/chat.png'
});

sldAge.addEventListener('change', function() {
	lblAge2.text = '(' + sldAge.value + ')';
});


var lblAge2 = Titanium.UI.createLabel({
    text:'(' + sldAge.value + ')',
    height:'auto',
    width:'auto',
    //shadowColor:'#aaa',
    //shadowOffset:{x:5,y:5},
    //color:'#900',
    //font:{fontSize:48},
    textAlign:'right',
	top:180,
	left:200
});	


var lblSkinType = Titanium.UI.createLabel({
    text:'SkinType:',
    height:'auto',
    width:'auto',
    //shadowColor:'#aaa',
    //shadowOffset:{x:5,y:5},
    //color:'#900',
    //font:{fontSize:48},
    textAlign:'right',
	top:220,
	left:10
});	
// user skin type
var	imgSkinType = Titanium.UI.createImageView({image:'images/cloud.png',
		color:'#336699',		
		top:220,
		left:70,
		height:60,
		width:60,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE
	});
	

imgSkinType.addEventListener('click', function() {
	winSkinTypes.open({modal:true});	
	Ti.API.info('after skin types model close->  winSkinDialog.selection:'+ intSkinType);
	winSkinTypes.addEventListener('close', function(evt){
		switch (intSkinType) {
			case 1:  imgSkinType.image = 'skin_type_I.png'; break; 
			case 2:  imgSkinType.image = 'skin_type_II.png'; break;
			case 3:  imgSkinType.image = 'skin_type_III.png'; break;
			case 4:  imgSkinType.image = 'skin_type_IV.png'; break;
			case 5:  imgSkinType.image = 'skin_type_V.png'; break;
			case 6:  imgSkinType.image = 'skin_type_VI.png'; break;
			default: imgSkinType.image = 'skin_type_I.png'; break;
		}
	});
});

	
// create the save button
var btnSave = Titanium.UI.createButton({
	title:'Save',
	height:40,width:100,
	top:400,left:10
});

// Save button clicked
btnSave.addEventListener('click', function() {
	Ti.API.info('ok button clicked, name ' + txtName.value + ' in row ' + currentUserRow);	
	// here we need to save user dialog changes to the file (JSON) and also to 
	users[currentUserRow].name = txtName.value;
	Ti.API.info(imgPicture.image +  ' ' + imgPicture.url);
	users[currentUserRow].picture = Titanium.Filesystem.applicationDataDirectory + "/" + 'userpicture' + currentUserRow + ".jpg"
	users[currentUserRow].age = sldAge.value;
	users[currentUserRow].skintype = imgSkinType.image;
	userFile.write(JSON.stringify(users));		
	
	// update the tableview 	
	table.updateRow(currentUserRow,user_to_viewrow(currentUserRow));
	winUserDialog.close();
});


var btnCancel = Titanium.UI.createButton({
	title:'Cancel',
	height:40,width:100,
	top:400, left:200
});
btnCancel.addEventListener('click', function() {
	// just close the dialog window
	winUserDialog.close();
});


// add all the controls to the window
winUserDialog.add(lblName);
winUserDialog.add(lblPicture);
winUserDialog.add(lblAge);
winUserDialog.add(lblAge2);
winUserDialog.lblAge2 = lblAge2;   // is this really needed?
winUserDialog.add(lblSkinType);
winUserDialog.add(txtName);
winUserDialog.txtName = txtName;   // is this really needed?
winUserDialog.add(imgPicture);
winUserDialog.imgPicture = imgPicture;
winUserDialog.add(sldAge);
winUserDialog.sldAge = sldAge;   // is this really needed?
winUserDialog.add(imgSkinType);
winUserDialog.imgSkinType = imgSkinType;
winUserDialog.add(btnSave);
winUserDialog.add(btnCancel);


