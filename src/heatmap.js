/* eslint-disable */

import { _, console } from './utils';
//引入 页面停留时长采集库，注意力热力图
import pagetime from './pagetime';

var heatmap = {
    lastTrackTime: 0,  //上次一采集点击事件的时间，控制1秒钟最多只能发两个，防止用户乱点或者脚本模拟点击事件而影响数据
    getDomIndex: function (el){
      var indexof = [].indexOf;
      if (!el.parentNode) return -1;
      var list = el.parentNode.children;
  
      if (!list) return -1;
      var len = list.length;
  
      if (indexof) return indexof.call(list, el);
      for (var i = 0; i < len; ++i) {
        if (el == list[i]) return i;
      }
      return -1;
    },
    selector:function (el){
      //var classname = _.trim(el.className.baseVal ? el.className.baseVal : el.className);
      var i = (el.parentNode && 9 == el.parentNode.nodeType) ? -1 : this.getDomIndex(el);
      if(el.id){
        return '#' + el.id;
      }else{
        return el.tagName.toLowerCase()      //+ (classname ? classname.replace(/^| +/g, '.') : '')
          + (~i ? ':nth-child(' + (i + 1) + ')' : '');
      }
    },
    getDomSelector : function(el,arr) {
      if(!el || !el.parentNode || !el.parentNode.children){
        return false;
      }
      arr = arr && arr.join ? arr : [];
      var name = el.nodeName.toLowerCase();
      if (!el || name === 'body' || 1 != el.nodeType) {
        arr.unshift('body');
        return arr.join(' > ');
      }
      arr.unshift(this.selector(el));
      if (el.id) return arr.join(' > ');
      return this.getDomSelector(el.parentNode, arr);    
    },
    getDomWidth: function(el) {
      return el.scrollWidth;
    },
    getDomHeight: function(el) {
      return el.scrollHeight;
    },
    /**
     * 父元素中是否有a标签
     */
    hasParentA : function(a) {
      try {
        for (; "body" != a.nodeName.toLowerCase(); ) {
          if ("a" == a.nodeName.toLowerCase())
              return a;
          a = a.parentNode;
        }
      } catch (error) {
        return !1;
      }
      return !1;
    },
    /**
     * 横向滚动的距离
     */
    getScrollLeft : function() {
      var a = 0;
      try {
        a = document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset;
        a = isNaN(a) ? 0 : a;
      } catch (b) {
        a = 0;
      }
      return parseInt(a, 10);
    },
    /**
     * 纵向滚动的距离
     */
    getScrollTop : function() {
      var a = 0;
      try {
        a = document.documentElement.scrollTop || document.body.scrollTop || m.pageYOffset;
        a = isNaN(a) ? 0 : a;
      } catch (b) {
        a = 0;
      }
      return parseInt(a, 10);
    },
    getBoundingClientRect: function(ele) {
      // 该方法是计算当前元素距离当前视口的距离，所以需要得到页面的滚动距离
      var scrollTop = this.getScrollTop();
      var scrollLeft = this.getScrollLeft();
      // 如果浏览器支持该方法
      if (ele.getBoundingClientRect) {
          // if (typeof arguments.callee.offset !== 'number') {
          // //不同浏览器中，元素的默认位置不同。为了统一起见，需要新创建一个元素
          //     var temp = document.createElement('div');
          //     temp.style.cssText = "position:absolute;top:0;left:0";
          //     document.body.appendChild(temp);
          //     arguments.callee.offset = -temp.getBoundingClientRect().top - scrollTop;
          //     document.body.removeChild(temp);
          //     temp = null;
          //     console.log(arguments.callee.offset);
          // }
          var rect = ele.getBoundingClientRect();
          //var offset = arguments.callee.offset;

          return {
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom
          }
      } else {
      //当前浏览器不支持该方法
          var actualLeft = this.getElementLeft(ele);
          var actualTop = this.getElementTop(ele);

          return {
              left: actualLeft - scrollLeft,
              right: actualLeft + offsetWidth - scrollLeft,
              top: actualTop - scrollTop,
              bottom: actualTop + offsetHeight - scrollTop
          }
      }
    },
    //需要使用offsetLeft，offsetTop方法。需要明确的是这两个方法都是当前元素相对于其父元素的位置，所以要得到相对于页面的距离需要循环计算。
    getElementLeft: function(ele) {
        var actualLeft = ele.offsetLeft;
        var current = ele.offsetParent;
        // 如果当前元素不是根元素
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    },
    getElementTop: function(ele) {
        var actualTop = ele.offsetTop;
        var current = ele.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    },
    /**
     * 获取鼠标点击的滚动左边距、上边距
     */
    getMousePosion: function(e) {
      var b = parseInt(+e.clientX + this.getScrollLeft(), 10);
      var a = parseInt(+e.clientY + this.getScrollTop(), 10);
      return {
        left : isNaN(b) ? 0 : b,
        top : isNaN(a) ? 0 : a
      }
    },
    /**
     * 获取被点击的元素位置
     */
    getDomPosition : function(ele) {
      // 距离窗口的长度
      var c = this.getBoundingClientRect(ele);
      // 再加上滚动的距离
      c.top += this.getScrollTop();
      c.left += this.getScrollLeft();
      
      return {
        top: Math.round(c.top),
        left: Math.round(c.left)
      }
    },
    getBrowserWidth : function() {
      var a = window.innerWidth || document.body.clientWidth;
      return isNaN(a) ? 0 : parseInt(a, 10);
    },
    getBrowserHeight : function() {
      var a = window.innerHeight || document.body.clientHeight;
      return isNaN(a) ? 0 : parseInt(a, 10);
    },
    getScrollWidth : function() {
      var a = parseInt(document.body.scrollWidth, 10);
      return isNaN(a) ? 0 : a;
    },
    /**
     * 采集热力图
     * noPath为true的话，表示不采集path字段
     */
    start : function(ev, target, noPath, parentIsA) {
      var heatmapConfig = this.DATracker.config.heatmap;
      var hasSetSelector = false;
      if(heatmapConfig && heatmapConfig.collect_element && !heatmapConfig.collect_element(target, this)){
        return false;
      }
      if (heatmapConfig && heatmapConfig.set_collect_element_path && _.isFunction(heatmapConfig.set_collect_element_path)) {
        hasSetSelector = true;
      }
      var selector;
      if (hasSetSelector) {
        selector = heatmapConfig.set_collect_element_path(target, this);
        if (!selector) {
          console.error('无元素path');
          return false;
        }
      } else {
        selector = this.getDomSelector(target);
      }
      var prop = _.getEleInfo({target:target}, heatmapConfig, this);
      var eventId;
      // 加入path信息
      prop.path = selector ? selector : '';

      if(heatmapConfig && heatmapConfig.custom_property) {
        var customP = heatmapConfig.custom_property(target);
        if(_.isObject(customP)){
          prop = _.extend(prop,customP);
        }
      }
      if (ev) {
        // 加入点击位置信息，鼠标减去元素就是鼠标相对元素的位置
        // 鼠标相对页面的位置
        var mousePosi = this.getMousePosion(ev);  
        // 元素相对页面的位置
        var domPosi   = this.getDomPosition(target);  
        // 前面在加上元素的path，计算的时候作为聚合的字段
        prop.stat = prop.path + ',' + 
                    (mousePosi.left - domPosi.left) + ',' + 
                    (mousePosi.top - domPosi.top) + ',' + 
                    (this.getDomWidth(target)) + ',' + 
                    (this.getDomHeight(target));
      }
      
      
      if((target.tagName.toLowerCase() === 'a' || parentIsA) && heatmapConfig && heatmapConfig.isTrackLink === true){
        eventId = _.sha1(prop.path);
        prop.path = noPath ? '' : prop.path;
        this.trackLink({event:ev, target:target, parentIsA: parentIsA}, eventId, prop);
      }else{
        if(prop.path) {
          try {
            eventId = _.sha1(prop.path);
            prop.path = noPath ? '' : prop.path;
            this.DATracker.track(eventId,prop, undefined , 'auto');  
          } catch (error) {
            
          }
        }   
      }
    },
    trackLink : function(obj,eventId,eventProp){
      obj = obj || {};
      var link = null;
      var that = this;
      if(obj.ele){
        link = obj.ele;
      }
      if(obj.event){
        if(obj.target){
           link = obj.target;
         }else{
           link = obj.event.target;
         }
      }
  
      eventProp = eventProp || {};
      if(!link || (typeof link !== 'object')){
        return false;
      }
      // 若父元素是超链接的情况，也会进入，此时若页面会刷新的话，要阻止一下。
      if (obj.parentIsA) {
        link = obj.parentIsA;
      }

      // 如果是非当前页面会跳转的链接，直接track
      if (!link.href || /^javascript/.test(link.href) || link.target=='_blank' || link.download || link.onclick) {
        that.DATracker.track(eventId, eventProp, undefined , 'auto');  
        return false;
      }
      function linkFunc(e){
        e.stopPropagation();      
        e.preventDefault();   // 阻止默认跳转
        var hasCalled = false;
        function track_a_click(){
          if (!hasCalled) {
            hasCalled = true;
            location.href = link.href;  //把 A 链接的点击跳转,改成 location 的方式跳转
          }
        }
        setTimeout(track_a_click, 1000);  //如果没有回调成功，设置超时回调      
        that.DATracker.track(eventId, eventProp, track_a_click , 'auto');//把跳转操作加在callback里
      }
      if(obj.event){
        linkFunc(obj.event);
      }
    },      
    hasElement:function(e){
      var path = e._getPath();
      if(_.isArray(path) && (path.length > 0) ){
        for(var i = 0;i<path.length;i++){
          if(path[i] && path[i].tagName && (path[i].tagName.toLowerCase() === 'a')){
            return path[i];
          }
        }
      }
      return false;
    },
    //外部调用：触发热力图事件，参数为采集的元素原生对象 
    trackHeatmap: function(target){
      if((typeof target === 'object') && target.tagName){
        var tagName = target.tagName.toLowerCase();
        var parent_ele = target.parentNode.tagName.toLowerCase();     
        if (tagName !== 'button' && tagName !== 'a' && parent_ele !== 'a' && parent_ele !== 'button' && tagName !== 'input' && tagName !== 'textarea') {
          this.start(null, target, true);
        }
      }
    },
    initHeatmap : function() {
      var that = this;
      var heatmapConfig = that.DATracker.config.heatmap;
      if (!_.isObject(heatmapConfig) || heatmapConfig.clickmap !== 'default') {
        return false;
      }

      // 验证url，function成功就行，非function认为都是全部
      if (_.isFunction(heatmapConfig.collect_url) && !heatmapConfig.collect_url()) {
        return false;
      }

      _.addEvent(document, 'click', function(e) {
        var ev = e || window.event;
        if(!ev){
          return false;
        }
        var target = ev.target || ev.srcElement;
        if(typeof target !== 'object'){
          return false;
        }
        if(typeof target.tagName !== 'string'){
          return false;
        }
        var tagName = target.tagName.toLowerCase();
        if(tagName.toLowerCase() === 'body' || tagName.toLowerCase() === 'html'){
          return false;
        }
        if(!target || !target.parentNode || !target.parentNode.children){
          return false;
        }
      
        // 否则只收集a、button、input、textarea、img中的热区这些点
        var parent_ele = target.parentNode;
        var parentIsA = that.hasParentA(target);
        if (parentIsA) {
          that.start(ev, target, '', parentIsA);
        } else
        if (['button', 'input', 'textarea'].indexOf(tagName) > -1) {
          that.start(ev, target, '');
        } else if (parent_ele.tagName.toLowerCase() === 'button' || parent_ele.tagName.toLowerCase() === 'a') {
          that.start(ev, parent_ele);            
        } else if (tagName === 'area' && parent_ele.tagName.toLowerCase() === 'map' && _.ry(parent_ele).prev().tagName && _.ry(parent_ele).prev().tagName.toLowerCase() === 'img') {
          that.start(ev, _.ry(parent_ele).prev());
        } else if (heatmapConfig.collect_all) {
          // 如果配置了全埋点，所有的点击事件都要收集
          // 为了避免画热力图时会出现嵌套的情况，当点击有子节点的元素时，不穿path字段
          var curTime = new Date();
          if ((curTime - that.lastTrackTime)/1000 >= 0.5) {
            // 与上次发送事件相隔0.5秒以上可以再次发送
            that.lastTrackTime = curTime - 0;
            that.start(ev, target, target.children.length > 0);
          }
        }
      });
    },
    prepare:function(todo){
      var match = location.href.match(/hubble_heatmap_id=([^&#]+)/);
      var me = this;
      var heatmap_url = me.DATracker.config.heatmap_url;
      var heatmapConfig = me.DATracker.config.heatmap;
      var loadTimeout = 3000;
      if(_.isObject(heatmapConfig)) {
        loadTimeout = heatmapConfig.loadTimeout;
      }
      function isReady(data){
        if(heatmap_url){
          _.loadScript({
            success:function(){
                // setTimeout(function(){
                //     if(typeof hubble_jssdk_heatmap_render !== 'undefined'){
                //       hubble_jssdk_heatmap_render(me.DATracker, data);   
                //     }
                // }, loadTimeout || 3000);
            },
            error:function(){},
            type:'js',
            url: heatmap_url + '?_=' + Math.random()
          });
        }else{
            console.error('没有指定heatmap_url的路径');
        }
      }
      // 如果有id，才有可能是首次，首次的时候把hubble_heatmap_id存进去
      if(match && match[0] && match[1]){
        me.DATracker.set_config({hubble_render_mode: true});
        if(_.sessionStorage.isSupport()){
          sessionStorage.setItem('hubble_heatmap_id',match[1]);        
        }
        isReady(match[1]);
      } else if(_.sessionStorage.isSupport() && typeof sessionStorage.getItem('hubble_heatmap_id') === 'string'){
        me.DATracker.set_config({hubble_render_mode: true});    
        isReady(sessionStorage.getItem('hubble_heatmap_id'));
      }else{
        todo();
        me.DATracker.pagetime.init(me.DATracker);
        //进入热力图采集模式
        if (_.isObject(heatmapConfig)) {
          me.initHeatmap();
          me.DATracker.track_heatmap =  _.bind(me.trackHeatmap, me);
        }
      }
    },
    init: function(DATracker, todo) {
        if(!DATracker || !todo) return;
        this.DATracker = DATracker;
        this.DATracker.heatmap = this;
        // 预定义该API，防止用户调用报错。用户正确使用该API，首先需要启动热力图；第二需要进入热力图采集模式
        this.DATracker.track_heatmap = function() {};
        this.DATracker.pagetime = pagetime;
        this.prepare(todo);
    }
};

export default heatmap;