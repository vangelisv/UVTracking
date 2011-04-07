var winSkinTypes = Titanium.UI.createWindow({backgroundColor:'#563831'});
var intSkinType; 

winSkinTypes.addEventListener('open', function(evt)
{
	
	Ti.API.info('in winSkinTypes open');
	var skin_types = [{type:'I, Melano-compromised', description:'burns:Always, tans:Seldom'},
					  {type:'II,Melano-compromised', description:'burns:Usually, tans:Sometimes'},
					  {type:'III,Melano-compromised',description:'burns:Sometimes, tans:Usually'},
					  {type:'IV,Melano-compromised', description:'burns:Seldom, tans:Always'},
					  {type:'V,Melano-compromised',  description:'Naturally brown skin'},
					  {type:'VI,Melano-compromised', description:'Naturally black skin'}];
					  
	var table = Titanium.UI.createTableView();
	
	// for each record in skin_types, create a viewrow,populate it with skin type data 
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
			case 6:  imgSkinType = 'skin_type_VI.png'; break;
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
		// selection has been defined as parameter in create window of this url...
		intSkinType = event.index;
		Ti.API.info('in skin types window ' + intSkinType);	
		winSkinTypes.close();
	});
	winSkinTypes.add(table);	
});


