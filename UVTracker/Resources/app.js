// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// Map Window and Tab
//
var winMap = Titanium.UI.createWindow({  
	url:"geolocation.js",
    title:'Map',
    backgroundColor:'#fff'
});
var tabMap = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Map',
    window:winMap
});


//
// UV Index window and Tab
//
var winUVIndex = Titanium.UI.createWindow({  
    title:'UV Index',
    backgroundColor:'#fff',
	url:'uvindex.js'
});
var tabUVIndex = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'UV Index',
    window:winUVIndex
});



//
// UV Track window and Tab
//
var winUVTrack = Titanium.UI.createWindow({  
    title:'Track UV',
    backgroundColor:'#fff'
});
var tabUVTrack = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Track UV',
    window:winUVTrack
});

//
//  Info window and Tab
//
var winInfo = Titanium.UI.createWindow({  
    title:'Info on UV',
    backgroundColor:'#fff'
});
var tabInfo = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'UV Info',
    window:winInfo
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
//  add tabs
//
tabGroup.addTab(tabMap);
tabGroup.addTab(tabUVIndex);
tabGroup.addTab(tabUVTrack);
tabGroup.addTab(tabSettings);
tabGroup.addTab(tabInfo);  
  


// open tab group
tabGroup.open();
