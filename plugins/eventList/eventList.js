var EventList = function(param) {
  this.host = param.api_host;
  this.hubble_abtest_debug_key = param.hubble_abtest_debug_key;
  this.testDetail; //实验的详情
  this.targetList; //优化指标列表
  this.curEDetail = {}; //当前点击的事件的详情
  this.addQueue = []; //添加事件队列，在获取到实验详情之前调用addEvent的话，放进队列，等获取详情之后执行
  this.init(param.container);
  this.setStyle();
}
// 初始化
EventList.prototype.init = function(container) {
  this.container = document.createElement('div'); // 容器
  this.container.id = 'hubble_ab_cont';
  if(!container) {

    // 没传container，就放在body上
    var btnOpen  = document.getElementById('hubble_op_btn');
    var btnClose = document.getElementById('hubble_cl_btn');
    if(btnOpen) {
      btnOpen.innerHTML = '';
    } else {
      btnOpen = document.createElement('div');
      btnOpen.id  = 'hubble_op_btn';
      document.body.appendChild(btnOpen);
    }
    if(btnClose) {
      //
    } else {
      btnClose = document.createElement('div');
      btnClose.id  = 'hubble_cl_btn';
      btnClose.style.display = 'none';
      document.body.appendChild(btnClose);
    }

    

    var openImg = document.createElement('div');
    openImg.className = 'openImg';
    openImg.onclick = function() {
      btnOpen.className = 'close';
      setTimeout(function(){
        btnClose.style.display = 'block';
      },500)
    }
    btnOpen.appendChild(openImg); //关闭按钮
    btnOpen.appendChild(this.container); //列表

    btnClose.onclick = function() {
      btnClose.style.display = 'none';
      btnOpen.className = 'open';
    }
    this.getTestDetail();
  } else {

    container.appendChild(this.container);
  }
  

  this.initListCnt(this.container);
  this.initPropsCnt(this.container);
}

//初始化列表模块
EventList.prototype.initListCnt = function(container) {
  var list = document.createElement('div'); // 列表容器
  list.className      = 'list_cont';
  this.listCnt   = list;
  container.appendChild(this.listCnt);
}

//初始化属性模块
EventList.prototype.initPropsCnt = function(container) {
  
  var props = document.createElement('div'); // 属性容器
  props.className = 'props_cont';

  this.propsCnt  = props;
  container.appendChild(this.propsCnt);

  this.getPropsHead(this.propsCnt);
  this.getPropsTabs(this.propsCnt);
  this.getPropsList(this.propsCnt);
}

// 属性头部
EventList.prototype.getPropsHead = function(container) {
  var that = this;
  var head = document.createElement('div'); // 头部
  var back = document.createElement('div'); //返回
  var name = document.createElement('span'); //属性名称
  
  head.className = 'head';
  back.className = 'back';
  name.className = 'name';
  
  head.onclick   = function(e) {
    that.listCnt.style.left = '0px';
    that.propsCnt.style.left = '310px';
  }

  head.appendChild(back);
  head.appendChild(name);
  
  container.appendChild(head);
}

// 获取实验详情
EventList.prototype.getPropsTabs = function(container) {
  var that  = this;
  var tabs = document.createElement('div'); //tab切换
  tabs.className = 'tabs';

  var tab1 = document.createElement('div');
  var tab2 = document.createElement('div');
  tab1.className = 'active';
  tab2.className = '';
  tab1.innerHTML = '自定义属性';
  tab2.innerHTML = '默认属性';
  tab1.onclick = function(e) {
    that.addProps('custom');
  }
  tab2.onclick = function(e) {
    that.addProps('default');
  }

  tabs.appendChild(tab1);
  tabs.appendChild(tab2);

  container.appendChild(tabs);
}
// 获取实验详情
EventList.prototype.getPropsList = function(container) {
  var list  = document.createElement('div'); // 属性列表
  list.className = 'list';

  container.appendChild(list);
}

