!function(){"use strict";var t=function(t){this.host=t.api_host,this.hubble_abtest_debug_key=t.hubble_abtest_debug_key,this.testDetail,this.targetList,this.curEDetail={},this.addQueue=[],this.init(t.container),this.setStyle()};t.prototype.init=function(t){if(this.container=document.createElement("div"),this.container.id="hubble_ab_cont",t)t.appendChild(this.container);else{var e=document.getElementById("hubble_op_btn"),n=document.getElementById("hubble_cl_btn");e?e.innerHTML="":((e=document.createElement("div")).id="hubble_op_btn",document.body.appendChild(e)),n||((n=document.createElement("div")).id="hubble_cl_btn",n.style.display="none",document.body.appendChild(n));var o=document.createElement("div");o.className="openImg",o.onclick=function(){e.className="close",setTimeout((function(){n.style.display="block"}),500)},e.appendChild(o),e.appendChild(this.container),n.onclick=function(){n.style.display="none",e.className="open"},this.getTestDetail()}this.initListCnt(this.container),this.initPropsCnt(this.container)},t.prototype.initListCnt=function(t){var e=document.createElement("div");e.className="list_cont",this.listCnt=e,t.appendChild(this.listCnt)},t.prototype.initPropsCnt=function(t){var e=document.createElement("div");e.className="props_cont",this.propsCnt=e,t.appendChild(this.propsCnt),this.getPropsHead(this.propsCnt),this.getPropsTabs(this.propsCnt),this.getPropsList(this.propsCnt)},t.prototype.getPropsHead=function(t){var e=this,n=document.createElement("div"),o=document.createElement("div"),i=document.createElement("span");n.className="head",o.className="back",i.className="name",n.onclick=function(t){e.listCnt.style.left="0px",e.propsCnt.style.left="310px"},n.appendChild(o),n.appendChild(i),t.appendChild(n)},t.prototype.getPropsTabs=function(t){var e=this,n=document.createElement("div");n.className="tabs";var o=document.createElement("div"),i=document.createElement("div");o.className="active",i.className="",o.innerHTML="自定义属性",i.innerHTML="默认属性",o.onclick=function(t){e.addProps("custom")},i.onclick=function(t){e.addProps("default")},n.appendChild(o),n.appendChild(i),t.appendChild(n)},t.prototype.getPropsList=function(t){var e=document.createElement("div");e.className="list",t.appendChild(e)},t.prototype.getTestDetail=function(){var t=this,e=new XMLHttpRequest;e.open("get",this.host+"/abi/abtest/get?debugId="+this.hubble_abtest_debug_key),e.withCredentials=!0,e.send(),e.onreadystatechange=function(){if(4==e.readyState&&200==e.status){var n=e.responseText||"{}";if("string"==typeof n&&(n=JSON.parse(n)),n.success){var o=n.relatedObject||{},i=o.target||"[]";t.testDetail=o,t.targetList=JSON.parse(i)}else t.testDetail={},t.targetList=[];t.exeAddQueue()}}},t.prototype.setTestDetail=function(t){this.testDetail=t,this.targetList=JSON.parse(t.target||"[]"),this.exeAddQueue()},t.prototype.addEvent=function(t){var e=this,n=t.eventId;if(this.testDetail){var o=this.getTarget(n);if(o){var i,s,a=document.createElement("div"),r=document.createElement("div"),p=(n=document.createElement("div"),document.createElement("div"));a.className="e_item",p.className="time",r.innerHTML=o.eventName,n.innerHTML=o.eventId,p.innerHTML=o.time,a.appendChild(r),a.appendChild(n),a.appendChild(p),a.onclick=(i=o.eventName,s=t,function(){for(var t in e.curEDetail.eventName=i,e.curEDetail.customProps=s.attributes||{},e.curEDetail.defaultProps={},s)"attributes"!=t&&(e.curEDetail.defaultProps[t]=s[t]);e.addProps("custom"),e.listCnt.style.left="-310px",e.propsCnt.style.left="0px"}),this.listCnt.prepend(a)}}else this.addQueue.push(t)},t.prototype.addProps=function(t){var e="",n="custom"==t?this.curEDetail.customProps:this.curEDetail.defaultProps;for(var o in n)e+='<div class="key">'+o+'</div><div class="value">'+n[o]+"</div>";var i=this.propsCnt.querySelectorAll(".tabs > div");"custom"==t?(i[0].className="active",i[1].className=""):(i[0].className="",i[1].className="active"),this.propsCnt.querySelector(".name").innerHTML=this.curEDetail.eventName,this.propsCnt.querySelector(".list").innerHTML=e},t.prototype.getTarget=function(t){for(var e=this.targetList,n=new Date,o=n.getHours()<10?"0"+n.getHours():n.getHours(),i=n.getMinutes()<10?"0"+n.getMinutes():n.getMinutes(),s=n.getSeconds()<10?"0"+n.getSeconds():n.getSeconds(),a=0;a<e.length;a++)if(e[a].eventName==t)return{eventId:t,eventName:e[a].eventCName,time:o+":"+i+":"+s}},t.prototype.setStyle=function(){var t="#hubble_cl_btn {position: absolute;top:26px;right:26px; width: 68px; height: 68px; background: url("+this.host+"/track/w/eventList/close.png); cursor:pointer;z-index:999999999;}";t+="#hubble_op_btn {position: absolute;top:26px;right:26px; width: 312px;height: 620px; border: 1px solid #E6E6E6; background: #fff;overflow: hidden;z-index:999999999;transition:all 0.5s;}",t+="#hubble_op_btn,#hubble_op_btn * {box-sizing: border-box;}",t+="#hubble_op_btn.open{width:312px;height:620px;opacity:1;}",t+="#hubble_op_btn.close{width:0px;height:0px;opacity:0;}",t+="#hubble_op_btn .openImg {float: right; margin: 13px; width: 32px; height: 32px; background: url("+this.host+"/track/w/eventList/open.png); cursor: pointer;}",t+="#hubble_op_btn #hubble_ab_cont {position: absolute;height:550px;right: 0px;top: 56px;}",t+="#hubble_ab_cont {width: 310px; background: #fff;overflow: hidden;}",t+="#hubble_ab_cont .list_cont,#hubble_ab_cont .props_cont {position:absolute;width:310px;top:10px;left:0px;transition:all 0.3s;}",t+="#hubble_ab_cont .list_cont {height: 550px; overflow-x:hidden; overflow-y:auto;}",t+="#hubble_ab_cont .props_cont {left:310px; padding: 24px;}",t+="#hubble_ab_cont .e_item {height:82px; padding:10px 23px;cursor:pointer;font-size:14px;color:#333;animation:e_item_move 0.5s ease-out;}",t+="@keyframes e_item_move{from{ opacity: 0; padding-top: 0px;background: #F0F3FC;} to{opacity:1; padding-top:10px; background: none;}}",t+="#hubble_ab_cont .e_item .time{font-size:12px;color:#999;}",t+="#hubble_ab_cont .e_item:hover {background: #F0F3FC;}",t+="#hubble_ab_cont .props_cont .head {margin-bottom: 18px; font-size:14px;color: #3366CC;background: rgba(310,310,310,0.30);cursor:pointer;}",t+="#hubble_ab_cont .props_cont .head .back {display: inline-block;vertical-align: bottom;width:20px;height:20px; background: url("+this.host+"/track/w/eventList/back.png); margin-right: 8px;}",t+="#hubble_ab_cont .props_cont .tabs {height: 32px;margin-bottom: 18px}",t+="#hubble_ab_cont .props_cont .tabs >div {float:left;width:50%;height:32px;line-height:32px;font-size:14px;color:#333;text-align:center;border: 1px solid #E6E6E6;cursor:pointer;}",t+="#hubble_ab_cont .props_cont .tabs >div:nth-child(1){border-right:none;border-top-left-radius:4px;border-bottom-left-radius:4px;}",t+="#hubble_ab_cont .props_cont .tabs >div:nth-child(2){border-left:none;border-top-right-radius:4px;border-bottom-right-radius:4px;}",t+="#hubble_ab_cont .props_cont .tabs >div.active {background: #6A6D73;color:#fff;}",t+="#hubble_ab_cont .props_cont .list {height: 420px; overflow-x:hidden; overflow-y:auto;}",t+="#hubble_ab_cont .props_cont .list >div.key {font-size:12px;color:#999;}",t+="#hubble_ab_cont .props_cont .list >div.value {margin-bottom:14px;font-size:12px;color:#333;word-wrap: break-word;}";var e=document.createElement("style");e.type="text/css",e.styleSheet?e.styleSheet.cssText=t:e.innerHTML=t,document.getElementsByTagName("head")[0].appendChild(e)},t.prototype.exeAddQueue=function(){for(var t=this.addQueue,e=0;e<t.length;e++)this.addEvent(t[e])},t.prototype.hide=function(){this.clear(),document.getElementById("hubble_cl_btn").style.display="none",document.getElementById("hubble_op_btn").style.display="none"},t.prototype.show=function(){document.getElementById("hubble_cl_btn").style.display="none",document.getElementById("hubble_op_btn").style.display="block"},t.prototype.clear=function(){this.curEDetail={},this.addQueue=[],this.listCnt&&(this.listCnt.innerHTML="",this.listCnt.style.left="0px"),this.propsCnt&&this.propsCnt.querySelector(".list")&&(this.propsCnt.querySelector(".list").innerHTML="",this.propsCnt.style.left="310px")},t.prototype.destroy=function(){var t=document.getElementById("hubble_op_btn"),e=document.getElementById("hubble_cl_btn");document.body.remove(t),document.body.remove(e)},window.HubbleEventList=t}();