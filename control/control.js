import EventList from '../plugins/eventList/eventList';
var ArrayProto = Array.prototype,
    nativeForEach = ArrayProto.forEach,
    slice = ArrayProto.slice,
    nativeBind = FuncProto.bind,
    ObjProto = Object.prototype,
    hasOwnProperty = ObjProto.hasOwnProperty;
    
var _ = {};
_.each = function(obj, iterator, context) {
  if (obj === null || obj === undefined) {
      return;
  }
  if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
          if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
              return;
          }
      }
  } else {
      for (var key in obj) {
          if (hasOwnProperty.call(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) {
                  return;
              }
          }
      }
  }
};
_.extend = function(obj) {
  _.each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
          if (source[prop] !== void 0) {
              obj[prop] = source[prop];
          }
      }
  });
  return obj;
};
_.loadScript = function(para) {
  para = _.extend({
    success: function() {},
    error: function() {},
    appendCall: function(g) {
        document.getElementsByTagName('head')[0].appendChild(g);
    }
  }, para);

  var g = null;
  if (para.type === 'css') {
    g = document.createElement('link');
    g.rel = 'stylesheet';
    g.href = para.url;
  }
  if (para.type === 'js') {
    g = document.createElement('script');
    g.async = 'async';
    g.setAttribute('charset','UTF-8');
    g.src = para.url;
    g.type = 'text/javascript';
  }
  g.onload = g.onreadystatechange = function() {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      para.success();
      g.onload = g.onreadystatechange = null;
    }
  };
  g.onerror = function() {
    para.error();
    g.onerror = null;
  };
  // if iframe
  para.appendCall(g);  
};

// 远程加载js
var loadVisualizationEdotorJs = function(DATracker) {
  if (!DATracker) return false;
  var visualization_editor_js_url = DATracker.config.visualization_editor_js_url;
  if(visualization_editor_js_url){
      _.loadScript({
        success:function(){
          
        },
        error:function(){},
        type:'js',
        //url: visualization_editor_js_url + '?_=' + Math.random()
        url: visualization_editor_js_url
      });
    }else{
      console.error('没有指定visualization_js_url的路径');
  }
};

// 提示信息
function HubbleMessage(obj) {
  this.type = obj.type;
  this.message = obj.message;
  // 样式
  var style = '#hubble_control_message{position: absolute;width: 100%;height: 60px;top: 0;z-index: 99999999999;line-height: 60px;font-size: 18px;text-align: center;color: #fff;overflow: hidden;background: rgba(0, 0, 0, 0.8);}';
  var styleNode  = document.createElement('style');
  styleNode.type = 'text/css';
  if( styleNode.styleSheet){ 
    //ie下要通过 styleSheet.cssText写入. 
    styleNode.styleSheet.cssText = style;  
  }else{
    //在ff中， innerHTML是可读写的，但在ie中，它是只读的.
    styleNode.innerHTML = style;
  }  
  document.getElementsByTagName('head')[0].appendChild(styleNode);
  // 元素
  var item = document.createElement('div');
  item.innerText = this.message || '';
  item.id = 'hubble_control_message';
  document.body.appendChild(item);
}

// obj: type: 'abtest_debug' | 'heatmap_show'  , data : {}
var hubbleData_render_mode_fn = function(DATracker, obj) {
  this.DATracker = DATracker;
  this.type = obj.type;
  this.data = obj.data;

  // 如果触发了abtest调试或编辑，但是sdk未开启abtest功能，此时提示错误信息
  if (this.type === 'abtest_debug_but_abtest_disable' || this.type === 'abtest_editor_but_abtest_disable') {
    new HubbleMessage({type: 'error', message: '请在sdk配置里开启abtest功能!'});
  } 
  // 如果触发了abtest调试，但是拉取的配置信息为空，此时提示信息
  if (this.type === 'abtest_debug_abtest_no_data') {
    new HubbleMessage({type: 'error', message: '当前abtest实验调试版本没有查询到实验信息，请重新操作调试！'});
  } 
  // 如果触发了abtest调试， abtest_debug
  if (this.type === 'abtest_debug') {
    if (window && window.parent && window.parent.window && (window !== window.parent.window)) {
      this.control = {
        addEvent: function(data) {
          window.parent.window.postMessage({
            method: 'addEvent',
            data: data
          },'*'); 
        }
      };
    } else {
      this.control = new EventList({api_host: DATracker.get_config('api_host'), hubble_abtest_debug_key: DATracker.abtest.getDebugKeyData()});
      var tump = this.control.addEvent;
      var control = this.control;
      control.addEvent = function(data) {
        if (DATracker.abtest.isTestDebug()) {
          control.show();
          tump.call(control, data);
        } else {
          control.hide(); 
        }
      };
    }
  }
  // 如果触发了abtest在线编辑（可视化编辑），拉取js文件, abtest_editor
  if (this.type === 'abtest_editor') {
    loadVisualizationEdotorJs(this.DATracker);
  }
};

/**
 * 设置父窗口iframe的高度
 * @return {[type]} [description]
 */
window.onload = function(){
  if (window && window.parent && window.parent.window && (window !== window.parent.window)) {
    var a = parseInt(document.body.scrollHeight, 10);
    window.parent.window.postMessage({
      method: 'setHeight',
      height: isNaN(a) ? 0 : a
    },'*');
  }
}

// 通知sdk已初始化
if (window && window.parent && window.parent.window && (window !== window.parent.window)) {
  window.parent.window.postMessage({
    method: 'sdk_init'
  },'*');
  
  window.addEventListener('hashchange', function() {
    window.location.reload();
  });
}


window.hubbleData_render_mode_fn = hubbleData_render_mode_fn;

