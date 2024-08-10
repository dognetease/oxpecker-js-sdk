import {_} from './utils';

function app_js_bridge(instance){
    var app_info = null;
    var todo = null;
    var DATracker = instance || {};
    function setAppInfo(data){
      app_info = data;
      if(_.isJSONString(app_info)){
        app_info = JSON.parse(app_info);
      }
      if(todo){
        todo(app_info);
      }
    }
    //android，获取发给客户端数据
    function getAndroidData(){
      if(typeof window.HubbleData_APP_JS_Bridge === 'object') {
          if(window.HubbleData_APP_JS_Bridge.hubbledata_call_app) {
            DATracker['pageOpenScene'] = 'App';
            app_info = HubbleData_APP_JS_Bridge.hubbledata_call_app();
            if(_.isJSONString(app_info)){
              app_info = JSON.parse(app_info);
            }
          }
      }
    }
    //ios, 获取发给客户端数据
    window.hubbledata_app_js_bridge_call_js = function(data){    
      setAppInfo(data);
    };
    // 通知iOS，发给客户端数据
    function calliOSData() {
      if(/hubbledata-sdk-ios/.test(navigator.userAgent)) {
        DATracker['pageOpenScene'] = 'App';
        var iframe = document.createElement("iframe");
        iframe.setAttribute("src", "hubbledata://getAppInfo");
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
      }
    }

    // 页面发送给iOS数据
    function iOS_hubbledata_track(data) {
      var iframe = document.createElement("iframe");
      iframe.setAttribute("src", "hubbledata://trackEvent?event=" + encodeURIComponent(data));
      document.documentElement.appendChild(iframe);
      iframe.parentNode.removeChild(iframe);
      iframe = null;
    }
    
    var getAppStatus = function(func){
      calliOSData();
      //先获取能直接取到的安卓，ios是异步的不需要操作
      getAndroidData(); 
      // 不传参数，直接返回数据
      if(!func){
        return app_info;
      }else{
        //如果传参数，保存参数。如果有数据直接执行，没数据时保存
        if(app_info === null){
          todo = func;
        }else{
          func(app_info);
        }
      }
    };
    //发送数据
    // jsTrack : js发送数据方法
    var getSendCall = function(data, event_name, callback, jsTrack) {
      data = _.JSONDecode(data);
      if( !_.include(['da_session_close','da_session_start','da_activate','da_u_login','da_u_logout','da_u_signup'], event_name) ) {
        if(typeof window.HubbleData_APP_JS_Bridge === 'object' && window.HubbleData_APP_JS_Bridge.hubbledata_track) {
          DATracker['pageOpenScene'] = 'App';
          data['pageOpenScene'] = 'App';
          data = _.JSONEncode(data);
          window.HubbleData_APP_JS_Bridge.hubbledata_track(data);
          // if(DATracker.get_config('use_app_send_browser')) {
          //   (typeof jsTrack === 'function') && jsTrack();  
          // }
          (typeof callback === 'function') && callback();   
        } else if(/hubbledata-sdk-ios/.test(navigator.userAgent)) {
          DATracker['pageOpenScene'] = 'App';
          data['pageOpenScene'] = 'App';
          data = _.JSONEncode(data);
          iOS_hubbledata_track(data);
          // if(DATracker.get_config('use_app_send_browser')) {
          //   (typeof jsTrack === 'function') && jsTrack();  
          // }
          (typeof callback === 'function') && callback();   
        } else {
          (typeof jsTrack === 'function') && jsTrack();  
          (typeof callback === 'function') && callback();  
        }
      } else {
        (typeof jsTrack === 'function') && jsTrack();  
        (typeof callback === 'function') && callback();  
      }
    };

    /**
     * 向
     */
    return {
      getAppStatus: getAppStatus,
      getSendCall: getSendCall
    };
  };

export default app_js_bridge;