// 获取实验详情
EventList.prototype.getTestDetail = function() {
 
  var that = this;
  //创建异步对象  
  var xhr = new XMLHttpRequest();
  //设置请求的类型及url
  xhr.open('get', this.host + '/abi/abtest/get?debugId='+this.hubble_abtest_debug_key );
  xhr.withCredentials = true;
  //发送请求
  xhr.send();
  xhr.onreadystatechange = function () {
      // 这步为判断服务器是否正确响应
    if (xhr.readyState == 4 && xhr.status == 200) {
      var data = xhr.responseText || '{}';
      if(typeof data == 'string') {
        data = JSON.parse(data);
      }
      
      if(data.success) {
        var result = data.relatedObject || {};
        var target = result.target || '[]';
        that.testDetail = result;
        that.targetList = JSON.parse(target);
      } else {
        that.testDetail = {};
        that.targetList = [];
      }
      that.exeAddQueue();
    } 
  };
}

// 设置实验详情
EventList.prototype.setTestDetail = function(data) {
  this.testDetail = data;
  this.targetList = JSON.parse(data.target || '[]');
  this.exeAddQueue();
}
// 向list中添加事件
EventList.prototype.addEvent = function(param) {
  var that = this;
  var eventId = param.eventId;
  if(!this.testDetail) {
    //这个时候还没有实验详情
    this.addQueue.push(param);
    return;
  }
  var target = this.getTarget(eventId);
  if(!target) return; //如果不是有话指标的话，不用展示 
  var item = document.createElement('div');
  var eventName =  document.createElement('div');
  var eventId =  document.createElement('div');
  var time =  document.createElement('div');
  item.className = 'e_item';
  time.className = 'time';
  eventName.innerHTML = target.eventName;
  eventId.innerHTML = target.eventId;
  time.innerHTML = target.time;
  item.appendChild(eventName);
  item.appendChild(eventId);
  item.appendChild(time);

  item.onclick = (function(name, props) {
    return function() {
      that.curEDetail.eventName = name;

      that.curEDetail.customProps  = props.attributes || {};
      that.curEDetail.defaultProps = {};
      for(var key in props) {
        if(key != 'attributes') {
          that.curEDetail.defaultProps[key] = props[key];
        }
      }
     
      that.addProps('custom');
      that.listCnt.style.left = '-310px';
      that.propsCnt.style.left = '0px';
    }
  })(target.eventName, param)
  this.listCnt.prepend(item);
  
}

//点击事件时，生成属性列表
EventList.prototype.addProps = function(type) {
  
  var str = '';
  var attributes = type=="custom"? this.curEDetail.customProps:this.curEDetail.defaultProps;
  for(var key in attributes) {
    str += '<div class="key">' + key + '</div><div class="value">' + attributes[key] + '</div>';
  }

  var tabs = this.propsCnt.querySelectorAll('.tabs > div');
  if(type=="custom") {
    //自定义
    tabs[0].className = 'active';
    tabs[1].className = '';
  } else {
    //默认
    tabs[0].className = '';
    tabs[1].className = 'active';
  }
  
  this.propsCnt.querySelector('.name').innerHTML = this.curEDetail.eventName;
  this.propsCnt.querySelector('.list').innerHTML = str;
}
// 根据eventId，拿到优化指标信息
EventList.prototype.getTarget = function(eventId) {
  var list = this.targetList;
  var date = new Date();
  var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  var eventName = '';
  for(var i=0; i<list.length; i++) {
    if(list[i].eventName == eventId) {
      return {
        eventId: eventId,
        eventName: list[i].eventCName,
        time: hour+':'+minute+':'+second
      }
    }
  }
}

