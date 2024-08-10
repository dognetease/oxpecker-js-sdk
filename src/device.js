// (c) 2014 Matthew Hudson
// Device.js is freely distributable under the MIT license.
// For all details and documentation:
// http://matthewhudson.me/projects/device.js/

//判断数组中是否包含某字符串
var _ = {
  contains: function(array, item) {
    var k = -1;
    if(Object.prototype.toString.apply(array) !== '[object Array]') return k;
    if(!array && !item) return k;
    for(var i=0; i < array.length; i++) {
      if(typeof array[i].indexOf === 'function') {
        if (array[i].indexOf(item) > 0)  
            return i;  
      } 
    }
    return k;
  }
};

var win;
if (typeof(window) === 'undefined') {
    win = {
        navigator: {
          userAgent: ''
        },
        document: {}
    };
} else {
    win = window;
}


  var device,
    previousDevice,
    addClass,
    documentElement,
    find,
    handleOrientation,
    hasClass,
    orientationEvent,
    removeClass,
    document = win.document,
    navigator = win.navigator,
    userAgent = navigator.userAgent;

  // Save the previous value of the device variable.
  previousDevice = win.device;

  device = {};

  // Add device as a global object.
  win.device = device;

  // The <html> element.
  documentElement = document.documentElement;

  // The client user agent string.
  // Lowercase, so we can use the more efficient indexOf(), instead of Regex
  userAgent = userAgent.toLowerCase();

  // Main functions
  // --------------

  device.ios = function () {
    return device.iphone() || device.ipod() || device.ipad();
  };

  device.iphone = function () {
    return !device.windows() && find('iphone');
  };

  device.ipod = function () {
    return find('ipod');
  };

  device.ipad = function () {
    return find('ipad');
  };

  device.android = function () {
    return !device.windows() && find('android');
  };

  device.androidPhone = function () {
    return device.android() && find('mobile');
  };

  device.androidTablet = function () {
    return device.android() && !find('mobile');
  };

  device.blackberry = function () {
    return find('blackberry') || find('bb10') || find('rim');
  };

  device.blackberryPhone = function () {
    return device.blackberry() && !find('tablet');
  };

  device.blackberryTablet = function () {
    return device.blackberry() && find('tablet');
  };

  device.windows = function () {
    return find('windows');
  };

  device.windowsPhone = function () {
    return device.windows() && find('phone');
  };

  device.windowsTablet = function () {
    return device.windows() && (find('touch') && !device.windowsPhone());
  };

  device.fxos = function () {
    return (find('(mobile;') || find('(tablet;')) && find('; rv:');
  };

  device.fxosPhone = function () {
    return device.fxos() && find('mobile');
  };

  device.fxosTablet = function () {
    return device.fxos() && find('tablet');
  };

  device.meego = function () {
    return find('meego');
  };

  device.cordova = function () {
    return win.cordova && location.protocol === 'file:';
  };

  device.nodeWebkit = function () {
    return typeof win.process === 'object';
  };

  device.mobile = function () {
    return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
  };

  device.tablet = function () {
    return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
  };

  device.desktop = function () {
    return !device.tablet() && !device.mobile();
  };

  device.television = function() {
    var i, television = [
      "googletv",
      "viera",
      "smarttv",
      "internet.tv",
      "netcast",
      "nettv",
      "appletv",
      "boxee",
      "kylo",
      "roku",
      "dlnadoc",
      "roku",
      "pov_tv",
      "hbbtv",
      "ce-html"
    ];

    i = 0;
    while (i < television.length) {
      if (find(television[i])) {
        return true;
      }
      i++;
    }
    return false;
  };

  device.portrait = function () {
    return (win.innerHeight / win.innerWidth) > 1;
  };

  device.landscape = function () {
    return (win.innerHeight / win.innerWidth) < 1;
  };

  // Public Utility Functions
  // ------------------------

  // Run device.js in noConflict mode,
  // returning the device variable to its previous owner.
  device.noConflict = function () {
    win.device = previousDevice;
    return this;
  };

  // Private Utility Functions
  // -------------------------

  // Simple UA string search
  find = function (needle) {
    return userAgent.indexOf(needle) !== -1;
  };

  // Check if documentElement already has a given class.
  hasClass = function (className) {
    var regex;
    regex = new RegExp(className, 'i');
    return documentElement.className.match(regex);
  };

  // Add one or more CSS classes to the <html> element.
  addClass = function (className) {
    var currentClassNames = null;
    if (!hasClass(className)) {
      currentClassNames = documentElement.className.replace(/^\s+|\s+$/g, '');
      documentElement.className = currentClassNames + " " + className;
    }
  };

  // Remove single CSS class from the <html> element.
  removeClass = function (className) {
    if (hasClass(className)) {
      documentElement.className = documentElement.className.replace(" " + className, "");
    }
  };
  
  //平台 -- Tablet phone
  device.devicePlatform = function() {
      var platForm = 'web';
      if(device.ios()) {
          if (device.ipad()) {
              platForm = 'iPad';
          } else if(device.iphone()) {
              platForm = 'iPhone';
          } else if(device.ipod()) {
              platForm = 'iPod touch';
          }
      } else if(device.android()) {
          if(device.androidTablet()) {
              platForm = 'Tablet';
          } else {
              platForm = 'Phone';
          }
      } else if(device.blackberry()) {
          if (device.blackberryTablet()) {
              platForm = 'Tablet';
          } else {
              platForm = 'Phone';
          }
      } else if(device.windows()) {
          if (device.windowsTablet()) {
              platForm = 'Tablet';
          } else if (device.windowsPhone()) {
              platForm = 'Phone';
          } else {
              platForm = 'web';
          }
      } else if(device.fxos()) {
          if (device.fxosTablet()) {
              platForm = 'Tablet';
          } else {
              platForm = 'Phone';
          }
      } else if(device.meego()) {
          platForm = 'Phone';
      } else {
          platForm = 'web';
      }
      return platForm;
  };

  //设备型号
  device.deviceModel = function() {
      var deviceModel = '';
      if(device.android()) {
        var sss = win.navigator.userAgent.split(";");  
        var i = _.contains(sss, "Build/");  
        if (i > -1) {  
            deviceModel = sss[i].substring(0, sss[i].indexOf("Build/"));  
        }
      } else if(device.ios()) {
          if(device.iphone()) {
              deviceModel = 'iPhone';
          }
      }
      return deviceModel;
  };

  // HTML Element Handling
  // ---------------------

  // Insert the appropriate CSS class based on the _user_agent.

