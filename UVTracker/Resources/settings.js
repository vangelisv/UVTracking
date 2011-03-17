var win = Titanium.UI.currentWindow;
var users;
var userFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'users.json');
var table = Titanium.UI.createTableView();

// function to load users from a json file and populate the tableview rows
function load_users() {
	// Ti.API.info(userFile.nativePath);
	// load the file into the users variable
	if (userFile.exists()) {		
		Ti.API.info('file users.json exists');		
	}
	else {
		users = [{name:'Minas', age:6}, {name:'Maria', age:41}, {name:'Theano', age:9}];
		Ti.API.info('create json user file with family names');
		userFile.write(JSON.stringify(users));		
	};	
    users = JSON.parse(userFile.read().text);
    Ti.API.info(users[0].name);
    users[0].name = 'Minas Vassiliadis';    

	// for each record in users, create a viewrow,populate it with user data 
	// and append it to tableview
	for (var cc=0;cc<users.length;cc++) {
		var viewrow = Ti.UI.createTableViewRow({height:50}); 
		
		viewrow.title = users[cc].name;
		if (users[cc].image) {
			viewrow.leftImage = users[cc].image;
		}	
		viewrow.hasChild = true;
		viewrow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
		viewrow.className = 'control';
		table.appendRow(viewrow);
	}
	Ti.API.info('load_users completed');
}


// What row from table is clicked - edited.
var currentUserRow;
	
table.addEventListener('click', function(event)
{
	//Ti.API.info(event.index);
	
	currentUserRow = event.index;
	winUserDialog.txtName.value = event.rowData.title;
	winUserDialog.open({modal:true});
});

load_users();

win.add(table);
Ti.API.info('table added to win');

// --------------------------------------------------------------------------------------------------------
// Here starts management of User form in winUserDialog
//

// create the window
var winUserDialog = Titanium.UI.createWindow({
   // backgroundColor:'yellow'
});

// add the user name fields
var	txtName = Titanium.UI.createTextField({
		color:'#336699',
		height:35,
		top:50,
		left:10,
		width:250,
		hintText:'hint',
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE
	});
	

// create the save button
var btnSave = Titanium.UI.createButton({
	title:'Save',
	height:40,
	width:100,
	top:250, // down a bit towards the end of screen
	left:10
});

// Save button clicked
btnSave.addEventListener('click', function() {
	Ti.API.info('ok button clicked, name ' + txtName.value + ' in row ' + currentUserRow);	
	// here we need to save user dialog changes to the file (JSON) and also to 
	users[currentUserRow].name = txtName.value;
	userFile.write(JSON.stringify(users));		
	// update the tableview - NOTE what to do if we need to update other row properties such as image...
	var data = {title:users[currentUserRow].name};			
	table.updateRow(currentUserRow,data);	
	
	winUserDialog.close();
});


var btnCancel = Titanium.UI.createButton({
	title:'Cancel',
	height:40,
	width:100,
	top:250, // down a bit towards the end of screen
	left:200
});
btnCancel.addEventListener('click', function() {
	// just close the dialog window
	winUserDialog.close();
});


// add all the controls to the window
winUserDialog.add(txtName);
winUserDialog.txtName = txtName;   // is this really needed?
winUserDialog.add(btnSave);
winUserDialog.add(btnCancel);


