/* eslint-disable */
// 页面停留时长
import { _, console} from './utils';

var pagetime = {
  data: {
    nowDate: 0, // 刚刚进入时候的时刻
    pagetime: 0, // 当前页面累计停留时长
    duration: [], // 元素累计曝光时长
    suspendid: null // 每次进入页面时候生成的标识，上报的数据都归属这个标识 
  },
  config: {
    enable_pagetime: false, // 默认不开启
    single_page: true, // 假如应用是单页面应用，切换路由时是否需要监听，默认不监听
    intersectionRoot: null, // 要监听的元素父元素，更细粒度（解决监听某个页面中，某个滚动父元素里的子元素），默认是当前窗口
    root: null, // 元素停留时长，监听的元素所在的父元素。默认 body。注意：是针对当前页面所有元素的父元素。
    el_threshold_steps: 10, // 元素监听默认步骤，按照 10份 分割
    el_threshold: 0.1, // 元素曝光可视区域的范围阈值(0-1)，默认 0.1（即10%）IntersectionObserver，大于这个阈值表示进入可视区域，否则表示离开可视区域
    polling_ms: 3000, // 间隔发送数据时间
    el_duration_querySelector: [], // 手动设置要监听的元素选择器集合（注意，一定要唯一，若出现重复，会导致数据不准确）
    el_divid_mark: 'data-hubble-el-divid', // 元素标记，要监听的元素上的标记，给外部用户使用
    el_divid_mark_inner: 'data-hubble-el-divid_inner', // 元素标记，统一，框架使用
    el_repeat_listenering: false, // 是否需要重新监听事件，默认不需要。当调用 setConfig 方法时候，可设置
    request_animation_frame: true, // 默认使用 requestAnimationFrame api做定时器（页面激活状态下才触发上报）。false 使用 settimeout
    callback: function() {} // 上报成功后的回调方法
  },
  settimeoutPagetimeNum: null,
  mutationObserver: null,
  intersectionObserver: null,
  init: function(instance) {
    if(!instance) return null;
    this.DATracker = instance;
    var self = this;
    if (self.DATracker.get_config('hubble_render_mode')) {
      return;
    }
    var pagetime = self.DATracker.get_config('pagetime') || {};
    // setConfig 第二个参数，这里传系统时间，因为初始化sdk时间不是页面刚刚进来时间。
    self.setConfig(pagetime, performance && performance.timing && performance.timing.navigationStart);
    
    // 单页面：切换时触发
    _.innerEvent.on('singlePage:change', function() {
      if (self.config.single_page) {
        try {
          var pagetime = self.DATracker.get_config('pagetime') || {};
  
          self.setConfig(pagetime);
        } catch (error) {
          console.error(error);
        }
      }
    });
  },

  clearTimeout: function() {
    if (this.config.request_animation_frame) {
      cancelAnimationFrame(this.settimeoutPagetimeNum);
    } else {
      clearTimeout(this.settimeoutPagetimeNum);
    }
  },
  // 计算停留时长,每隔 一定时间上报一次数据
  stayTime: function() {
    var self = this;
    self.clearTimeout();
    if (!self.config.enable_pagetime || self.DATracker.get_config('hubble_render_mode')) {
      return;
    }

    if (self.config.request_animation_frame) {
      var callbackFn = function() {
        self.data.pagetime =  new Date().getTime() - self.data.nowDate;
        self.send();
      };
      self.customizeSetInterval(callbackFn, self.config.polling_ms);
    } else {
      var callback = function() {
        self.settimeoutPagetimeNum = setTimeout(function() {
          self.data.pagetime =  new Date().getTime() - self.data.nowDate;
          self.send();
          callback();
        }, self.config.polling_ms);
      };
      
      callback();
    }
  },
  // 定时器
  customizeSetInterval: function(callback, interval) {
    var self = this
    if (!requestAnimationFrame) {
      console.error('定时上报数据：浏览器需支持 requestAnimationFrame  方法！');
      return;
    }
    var startTime = Date.now();
    var loop = function() {
      var endTime = Date.now();
        if (endTime - startTime >= interval) {
          startTime = endTime = Date.now();
          callback();
        }
        if (self.config.request_animation_frame) {
          self.settimeoutPagetimeNum = requestAnimationFrame(loop);
        }
    }
    loop();
  },
  // 上报
  send: function() {
    try {
      var self = this;
      if (self.DATracker.get_config('hubble_render_mode')) {
        return;
      }
      var currentUrl = _.info.properties().current_url;
      if (currentUrl) {
        var eventId = _.sha1(currentUrl);
        var attributes = {
          duration: [],
          pagetime: this.data.pagetime,
          suspendid: this.data.suspendid
        };
        var nowTime = new Date().getTime();
        _.each(this.data.duration, function(item) {
          var divtime = item.divtime;
          if (!item.leave) {
            divtime += nowTime - item.startTime;
            item.startTime = nowTime;
            item.divtime = divtime; 
          }
          // 注意：这里divid 需要做个选择器区分。第一个是值，第二个是选择器，方便在注意力热图里使用（找到对应的dom）如：document.querySelector('#test'),  document.querySelector('[data-hubble-el-divid=img3]')

          var divid = item.divid;
          if (item.findType === 'querySelector') {
            divid += ',' + item.divid;
          } else 
          if (item.findType === 'dataAttribute') {
            divid += ',[' + self.config.el_divid_mark + '=' + item.divid + ']';
          }

          attributes.duration.push({
            divid: divid,
            divtime: divtime
          });
        });
        attributes.duration = JSON.stringify(attributes.duration);
        this.DATracker.track(eventId, attributes, this.config.callback, 'auto', 'post');
      }
    } catch (error) {
      console.error(error);
    }
  },
  buildThresholdList: function() {
    var thresholds = [];
    var numSteps = this.config.el_threshold_steps;

    for (var i = 1.0; i <= numSteps; i++) {
        var ratio = i / numSteps;
        thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  },
  // 监听元素停留时长
  monitor: function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    if (!MutationObserver) {
      console.error('监听元素停留时长：浏览器需支持 MutationObserver 方法！');
      return;
    }
    if (!IntersectionObserver) {
      console.error('监听元素停留时长：浏览器需支持 IntersectionObserver 方法！');
      return;
    }
    var self = this;

    try {
      if (self.mutationObserver) {
        // 如果之前已经存在观察，就停止。
        self.mutationObserver.disconnect();
      }
      if (self.intersectionObserver) {
        // 如果之前已经存在观察，就停止。
        self.intersectionObserver.disconnect();
      }
    } catch (error) {
      console.error(error);
    }

    if (!self.config.enable_pagetime || self.DATracker.get_config('hubble_render_mode')) {
      return;
    }

    try {
      var intersectionObserverCallback = function(entries) {
        self.intersectionObserverFn(entries);
      };
      
      var options = {
        root: self.config.intersectionRoot,
        threshold: self.buildThresholdList()
      };
  
      self.intersectionObserver = new IntersectionObserver(intersectionObserverCallback, options);
  
      // 监听body元素变更
      var mutationObserverCallback = function() {
        self.elDividMark(); 
        self.mutantionFn();
      };
  
      self.observer = new MutationObserver(mutationObserverCallback);
      var root = self.config.root || document.body;
      self.observer.observe(root, { attributes: false, childList: true, subtree: true });
    } catch (error) {
      console.error(error);
    }
  },
  // TODO: 实时获取有 self.config.el_divid_mark 属性的dom元素，然后添加到监听曝光时长队列
  elDividMark: function() {
    var self = this;
    var elArr = document.querySelectorAll('['+ self.config.el_divid_mark +']');
    var elDurationQuerySelectorArr = [];
    _.each(elArr, function(el) {
      try {
        var divid = el.getAttribute(self.config.el_divid_mark);
        if (divid) {
          var find = self.data.duration.find(function(item) {
            return item.divid === divid;
          });
          if (!find) {
            elDurationQuerySelectorArr.push(divid);
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
    self.addElements(elDurationQuerySelectorArr, 'dataAttribute');
  },
  intersectionObserverFn: function(entries) {
    try {
      var self = this;
      var nowTime = new Date().getTime();
      _.each(entries, function(entry, i) {
        try {
          // 元素停留时长：进入后开始计时， 到离开时停止累计时间
          var target = entry.target;
          if (target) {
            var divid = target.getAttribute(self.config.el_divid_mark_inner);
            _.each(self.data.duration, function(item) {
              if (item.divid === divid) {
                // 离开了
                if (entries[i].intersectionRatio <= self.config.el_threshold) {
                  if (item.startTime > 0) {
                    item.divtime += nowTime - item.startTime;
                  }
                  item.startTime = 0;
                  item.leave = true;
                  console.log(divid ,'离开了')
                } else {
                  console.log(divid ,'进来了')
                  item.leave = false;
                  // 进入了
                  if (item.startTime > 0) {
                    item.divtime += nowTime - item.startTime;
                  }
                  item.startTime = nowTime;
                }
              }
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  mutantionFn: function() {
    var self = this;
    if (!self.intersectionObserver) {
      console.error('没有初始化 intersectionObserver 监听器');
      return;
    }
    _.each(self.data.duration, function(item) {
      try {
        if (item.divid) {
          var ele = null;
          // 类型：是通过参数配置选择器的元素
          if (item.findType === 'querySelector') {
            ele = document.querySelector(item.divid);
          } else 
          // 类型：是通过添加标记属性的元素 
          if (item.findType === 'dataAttribute') {
            ele = document.querySelector('[' + self.config.el_divid_mark + '=' + item.divid +']');
          }
          
          if (ele) {
            if (self.config.el_divid_mark_inner) {
              if (!ele.getAttribute(self.config.el_divid_mark_inner)) {
                ele.setAttribute(self.config.el_divid_mark_inner, item.divid);
              }
              if (!item.startObserve) {
                item.startObserve = true;
                self.intersectionObserver.observe(ele);
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    });  
  },
  // 设置属性，并初始化,  nowDate 开始计时时间戳，不传就是当前时间戳
  setConfig: function(config, nowDate) {
    var self = this;
    if (self.DATracker.get_config('hubble_render_mode')) {
      return;
    }
    // 刚刚进来，默认为0。
    self.data.pagetime = 0;
    self.data.nowDate = nowDate || new Date().getTime(); 
    self.data.duration = []; // 清除要监听的元素
    self.data.suspendid = _.UUID();

    self.config = _.deepMerge(self.config, config || {});
    if (!self.config.enable_pagetime) {
      self.stop();
      return self;
    }

    var elDurationQuerySelectorArr = self.config.el_duration_querySelector || [];

    self.addElements(elDurationQuerySelectorArr);

    self.stayTime();
    self.monitor();
    if (self.config.el_repeat_listenering) {
      self.mutantionFn();
    } 
    return self;
  },
  stop: function() {
    var self = this;
    self.clearTimeout();
    try {
      if (self.mutationObserver) {
        // 如果之前已经存在观察，就停止。
        self.mutationObserver.disconnect();
        self.mutationObserver = null;
      }
      if (self.intersectionObserver) {
        // 如果之前已经存在观察，就停止。
        self.intersectionObserver.disconnect();
        self.intersectionObserver = null;
      }
    } catch (error) {
      console.error(error);
    }
  },
  // 手动添加要监听的元素 参数：querySelectorArr，css选择器集合  findType: querySelector, dataAttribute
  addElements: function(querySelectorArr, findType) {
    var self = this;
    _.each(querySelectorArr, function(querySelectorElId) {
      self.data.duration.push({
        divid: querySelectorElId,
        divtime: 0, // 累计停留时间
        startTime: 0, // 开始计时的时刻
        startObserve: false, // 是否启动停留时长监听
        leave: true, // 是否离开可视区域，默认离开
        findType: findType || 'querySelector' // 选择器初始化方式，默认通过css选择器查找元素
      });
    });
  }
}

export default pagetime;