//   if (device.ios()) {
//     if (device.ipad()) {
//       addClass("ios ipad tablet");
//     } else if (device.iphone()) {
//       addClass("ios iphone mobile");
//     } else if (device.ipod()) {
//       addClass("ios ipod mobile");
//     }
//   } else if (device.android()) {
//     if (device.androidTablet()) {
//       addClass("android tablet");
//     } else {
//       addClass("android mobile");
//     }
//   } else if (device.blackberry()) {
//     if (device.blackberryTablet()) {
//       addClass("blackberry tablet");
//     } else {
//       addClass("blackberry mobile");
//     }
//   } else if (device.windows()) {
//     if (device.windowsTablet()) {
//       addClass("windows tablet");
//     } else if (device.windowsPhone()) {
//       addClass("windows mobile");
//     } else {
//       addClass("desktop");
//     }
//   } else if (device.fxos()) {
//     if (device.fxosTablet()) {
//       addClass("fxos tablet");
//     } else {
//       addClass("fxos mobile");
//     }
//   } else if (device.meego()) {
//     addClass("meego mobile");
//   } else if (device.nodeWebkit()) {
//     addClass("node-webkit");
//   } else if (device.television()) {
//     addClass("television");
//   } else if (device.desktop()) {
//     addClass("desktop");
//   }

//   if (device.cordova()) {
//     addClass("cordova");
//   }

  // Orientation Handling
  // --------------------

  // Handle device orientation changes.
  handleOrientation = function () {
    if (device.landscape()) {
      removeClass("portrait");
      addClass("landscape");
    } else {
      removeClass("landscape");
      addClass("portrait");
    }
  };

  // Detect whether device supports orientationchange event,
  // otherwise fall back to the resize event.
  if (Object.prototype.hasOwnProperty.call(win, "onorientationchange")) {
    orientationEvent = "orientationchange";
  } else {
    orientationEvent = "resize";
  }



export default device;