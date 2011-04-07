// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// UV Track window and Tab
//
var winUVTrack = Titanium.UI.createWindow({  
    title:'Track UV',
    backgroundColor:'#fff',
	url:'uvtracking.js'
});
var tabUVTrack = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Track UV',
    window:winUVTrack
});


//
// Locations and Map Window and Tab
//
var winMap = Titanium.UI.createWindow({  
    title:'Map',
    backgroundColor:'#fff',
	url:"locations_map.js",
});
var tabMap = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Locations',
    window:winMap
});

//
// Users window and Tab
//
var winUsers = Titanium.UI.createWindow({  
    title:'People',
    backgroundColor:'#fff',
	url:'users.js',
	UVIData:''
});

var tabUsers = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'People',
    window:winUsers
});




//
// Settings window and Tab
//
var winSettings = Titanium.UI.createWindow({  
    title:'SettingsWin',
    backgroundColor:'#fff',
	url:'settings.js'
});
var tabSettings = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'SettingsTab',
    window:winSettings
});


//
//  Info window and Tab
//
var winInfo = Titanium.UI.createWindow({  
    title:'UV Info and Resources',
    backgroundColor:'#fff',
	url:'info_resources.js'
	
});
var tabInfo = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'UV Info',
    window:winInfo
});


//
//  add tabs
//
tabGroup.addTab(tabUVTrack);
tabGroup.addTab(tabMap);
tabGroup.addTab(tabUsers);
tabGroup.addTab(tabSettings);
tabGroup.addTab(tabInfo);  
  


// open tab group
tabGroup.open();
