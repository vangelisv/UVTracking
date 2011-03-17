var win = Titanium.UI.currentWindow;

//
// Longtitude
//
var LongLabel = Titanium.UI.createLabel({
	text:'Long:' ,
	color:'#999',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:15
	},
	textAlign:'center',
	top:10,left:20,
	width:300,
	height:'auto'
});

var LongSlider = Titanium.UI.createSlider({
	min:0,
	max:180,
	value:90,
	width:100,
	height:'auto',
	top:40,left:20,
	selectedThumbImage:'../images/slider_thumb.png',
	highlightedThumbImage:'../images/chat.png'
});

LongSlider.addEventListener('change',function(e)
{
	LongLabel.text = 'Long = ' + Math.round(e.value) ;
});

//
// Latitude
//
var LatLabel = Titanium.UI.createLabel({
	text:'Lat:' ,
	color:'#999',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:15
	},
	textAlign:'center',
	top:10, left:170,
	width:'auto',
	height:'auto'
});

var LatSlider = Titanium.UI.createSlider({
	min:-90,
	max:90,
	value:0,
	width:100,
	height:'auto',
	top:40,left:170,
	selectedThumbImage:'../images/slider_thumb.png',
	highlightedThumbImage:'../images/chat.png'
});

LatSlider.addEventListener('change',function(e)
{
	LatLabel.text = 'Lat = ' + Math.round(e.value) +  Math.round(LatSlider.value);
});



//
// CHANGE SLIDER
//
var changeButton = Titanium.UI.createButton({
	title:'Change Basic Slider',
	width:150,
	top:360
});

	var loader = Titanium.Network.createHTTPClient();
	// Sets the HTTP request method, and the URL to get data from
	loader.open("GET","http://www.temis.nl/uvradiation/nrt/uvindex.php?lon=" + LongSlider.value + "&lat" + LatSlider.value);
	// Runs the function when the data is ready for us to process
	loader.onload = function() 
	{
		alert("on load");
		ta1.value = this.responseText;		
	};
//	do not execute a send when loading the page 
//  loader.send();

changeButton.addEventListener('click', function()
{
	alert("button pressed");
	// Send the HTTP request
	loader.send();
	alert("button pressed 2");	

});


var ta1 = Titanium.UI.createTextArea({
	value:'I am a textarea',
	height:250,
	width:300,
	top:100,
	font:{fontSize:10,fontFamily:'Marker Felt', fontWeight:'bold'},
	color:'#888',
	textAlign:'left',
	//appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
	//keyboardType:Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
	//returnKeyType:Titanium.UI.RETURNKEY_EMERGENCY_CALL,
	borderWidth:2,
	borderColor:'#bbb',
	borderRadius:5,
	suppressReturn:false
	
});



win.add(LongLabel);
win.add(LatLabel);
win.add(LongSlider);
win.add(LatSlider);
win.add(changeButton);
win.add(ta1);

	

