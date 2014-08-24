/*
 * Single Window Application Template:
 * A basic starting point for your application.  Mostly a blank canvas.
 *
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *
 */

//bootstrap and check dependencies
if (Ti.version < 1.8) {
  alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

//
// Push notifications
//
var deviceToken = null;
 
// Initialize PushNotification for Android
// and Obtaining a device token
function initializePushAndroid(){
	// Require the module
	var CloudPush = require('ti.cloudpush');
	
	// Initialize the module
	CloudPush.retrieveDeviceToken({
	    success: deviceTokenSuccess,
	    error: deviceTokenError
	});

	// Process incoming push notifications
	CloudPush.addEventListener('callback', function (evt) {
    	alert("Notification received: " + evt.payload);
	});
}

// Initialize PushNotification for iOS
// and Obtaining a device token
function initializePushIOS(){
	Ti.Network.registerForPushNotifications({
	    // Specifies which notifications to receive
	    types: [
	        Ti.Network.NOTIFICATION_TYPE_BADGE,
	        Ti.Network.NOTIFICATION_TYPE_ALERT,
	        Ti.Network.NOTIFICATION_TYPE_SOUND
	    ],
	    success: deviceTokenSuccess,
	    error: deviceTokenError,
	    callback: receivePushIOS
	});
	
	// Process incoming push notifications
	function receivePushIOS(e) {
	    alert('Received push: ' + JSON.stringify(e));
	}
}


// Enable push notifications for this device
// Save the device token for subsequent API calls
function deviceTokenSuccess(e) {
    deviceToken = e.deviceToken;
    console.info("Device Token received: " + deviceToken);
    
    subscribeToChannel();
}

function deviceTokenError(e) {
    alert('Failed to register for push notifications! ' + e.error);
}

//
// Subscribe with token
// 

// Require the Cloud module
var Cloud = require("ti.cloud");

function subscribeToChannel () {
	console.info("Subscribing to channel by using a Token ...");
    // Subscribes the device to the 'news_alerts' channel
    // Specify the push type as either 'android' for Android or 'ios' for iOS
    Cloud.PushNotifications.subscribeToken({
        device_token: deviceToken,
        channel: 'news_alerts',
        type: Ti.Platform.name == 'android' ? 'android' : 'ios'
    }, function (e) {
        if (e.success) {
            alert('Subscribed');
        } else {
            alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}
 


// This is a single context application with multiple windows in a stack
(function() {
  //render appropriate components based on the platform and form factor
  var osname = Ti.Platform.osname,
    version = Ti.Platform.version,
    height = Ti.Platform.displayCaps.platformHeight,
    width = Ti.Platform.displayCaps.platformWidth;

  //considering tablets to have width over 720px and height over 600px - you can define your own
  function checkTablet() {
    var platform = Ti.Platform.osname;

    switch (platform) {
      case 'ipad':
        return true;
      case 'android':
        var psc = Ti.Platform.Android.physicalSizeCategory;
        var tiAndroid = Ti.Platform.Android;
        return psc === tiAndroid.PHYSICAL_SIZE_CATEGORY_LARGE || psc === tiAndroid.PHYSICAL_SIZE_CATEGORY_XLARGE;
      default:
        return Math.min(
          Ti.Platform.displayCaps.platformHeight,
          Ti.Platform.displayCaps.platformWidth
        ) >= 400;
    }
  }

  var isTablet = checkTablet();
  console.log(isTablet);

  var Window;
  

  
  if (isTablet) {
    Window = require('ui/tablet/ApplicationWindow');
  } else {
    // Android uses platform-specific properties to create windows.
    // All other platforms follow a similar UI pattern.
    if (osname === 'android') {
      initializePushAndroid();
      Window = require('ui/handheld/android/ApplicationWindow');
    } else {
      initializePushIOS();
      Window = require('ui/handheld/ApplicationWindow');
    }
  }
  
  	if (osname === 'android') {
	  initializePushAndroid();
	} else {
	  initializePushIOS();
	}
	
  new Window().open();
})();