//在head中生成css样式
EventList.prototype.setStyle = function() {
  var text  = '#hubble_cl_btn {position: absolute;top:26px;right:26px; width: 68px; height: 68px; background: url('+ this.host +'/track/w/eventList/close.png); cursor:pointer;z-index:999999999;}';
      text += '#hubble_op_btn {position: absolute;top:26px;right:26px; width: 312px;height: 620px; border: 1px solid #E6E6E6; background: #fff;overflow: hidden;z-index:999999999;transition:all 0.5s;}';
      text += '#hubble_op_btn,#hubble_op_btn * {box-sizing: border-box;}';
      text += '#hubble_op_btn.open{width:312px;height:620px;opacity:1;}';
      text += '#hubble_op_btn.close{width:0px;height:0px;opacity:0;}';
      text += '#hubble_op_btn .openImg {float: right; margin: 13px; width: 32px; height: 32px; background: url('+ this.host +'/track/w/eventList/open.png); cursor: pointer;}';
      text += '#hubble_op_btn #hubble_ab_cont {position: absolute;height:550px;right: 0px;top: 56px;}';
      text += '#hubble_ab_cont {width: 310px; background: #fff;overflow: hidden;}';
      text += '#hubble_ab_cont .list_cont,#hubble_ab_cont .props_cont {position:absolute;width:310px;top:10px;left:0px;transition:all 0.3s;}';
      text += '#hubble_ab_cont .list_cont {height: 550px; overflow-x:hidden; overflow-y:auto;}';
      text += '#hubble_ab_cont .props_cont {left:310px; padding: 24px;}';
      text += '#hubble_ab_cont .e_item {height:82px; padding:10px 23px;cursor:pointer;font-size:14px;color:#333;animation:e_item_move 0.5s ease-out;}';
      text += '@keyframes e_item_move{from{ opacity: 0; padding-top: 0px;background: #F0F3FC;} to{opacity:1; padding-top:10px; background: none;}}';
      text += '#hubble_ab_cont .e_item .time{font-size:12px;color:#999;}';
      text += '#hubble_ab_cont .e_item:hover {background: #F0F3FC;}';
      text += '#hubble_ab_cont .props_cont .head {margin-bottom: 18px; font-size:14px;color: #3366CC;background: rgba(310,310,310,0.30);cursor:pointer;}';
      text += '#hubble_ab_cont .props_cont .head .back {display: inline-block;vertical-align: bottom;width:20px;height:20px; background: url('+ this.host +'/track/w/eventList/back.png); margin-right: 8px;}';
      text += '#hubble_ab_cont .props_cont .tabs {height: 32px;margin-bottom: 18px}';
      text += '#hubble_ab_cont .props_cont .tabs >div {float:left;width:50%;height:32px;line-height:32px;font-size:14px;color:#333;text-align:center;border: 1px solid #E6E6E6;cursor:pointer;}';
      text += '#hubble_ab_cont .props_cont .tabs >div:nth-child(1){border-right:none;border-top-left-radius:4px;border-bottom-left-radius:4px;}';
      text += '#hubble_ab_cont .props_cont .tabs >div:nth-child(2){border-left:none;border-top-right-radius:4px;border-bottom-right-radius:4px;}';
      text += '#hubble_ab_cont .props_cont .tabs >div.active {background: #6A6D73;color:#fff;}';
      text += '#hubble_ab_cont .props_cont .list {height: 420px; overflow-x:hidden; overflow-y:auto;}';
      text += '#hubble_ab_cont .props_cont .list >div.key {font-size:12px;color:#999;}';
      text += '#hubble_ab_cont .props_cont .list >div.value {margin-bottom:14px;font-size:12px;color:#333;word-wrap: break-word;}';
  var styleNode  = document.createElement('style');
  styleNode.type = 'text/css';
  
  if( styleNode.styleSheet){ 
    //ie下要通过 styleSheet.cssText写入. 
    styleNode.styleSheet.cssText = text;  
  }else{
    //在ff中， innerHTML是可读写的，但在ie中，它是只读的.
    styleNode.innerHTML = text;
  }  
  document.getElementsByTagName('head')[0].appendChild(styleNode);
}

//将队列中积累的事件执行完
EventList.prototype.exeAddQueue = function() {
  var list = this.addQueue;
  for(var i=0; i<list.length; i++) {
    this.addEvent(list[i]);
  }
}
// 隐藏
EventList.prototype.hide = function() {
  this.clear();
  document.getElementById('hubble_cl_btn').style.display = 'none';
  document.getElementById('hubble_op_btn').style.display = 'none';
}
// 隐藏
EventList.prototype.show = function() {
  document.getElementById('hubble_cl_btn').style.display = 'none';
  document.getElementById('hubble_op_btn').style.display = 'block';
}
// 情况list列表
EventList.prototype.clear = function() {
  this.curEDetail = {};
  this.addQueue = [];
  if(this.listCnt) {
    this.listCnt.innerHTML = '';
    this.listCnt.style.left = '0px';
  }
  if(this.propsCnt && this.propsCnt.querySelector('.list')) {
    this.propsCnt.querySelector('.list').innerHTML = '';
    this.propsCnt.style.left = '310px';
  }
}

//销毁插件
EventList.prototype.destroy = function() {
  var open  = document.getElementById('hubble_op_btn');
  var close = document.getElementById('hubble_cl_btn');
  document.body.remove(open);
  document.body.remove(close);
}

window.HubbleEventList = EventList;

export default EventList;
