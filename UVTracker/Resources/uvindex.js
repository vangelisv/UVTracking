var winUVIndex = Titanium.UI.createWindow({title:'UV Index', backgroundColor:'#fff'});
var tblUVData = Titanium.UI.createTableView();	
var UVIData;

// create the OK button
var btnOK = Titanium.UI.createButton({
	title:'OK',
	height:40,width:100,
	top:400,left:200
});
	
btnOK.addEventListener('click', function() {	
	this.parent.close();
});


winUVIndex.add(tblUVData);  // add table to the window	
winUVIndex.add(btnOK);  // add OK Button to the window


// On opening of the window get the UVIDate to a tableview  
winUVIndex.addEventListener('open', function(evt)
{	

	var data = [];
	Ti.API.info('in winUVIndex open');

	// for each record in UVIData, create a viewrow,populate it with UVI data 
	// and append it to tableview
	Ti.API.info('before appending rows to table');	
	for (var cc=0;cc<UVIData.length;cc++) {	
		Ti.API.info('preparing row '+ cc);		
		data.push(populate_uvdata_row(UVIData[cc]));		
	}	
	tblUVData.setData(data);
			
	Ti.API.info('load UVIData on tableview completed');		


	/* 
	What to do on window - maybe just a close button or a menu with track start - stop???
	table.addEventListener('click', function(event)
	{	
		// selection has been defined as parameter in create window of this url...
		intSkinType = event.index;
		Ti.API.info('in skin types window ' + intSkinType);	
		// winSkinTypes.close();
	});
	*/    
}); 

function populate_uvdata_row(UVDataRow) {
		var viewrow = Ti.UI.createTableViewRow({height:100});
		
		//Ti.API.info('populated UVDATA row:'+UVDataRow.date);
	    viewrow.title = UVDataRow.date;
		/*
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
		*/
		var	imgWeather = Titanium.UI.createImageView({image:'images/weather/'+UVDataRow.ywcode+'.gif',
							color:'#336699',left:4,top:2,height:52,width:52,
							borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE});
							
		imgWeather.addEventListener('click', function() {	
				var weatherlink;
				if (UVDataRow.link == '') {
					weatherlink = 'http://weather.yahoo.com';
				}
				else {
					weatherlink = UVDataRow.link; 
				}
			    var webview = Titanium.UI.createWebView({url:weatherlink});
    			var window = Titanium.UI.createWindow();
    			window.add(webview);
    			window.open({modal:true});
				// this.parent.close();
		});	
 		var lblHigh = Titanium.UI.createLabel({height:'auto', width:52, left:4, top:60, textAlign:'center',font: {fontSize: 10}});
		var lblLow = Titanium.UI.createLabel({height:'auto',width:52,left:4,top:70, textAlign:'center',font: {fontSize: 10}});		
		if (UVDataRow.high != '') {
			lblHigh.text = 'High ' + UVDataRow.high + 'o' + UVDataRow.unit;			
			lblLow.text = 'Low ' + UVDataRow.low + 'o' + UVDataRow.unit;
		}
		else if (UVDataRow.temp != '') {
			
			lblHigh.text = 'At ' + UVDataRow.time;
			lblLow.text = 'Temp ' + UVDataRow.temp + 'o' + UVDataRow.unit;				
		}
		else {			
			lblHigh.text = '';
			lblLow.text = '';			
		};
		
		var lblDate = Titanium.UI.createLabel({text:UVDataRow.date,top:10,textAlign:'center',
											height:'auto',width:'auto',left:75});
		var currentTime = new Date();
		var hours = currentTime.getHours();
		var minutes = currentTime.getMinutes();
											
		var lblTime = Titanium.UI.createLabel({
			text: hours + ':' + minutes,
			height: 20,
			width: 'auto',
			left: 75,
			top: 40,
			textAlign:'center',
			font: {fontSize: 20}
		});												
		//	Ti.API.info('Round UVI' + Math.round(UVDataRow.effuvi));									
		var	imgUVI = Titanium.UI.createImageView({image:'B_fill_UV'+Math.round(UVDataRow.effuvi)+'(cmyk).gif',
							color:'#336699',left:195,top:2,height:65,width:110,
							borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE});
							
		var lblUVI = Titanium.UI.createLabel({text:'Noon time, clear sky UVI:' + UVDataRow.uvi,
											top:70,width:'auto',left:195, textAlign:'left',font: {fontSize: 9}});							
																		
		viewrow.add(imgWeather); 
		viewrow.add(lblHigh);
		viewrow.add(lblLow);
		viewrow.add(lblDate);
		viewrow.add(lblTime);
		viewrow.add(imgUVI);		
		viewrow.add(lblUVI);
		viewrow.hasChild = false;
		viewrow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
		viewrow.className = 'control';
		return(viewrow);
};


var actInd = Titanium.UI.createActivityIndicator({
		bottom:10, 
		height:50,
		width:10,
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
	});

function get_uvi_data(latitude, longitude, fnOnLoad) {
	
	var loader = Titanium.Network.createHTTPClient();
	// Sets the HTTP request method, and the URL to get data from
	loader.open("POST","http://192.168.1.209:8082/");
	//loader.setTimeout([5000]);
	loader.setRequestHeader('Content-Type','application/json');
	// Send the HTTP request
	var jsonPost = "{\"long\":"+longitude+",\"lat\":"+latitude+"}";
	Ti.API.info(jsonPost);
	actInd.show();
	loader.send(jsonPost);	
	
	// Runs the function when the data is ready for us to process	
	loader.onload = fnOnLoad;
	
	loader.onerror = function() 
	{
		Ti.API.info("UVI servicw on error");
		Titanium.UI.createAlertDialog({
	    	title: 'UV Service error',
    		message: this.responseText,
    		buttonNames: ['Back']}).show();	
		actInd.hide();	
	};	
}
