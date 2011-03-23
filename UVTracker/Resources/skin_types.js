var win = Titanium.UI.currentWindow;
var selection;
var skin_types = [{type:'I, Melano-compromised', description:'burns:Always, tans:Seldom'},
				  {type:'II,Melano-compromised', description:'burns:Usually, tans:Sometimes'},
				  {type:'III,Melano-compromised',description:'burns:Sometimes, tans:Usually'},
				  {type:'IV,Melano-compromised', description:'burns:Seldom, tans:Always'},
				  {type:'V,Melano-compromised',  description:'Naturally brown skin'},
				  {type:'VI,Melano-compromised', description:'Naturally black skin'}];
				  
var table = Titanium.UI.createTableView();

var isAndroid = false;
if (Titanium.Platform.name == 'android') {
	isAndroid = true;
}
// for each record in users, create a viewrow,populate it with skin type data 
// and append it to tableview
for (var cc=0;cc<skin_types.length;cc++) {
	var viewrow = Ti.UI.createTableViewRow({height:50}); 
	
	viewrow.title = 'Type '+ skin_types[cc].type + ' ' + skin_types[cc].description;
	var imgSkinType;
	switch (cc + 1) {
		case 1:  imgSkinType = 'skin_type_I.png'; break; 
		case 2:  imgSkinType = 'skin_type_II.png'; break;
		case 3:  imgSkinType = 'skin_type_III.png'; break;
		case 4:  imgSkinType = 'skin_type_IV.png'; break;
		case 5:  imgSkinType = 'skin_type_V.png'; break;
		case 6:  imgSkinType = 'skin_type_IV.png'; break;
		default: imgSkinType = 'skin_type_I.png'; break;
	};	
	viewrow.leftImage = imgSkinType;
	viewrow.hasChild = false;
	viewrow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;		
	table.appendRow(viewrow);
}
Ti.API.info('load skin_types completed');
	
table.addEventListener('click', function(event)
{
	//Ti.API.info(event.index);
	selection = event.index;
	win.close();	  
});


win.add(table);

