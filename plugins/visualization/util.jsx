
//订阅-发布模式通用实现
var event = {
  clientList: [],
  listen: function(key, fn) {
      if(!this.clientList[key]) {
          this.clientList[key] = [];
      }
      this.clientList[key].push(fn);
  },
  trigger: function() {
      let key = Array.prototype.shift.call(arguments);
      const fns = this.clientList[key];
      if(!fns || fns.length==0) {
          return false;
      }
      for(let i=0; i<fns.length; i++) {
          let fn = fns[i];
          fn.apply(this, arguments);
      }
  }
}

//为传入的对象添加订阅-发布功能
var installEvent = function(obj) {
  for(let key in event) {
      obj[key] = event[key];
  }
}

const _ = {
    post: function(url, options, callback, timeout) {
      try {
          var req = new XMLHttpRequest();
          req.open('POST', url, true);
          req.setRequestHeader("Content-type","application/json");
          req.withCredentials = true;
          req.ontimeout = function() {
              callback({status: 0, error: true, message: 'request ' +url + ' time out'});
          };
          req.onreadystatechange = function () {
              if (req.readyState === 4) {
                  if (req.status === 200) {
                      if (callback) {
                          callback(JSON.parse(req.responseText));
                      }
                  } else {
                      if (callback) {
                          var message = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                          callback({status: 0, error: true, message: message});
                      }
                  }
              }
          };
          req.timeout = timeout || 5000;
          req.send(options);
      } catch (e) {}
    },
    get: function(url, callback) {
      try {
          var req = new XMLHttpRequest();
          req.open('GET', url, true);
          // req.setRequestHeader("Content-type","application/json");
          req.withCredentials = true;
          req.onreadystatechange = function () {
              if (req.readyState === 4) {
                  if (req.status === 200) {
                      if (callback) {
                          callback(JSON.parse(req.responseText));
                      }
                  } else {
                      if (callback) {
                          var message = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                          callback({status: 0, error: true, message: message});
                      }
                  }
              }
          };
          req.send(null);
      } catch (e) {}
    }
  };

/**
 * 纯js实现多div拖拽
 * @param bar, 拖拽触柄
 * @param target, 可拖动窗口
 * @param inWindow, 为true时只能在屏幕范围内拖拽
 * @param callback, 拖拽时执行的回调函数。包含两个参数，target的left和top
 * @returns {*}
 * @private
 */
var startDrag = function(bar, target, /* optional */inWindow, /* optional */callback) {
  (function(bar, target, callback) {
      var D = document,
          DB = document.body,
          params = {
              left: 0,
              top: 0,
              currentX: 0,
              currentY: 0
          };
      if(typeof bar == "string") {
          bar = D.getElementById(bar);
      }
      if(typeof target == "string") {
          target = D.getElementById(target);
      }
      bar.style.cursor="-webkit-grab";
      bindHandler(bar, "mousedown", function(e) {
          e.preventDefault();
          params.left = target.offsetLeft;
          params.top = target.offsetTop;
          if(!e){
              e = window.event;
              bar.onselectstart = function(){
                  return false;
              }
          }
          params.currentX = e.clientX;
          params.currentY = e.clientY;
          
          var stopDrag = function() {
              setTimeout(() => {
                window.isDraging = false;
              }, 200);
              removeHandler(DB, "mousemove", beginDrag);
              removeHandler(DB, "mouseup", stopDrag);
          }, beginDrag = function(e) {
              window.isDraging = true;
              var evt = e ? e: window.event,
                  nowX = evt.clientX, nowY = evt.clientY,
                  disX = nowX - params.currentX, disY = nowY - params.currentY,
                  left = parseInt(params.left) + disX,
                  top = parseInt(params.top) + disY;
              if(inWindow) {
                  var maxTop = DB.offsetHeight - target.offsetHeight ,
                      maxLeft = DB.offsetWidth - target.offsetWidth;
                  if(top < 0) top = 0;
                  if(top > maxTop) top = maxTop;
                  if(left < 0) left = 0;
                  if(left > maxLeft) left = maxLeft;
              }
              if(top<=0) {
                return;
              }
              //target.style.left = left + "px";
              target.style.right = DB.offsetWidth - left - target.scrollWidth + 10 + "px";
              target.style.top = top + "px";

              if (typeof callback == "function") {
                  callback(left, top);
              }
          };
          
          bindHandler(DB, "mouseup", stopDrag);
          bindHandler(DB, "mousemove", beginDrag);
      });
      
      function bindHandler(elem, type, handler) {
          if (window.addEventListener) {
              //false表示在冒泡阶段调用事件处理程序
              elem.addEventListener(type, handler, false);
          } else if (window.attachEvent) {
              // IE浏览器
              elem.attachEvent("on" + type, handler);
          }
      }

      function removeHandler(elem, type, handler) {
          // 标准浏览器
          if (window.removeEventListener) {
              elem.removeEventListener(type, handler, false);
          } else if (window.detachEvent) {
              // IE浏览器
              elem.detachEvent("on" + type, handler);
          }
      }
      
  })(bar, target, inWindow, callback);
};

/**
 * 从URL中获取参数obj
 */
var getParamFormURL = function(p, urlParam) {
    //获取url中"?"符后的字串
    var url = '';
    if(urlParam){
        var index = urlParam.indexOf("?");
        url = urlParam.substr(index);
    }else{
        url = decodeURIComponent(location.search); 
    }
    
    url = url.replace(/\+/g, '%20');
    var theRequest = new Object();
    if (url.indexOf("?") > -1) {
        var str  = url.substr(1);
        var strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]);
        }
    }
    if(!!p){
        return theRequest[p];
    }else{
        return theRequest;
    }
}
var deepClone = function(source) { 
    var result={};
    for (var key in source) {
        result[key] = typeof source[key]==='object'? deepClone(source[key]): source[key];
    } 
    return result; 
}
export default { installEvent, startDrag, getParamFormURL, deepClone, _ }