package gr.semanticweb.uvtracker;

import org.appcelerator.titanium.ITiAppInfo;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiProperties;
import org.appcelerator.titanium.util.Log;

/* GENERATED CODE
 * Warning - this class was generated from your application's tiapp.xml
 * Any changes you make here will be overwritten
 */
public final class UvtrackerAppInfo implements ITiAppInfo
{
	private static final String LCAT = "AppInfo";
	
	public UvtrackerAppInfo(TiApplication app) {
		TiProperties properties = app.getSystemProperties();
					
					properties.setString("ti.android.google.map.api.key", "0QxF39ABEVA3gZvXvbH0tQcDEjlEL9PhNrBHO3Q");
					
					properties.setString("ti.android.google.map.api.key.development", "0ZnKXkWA2dIAu2EM-OV4ZD2lJY3sEWE5TSgjJNg");
					
					properties.setString("ti.deploytype", "development");
					
					properties.setString("ti.android.google.map.api.key.production", "ABQIAAAAx4bPqmtvf1SHyrralAer4RTTabmCcwVtqjhPOlpzGNNvrPx6gRR8umrx3oHAJJpPgmzN89_HJ3UORw");
	}
	
	public String getId() {
		return "gr.semanticweb.uvtracker";
	}
	
	public String getName() {
		return "UVTracker";
	}
	
	public String getVersion() {
		return "1.0";
	}
	
	public String getPublisher() {
		return "Vangelis";
	}
	
	public String getUrl() {
		return "www.semanticweb.gr/uvtracker";
	}
	
	public String getCopyright() {
		return "2010 by Vangelis";
	}
	
	public String getDescription() {
		return "No description provided";
	}
	
	public String getIcon() {
		return "default_app_logo.png";
	}
	
	public boolean isAnalyticsEnabled() {
		return true;
	}
	
	public String getGUID() {
		return "628b01ed-dca6-4b13-94e2-811b993b6b4a";
	}
	
	public boolean isFullscreen() {
		return false;
	}
	
	public boolean isNavBarHidden() {
		return false;
	}
}
