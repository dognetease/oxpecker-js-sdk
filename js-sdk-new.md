**关于本地存储cookie跨子域配置使用场景说明：假如产品二级域是 163.com 的，由于公司很多产品都是这个域名，此时应该关闭跨子域。**
# 获取和引入 HubbleData SDK

## 异步方式 （推荐）    
引入场景：通常情况下使用。

### 本地手动指定sdk版本
    
最新版本： https://hubble-js-bucket.nosdn.127.net/DATracker.globals.1.6.13.js
将下面代码放入&lt;/head&gt;标签之前： 
```html
<script type="text/javascript">
(function(document,datracker,root){function loadJsSDK(){var script,first_script;script=document.createElement("script");script.type="text/javascript";script.async=true;script.src="https://hubble-js-bucket.nosdn.127.net/DATracker.globals.1.6.13.js";first_script=document.getElementsByTagName("script")[0];first_script.parentNode.insertBefore(script,first_script)}if(!datracker["__SV"]){var win=window;var gen_fn,functions,i,lib_name="DATracker";window[lib_name]=datracker;datracker["_i"]=[];datracker["init"]=function(token,config,name){var target=datracker;if(typeof(name)!=="undefined"){target=datracker[name]=[]}else{name=lib_name}target["people"]=target["people"]||[];target["abtest"]=target["abtest"]||[];target["toString"]=function(no_stub){var str=lib_name;if(name!==lib_name){str+="."+name}if(!no_stub){str+=" (stub)"}return str};target["people"]["toString"]=function(){return target.toString(1)+".people (stub)"};function _set_and_defer(target,fn){var split=fn.split(".");if(split.length==2){target=target[split[0]];fn=split[1]}target[fn]=function(){target.push([fn].concat(Array.prototype.slice.call(arguments,0)))}}functions="get_user_id track_heatmap register_attributes register_attributes_once clear_attributes unregister_attributes current_attributes single_pageview disable time_event get_appStatus track set_userId track_pageview track_links track_forms register register_once alias unregister identify login logout signup name_tag set_config reset people.set people.set_once people.set_realname people.set_country people.set_province people.set_city people.set_age people.set_gender people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.set_populationWithAccount  people.set_location people.set_birthday people.set_region people.set_account abtest.get_variation abtest.async_get_variable".split(" ");for(i=0;i<functions.length;i++){_set_and_defer(target,functions[i])}datracker["_i"].push([token,config,name])};datracker["__SV"]=1.6;loadJsSDK()}})(document,window["DATracker"]||[],window);
// 初始化
// 注意： 在Hubble平台创建一个类型为`Web`应用，复制对应的appkey，替换下面的 `88888888`
// truncateLength:上报数据字段的长度设置
// persistence: 存储到本地的方式
// cross_subdomain_cookie : 若是存储到cookie，是否支持跨二级域
DATracker.init('88888888', {truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});

</script>
```



### 自动升级sdk版本

**`使用该方式时，当sdk有大版本改动时，请注意更新通知。当前自动升级版本 v1.6.13`**    
将下面代码放入&lt;/head&gt;标签之前： 
```html
<script type="text/javascript">
(function(document,datracker,root){var help={};help.cookie={get:function(name){var nameEQ=name+"=";var ca=document.cookie.split(";");for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==" "){c=c.substring(1,c.length)}if(c.indexOf(nameEQ)===0){return decodeURIComponent(c.substring(nameEQ.length,c.length))}}return null},parse:function(name){var cookie;try{cookie=_.JSONDecode(_.cookie.get(name))||{}}catch(err){}return cookie},set:function(name,value,days,cross_subdomain,is_secure){var cdomain="",expires="",secure="";if(cross_subdomain){var matches=document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),domain=matches?matches[0]:"";cdomain=((domain)?"; domain=."+domain:"")}if(days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toGMTString()}if(is_secure){secure="; secure"}var new_cookie_val=name+"="+encodeURIComponent(value)+expires+"; path=/"+cdomain+secure;document.cookie=new_cookie_val;return new_cookie_val},remove:function(name,cross_subdomain){_.cookie.set(name,"",-1,cross_subdomain)}};root.getHubbleJSSDKVersions=function(version){help.cookie.set("mp_versions_hubble_jsSDK",version,false,true);loadJsSDK()};function removeElement(_element){var _parentElement=_element.parentNode;if(_parentElement){_parentElement.removeChild(_element)}}function addScriptTag(src){var loaded;var head=document.getElementsByTagName("head")[0];var script=document.createElement("script");var localVersion=help.cookie.get("mp_versions_hubble_jsSDK");script.setAttribute("type","text/javascript");script.src=src;script.onload=script.onreadystatechange=function(){if(!loaded&&(!script.readyState||/loaded|complete/.test(script.readyState))){script.onload=script.onreadystatechange=null;loaded=true;removeElement(script)}};head.appendChild(script)}function addScriptTagTwo(url,fn){var isFirst=true;var iframe;try{iframe=document.createElement("iframe");iframe.style.display="none"}catch(e){iframe=document.createElement("iframe");iframe.setAttribute("src",url)}var loadfn=function(){if(isFirst){iframe.contentWindow.location="about:blank";isFirst=false}else{fn(iframe.contentWindow.name);iframe.contentWindow.document.write("");iframe.contentWindow.close();document.body.removeChild(iframe);iframe.src="";iframe=null}};iframe.src=url;if(iframe.attachEvent){iframe.attachEvent("onload",loadfn)}else{iframe.onload=loadfn}if(iframe){document.body.appendChild(iframe)}}function loadJsSDK(){var localVersion=help.cookie.get("mp_versions_hubble_jsSDK");var HUBBLE_LIB_URL="https://hubble.netease.com/track/w/DATracker.globals.js";var script,first_script;script=document.createElement("script");script.type="text/javascript";script.async=true;if(localVersion){HUBBLE_LIB_URL="https://hubble-js-bucket.nosdn.127.net/"+localVersion+".js"}script.src=HUBBLE_LIB_URL;first_script=document.getElementsByTagName("script")[0];first_script.parentNode.insertBefore(script,first_script)}if(!datracker["__SV"]){var win=window;try{var getHashParam,matches,state,loc=win.location,hash=loc.hash;getHashParam=function(hash,param){matches=hash.match(new RegExp(param+"=([^&]*)"));return matches?matches[1]:null};if(hash&&getHashParam(hash,"state")){state=JSON.parse(decodeURIComponent(getHashParam(hash,"state")));if(state["action"]==="mpeditor"){win.sessionStorage.setItem("_mpcehash",hash);history.replaceState(state["desiredHash"]||"",document.title,loc.pathname+loc.search)}}}catch(e){}var gen_fn,functions,i,lib_name="DATracker";window[lib_name]=datracker;datracker["_i"]=[];datracker["init"]=function(token,config,name){var target=datracker;if(typeof(name)!=="undefined"){target=datracker[name]=[]}else{name=lib_name}target["people"]=target["people"]||[];target["abtest"]=target["abtest"]||[];target["toString"]=function(no_stub){var str=lib_name;if(name!==lib_name){str+="."+name}if(!no_stub){str+=" (stub)"}return str};target["people"]["toString"]=function(){return target.toString(1)+".people (stub)"};function _set_and_defer(target,fn){var split=fn.split(".");if(split.length==2){target=target[split[0]];fn=split[1]}target[fn]=function(){target.push([fn].concat(Array.prototype.slice.call(arguments,0)))}}functions="get_user_id track_heatmap register_attributes register_attributes_once clear_attributes unregister_attributes current_attributes single_pageview disable time_event get_appStatus track set_userId track_pageview track_links track_forms register register_once alias unregister identify login logout signup name_tag set_config reset people.set people.set_once people.set_realname people.set_country people.set_province people.set_city people.set_age people.set_gender people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.set_populationWithAccount  people.set_location people.set_birthday people.set_region people.set_account abtest.get_variation abtest.async_get_variable".split(" ");for(i=0;i<functions.length;i++){_set_and_defer(target,functions[i])}datracker["_i"].push([token,config,name])
};datracker["__SV"]=1.6}if(!help.cookie.get("mp_versions_hubble_jsSDK")){addScriptTag("https://hubble.netease.com/track/w/version.js?random"+Math.random())}else{loadJsSDK()}})(document,window["DATracker"]||[],window);
//初始化
//注意： 在Hubble平台创建一个类型为`Web`应用，复制对应的appkey，替换下面的 `88888888`
DATracker.init('88888888', {truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
</script>

```    

## 同步方式    
引入场景：APP与H5混合模式下，打通两者之间数据通信。    
使用该方式时，请手动替换sdk引入地址。    
sdk地址：     
最新版本地址： https://hubble-js-bucket.nosdn.127.net/DATracker.sync.1.6.13.js     

初始化时新增 `use_app_track` 配置项，只要配置为 true , 即可支持APP采集H5页面数据。
```html
<!-- 将下面的代码放入&lt;/head&gt;标签之前 -->
  <script src="https://hubble-js-bucket.nosdn.127.net/DATracker.sync.1.6.13.js"></script>
  <script>
        //初始化
        //注意： 在Hubble平台创建一个类型为`Web`应用，复制对应的appkey，替换下面的 `88888888`
        DATracker.init('88888888', {use_app_track: true, truncateLength: 255,truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
        //APP端将数据传递给H5
        DATracker.get_appStatus(function(app_info){
            //设置userId  
            DATracker.login(app_info.userId);  
            // 跟踪事件 
            DATracker.track(document.title+'-h5');
        });
  </script>
```

### 初始化sdk 
首先在Hubble平台创建一个类型为`Web`应用，复制对应的appkey，替换下面的 `88888888`
```js
   DATracker.init('88888888',{truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
```
这样就已经跟Hubble平台建立连接了。


## vscode编辑器插件

辅助开发插件：Hubble-sdk-web版的VSCode插件   
功能：支持鼠标悬浮提示、api代码补齐、sdk初始化。
  


## 如何标识用户

### 在登录和注册成功后，调用DATracker.login\(user\_id\) 来标识真实用户

JavaScript SDK 会自动生成一个 deviceUDID 并永久保存在浏览器中的 Cookie 中,作为匿名用户唯一标识。如果你已知了真实的用户 id ，你可以通过 DATracker.login\(user\_id\)设置用户userId。

##### 问题1，这行代码放在哪里？

必须放在所有事件前面。也就是在 sdk 载入代码后面，先使用 DATracker.login ，然后再调用事件跟踪等，这样后续的事件才会使用这新的userId。

##### 问题2，在什么时候调用？

页面登录的时候，只要获取到用户是登录状态，就需要调用。或者 注册流程成功的时候。

### 使用 DATracker.logout 切换到之前的匿名 id

DATracker.logout\(\);取消当前登录的userId

@param {function} callback 可选。表示已经发送完数据之后的回调

##### 问题1，这个在什么时候使用？

在你用过 DATracker.login 后，在一个浏览器有多个用户登录的时候，你想在用户退出后清除当前的userId


### 打通163网站

网站二级域是163域的情况下，新增采集163域的用户id信息（www.163.com网站的用户信息），添加到每个上报事件的自定义属性里，方便其它二级域是163网站跟www.163.com网站用户信息打通，新增属性为：

| 字段名称 | 类型    |  说明 |
| --------       | :-----:  | :----: | 
| $_ntes_nnid_id                  | string      |   首次进入www.163.com网站匿名随机固定id     |
| $_ntes_nnid_time           | string      |  首次进入www.163.com网站时间戳    |
| $_ntes_domain            | string      |  采集数据来源域，默认：163.com           |
| $_ntes_nuid               | string         |     首次进入www.163.com网站匿名随机固定id |
| $P_INFO_userid               | string         |     最近一次登陆www.163.com网站账号 |
| $P_INFO_time               | string         |     最近一次登陆www.163.com网站时间  |


## 自定义事件追踪   

形式一: 事件ID + 事件自定义属性    
DATracker.track( eventId: string, attributes: object )      

形式二: 事件ID      
DATracker.track( eventId: string )


HubbleData SDK 初始化成功后，即可以通过 DATracker.track\(\) 记录事件：

```
// 追踪浏览商品事件。
DATracker.track('ViewProduct', {

    ProductId: '123456',

    ProductCatalog: "Laptop Computer",

    ProductName: "MacBook Pro",

    ProductPrice: 123.45

});
```


### 事件自定义通用属性设置
特别地，如果某个事件的属性，在所有事件中都会出现，可以将该属性设置为事件通用属性，通用属性会保存在本地cookie，可调用如下接口：

### DATracker.register_attributes(properties) 
成功设置事件通用属性后，再通过 track: 追踪事件时，事件通用属性会被添加进每个事件中。重复调用 register_attributes: 会覆盖之前已设置的相同key的通用属性。    
```js
DATracker.register_attributes({'event': 'test-page'});
``` 

### DATracker.register_attributes_once(properties) 
如果不覆盖之前已经设定的通用属性（除非已存在的对象值和defaultValue相等），可调用：   
```js
DATracker.register_attributes_once({'event': 'test-page'});
``` 

### DATracker.current_attributes(callbackFn) 
查看当前已设置的通用属性，调用：  
```js
DATracker.current_attributes(function(properties) {
     console.log(properties);
});
``` 

### DATracker.unregister_attributes(eventName) 
删除一个通用属性，调用： 
```js
DATracker.unregister_attributes('event');
``` 

### DATracker.clear_attributes(eventName) 
删除所有已设置的事件通用属性，调用：
```js
DATracker.clear_attributes();
``` 


## 设置用户属性

### DATracker.people.set\(properties\)

直接设置用户的属性，如果存在则覆盖。

* properties：object，必选。 

```
DATracker.people.set({name:'张三'});
```

<!-- ### DATracker.people.set\_once\(properties\)

如果不存在则设置，存在就不设置。

* properties：object，必选。 

```
DATracker.people.set_once({name:'张三'});
``` -->

### 内置属性列表

```
$realName（姓名）、$age（年龄）、$city（城市）、$country（国家）、$gender（性别）、$province（省份）、persistedTime（首次使用时间）、最近使用时间（lastUseTime）
```

### 内置属性方法

```
DATracker.people.set_realname() 
DATracker.people.set_country() 
DATracker.people.set_province() 
DATracker.people.set_city() 
DATracker.people.set_age() 
DATracker.people.set_gender()
```

#### 设置用户性别(0-女，1-男，2-未知)
```js
DATracker.people.set_gender(0);
```

## 热力图数据采集
热力图默认只采集指定的交互元素（ a input button ），如果需要采集全部元素，请开启collect_all字段，具体见下方1.6.2.【heatmap支持的配置项说明】
### 启动需要的必填配置项
```js
// 注意： 在Hubble平台创建一个类型为`Web`应用，复制对应的appkey，替换下面的 `88888888`
DATracker.init('88888888', {
    // 启动热力图采集
   heatmap: {
        //设置为true后，sdk自动给可以跳转的 a 标签绑定一个类似 DATracker.track_links() 的方法。
        //默认值为false
        isTrackLink: true
   },
   // 上报数据字段的长度设置
   truncateLength: 255,
   // 设置本地存储位置，系统建议保存到 localStorage，若浏览器不支持，sdk会降级保存到cookie下
   persistence: "localStorage",
   cross_subdomain_cookie: false
});
```
### heatmap支持的配置项说明
```js
heatmap: {
    // 是否采集所有点击位置，默认false。
    // 设置为true后，可在“点击热图”中看到网页所有位置的点击情况
    // 注：未避免“交互热图”中出现多层热区嵌套的问题，有子元素的dom只能看到本身的点击情况，无子元素的dom可以看到本身的点击情况以及交互情况
    collect_all: false,
    //设置为true后，sdk自动给可以跳转的 a 标签绑定一个类似 DATracker.track_links() 的方法。
    //默认值为false
    isTrackLink: true,
    //设置多少毫秒后开始渲染热力图,因为刚打开页面时候页面有些元素还没加载，默认是 3000ms
    loadTimeout: 3000，
    //配置了这个函数后，默认不再采集热力图数据（指交互按钮 a，button，input 的数据）
    //当返回true的时候，热力图数据采集生效
    collect_url: function() {
        //使用场景如：
        //只采集指定页面
        if(location.href === "https://xxx.com/collection.html") {
            return true;
        }
    },
    //配置了这个函数后，默认不再采集热力图数据（指交互按钮 a，button，input 的数据）
    //用户点击（a，button，input）这些元素时会触发这个函数，让你来判断是否要采集当前这个元素，
    //当返回true的时候，热力图数据采集生效
    collect_element: function(targetElement) {
        //示例
        //点击的元素属性 hubble-disable 为true时，不采集这个元素的热力图数据
        if(targetElement.getAttribute('hubble-disable') === 'true'){
            return false;
        }else{
            return true;
        }
    },
    //设置input里的内容是否采集，sdk默认是不采集的（基于安全隐私考虑，比如password等就不好采集）
    //如果要采集，请返回true
    collect_input: function(targetElement) {
        //例如如果元素的id是userId，就采集这个元素里的内容
        if(element_target.id === 'userId'){
            return true;
        }
    }
}
```
### 采集自定义元素的热力图信息 DATracker.track_heatmap(target);
因为热力图默认只采集指定的交互元素（ a input button ），如果需要采集其它元素的话，手动使用下面的方式。
```js
    //例子
    //采集 某个p 元素
    document.getElementsByTagName('p')[1].onclick = function(e) {
        var target = e.target || e.srcElement;
        DATracker.track_heatmap(target); //参数是发生事件的dom元素
    }
    //采集图片
    $('img').on('click',function(){
        DATracker.track_heatmap(this); //参数是发生事件的dom元素
    });
```

### 自定义获取元素路径
SDK采集元素的信息，其中一个就是元素的路径，顺序为 id > 层级关系。有些时候可能id是动态生成的，此时采集id就不可靠了，会导致绘制热力图失败。这时候就需要用户自定义获取元素路径的方法了。
示例：
```js
heatmap: {
    // 自定义设置采集的元素的路径，需返回该元素的path，
    // 该路径是热力图渲染时查找元素所需，请正确设置
    set_collect_element_path: function(targetElement, heatmap) {
        var selector = function(targetElement) {
            var i = (targetElement.parentNode && 9 == targetElement.parentNode.nodeType) ? -1 : heatmap.getDomIndex(targetElement);
            return targetElement.tagName.toLowerCase()
                + (~i ? ':nth-child(' + (i + 1) + ')' : '');
        };
        var getDomSelector = function(targetElement,arr) {
            if(!targetElement || !targetElement.parentNode || !targetElement.parentNode.children){
                return false;
            }
            arr = arr && arr.join ? arr : [];
            var name = targetElement.nodeName.toLowerCase();
            if (!targetElement || name === 'body' || 1 != targetElement.nodeType) {
                arr.unshift('body');
                return arr.join(' > ');
            }
            arr.unshift(selector(targetElement));
            return getDomSelector(targetElement.parentNode, arr);
        }
        return getDomSelector(targetElement);
    }
}
```

## ABtest

浏览器兼容：ABtest 只支持现代浏览器，低端浏览器不做兼容。

### 引入优化代码    

一般的，改变元素的实验都会有一个元素闪变的现状，为了不影响用户体验，我们会先将该元素隐藏，等到元素改变后，再显示出来，Hubble的可视化实验提供了这个优化方案。       
具体如下：     
把下面的代码放到页面的head最头部分,保证优先执行。
```js
(function(document,abtestingLeadCode,dataLayer,root){if(!abtestingLeadCode["__SV"]){abtestingLeadCode={__SV:1,isshowPage:false,showPage:function(){if(!this.isshowPage){this.isshowPage=true;var styleNode=document.getElementById("_hb_abtesting_page_hides");if(styleNode){styleNode.parentNode.removeChild(styleNode)}}},hidePage:function(){var styleNode=document.createElement("style");var style="body{opacity:0 !important;}";var head=document.getElementsByTagName("head")[0];styleNode.setAttribute("id","_hb_abtesting_page_hides");styleNode.setAttribute("type","text/css");if(styleNode.styleSheet){styleNode.styleSheet.cssText=style}else{styleNode.appendChild(document.createTextNode(style))}head.appendChild(styleNode)},transition:function(){var styleNode=document.createElement("style");var style="*{transition: opacity .3s linear; -moz-transition: opacity .3s linear; -webkit-transition: opacity .3s linear; -o-transition: opacity .3s linear;}";var head=document.getElementsByTagName("head")[0];styleNode.setAttribute("id","_hb_abtesting_transition_hides");styleNode.setAttribute("type","text/css");if(styleNode.styleSheet){styleNode.styleSheet.cssText=style}else{styleNode.appendChild(document.createTextNode(style))}head.appendChild(styleNode)},getShowPage:function(){return this.isshowPage},getDataLayer:function(){if(typeof dataLayer==="number"){return dataLayer}return 4000},init:function(){var settings_timer=setTimeout("DATrackerABTestingLeadCode.showPage()",this.getDataLayer());this.hidePage();this.transition();return settings_timer}};window["DATrackerABTestingLeadCode"]=abtestingLeadCode}})(document,window["DATrackerABTestingLeadCode"]||{},4000,window);DATrackerABTestingLeadCode.init();
```

影响说明： head部分加入该代码后，用户访问网页时，会隐藏body（隐藏页面内容），等待拉取完实验配置且替换了元素操作后，页面内容此时会渐变的显示出来。     
过渡动画说明：动画效果为css3实现，实现 `*{transition: opacity .3s linear; -moz-transition: opacity .3s linear; -webkit-transition: opacity .3s linear; -o-transition: opacity .3s linear;`。      
页面显示时间段说明： 正常情况下，拉取到实验配置且触发了实验后，就会立即显示页面。默认超时为4000ms，用户可自己在上面代码中配置超时时间。    

当sdk中配置的abtest功能关闭后，可移除该代码。

### 开启
abtest功能默认是关闭的。

启动：     
```js
    DATracker.init('xxxxx', {
        abtest: {
            enable_abtest: true
        },
        truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false 
    });
```

关闭：    
```js
    DATracker.init('xxxxx', {
        abtest: {
            enable_abtest: false
        },
        truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false 
    });
```
或者
```js
    DATracker.init('xxxxx',{truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
```

abtest功能启动后，每次进入页面就会根据缓存到期时间判断是否去更新配置信息，默认缓存时间60分钟。     
修改配置更新频率：    
```js
   DATracker.init('xxxx', {
       abtest: {
           enable_abtest: true,
           // 从服务端拉取配置频率改为 30分钟
           interval_mins_abtest: 30
       },
       truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
   });
```
interval_mins_abtest 字段表示 更新频率，单位分钟，默认60分钟。

预先设置变量：
```js
   DATracker.init('xxxx', {
       abtest: {
           enable_abtest: true,
           // 预先设置变量，btnColor，值为 'red'
           default_variables: {
             btnColor: 'red'
           }
       },
       truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
   });
```

### 获取变量 
```js
    // 首先调用 abtest.get_variation 方法
    DATracker.abtest.get_variation(function(flgs) {
        // 再调用 get 方法获取指定变量的值
        document.getElementById('ff').style.fontSize = flgs.get('textFont', '10px');
    });
```
当需要某个变量时，首先调用 `DATracker.abtest.get_variation` 方法，参数是一个回调函数。      
回调函数参数是abtest对象，比如命名为 `flgs` ，再调用 `flgs.get` 方法，获取变量值。     
其中 `get` 方法接受两个变量：变量名称 和 变量默认值。

### 重新从服务器端拉取配置
```js
    DATracker.abtest.async_get_variable();
```
每次进入页面，sdk会根据缓存到期时间判断是否需要更新配置。     
如果想立即更新配置，请调用该API。

### multilinkTimeOutMs 配置
每次触发abtest实验，为了数据统计都会触发abtest事件。当为多链接实验时，为了保证该abtest事件顺利发送，当跳转到目标页前，sdk会监听该事件是否发送成功。 
若超过指定时间内，仍未监听到结果，此时自动执行跳转。 指定该时间，通过配置 multilinkTimeOutMs 属性实现，默认300ms。
```js
   DATracker.init('xxxx', {
       abtest: {
           enable_abtest: true,
           // 单位毫秒
           multilinkTimeOutMs: 100
       },
       truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
   });
```

### 可视化实验

1. 动态元素实现优化      

可视化实验配置生效的原理：拉取配置后，根据配置找到页面上的元素，然后改变该元素的属性。但页面上有些元素是动态生成的，这段时间内元素不能在页面上查找到，此时实验配置就会失效。     
sdk内置的解决方案：首先给动态元素添加隐藏样式，同时添加监听，当动态元素出现在页面上时，触发实验配置，然后移除添加的隐藏样式。

2. 什么时候移除    

当A/B测试结束后，可移除。

## 其它重要配置功能

### is_single_page

设置成 true 后， 表示应用为单页面类型，默认 false。    
说明：只有业务方知道 当前应用是否为单页面应用，故默认不启动。    
支持单页面类型：hash, history   
使用如下:  

#### hash类型

启动后，默认自动监听hash变动
```js
 //启动单页面监听
 //启动后，默认自动监听hash变动 
 DATracker.init('88888', {
    is_single_page: true,
    truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
 });
```
或者
```js
 //启动单页面监听
 //启动后，默认自动监听hash变动 
 DATracker.init('88888', {
    is_single_page: true,
    single_page_config: {
        //注意：mode 一定要配置正确 
        mode: 'hash'
    },
    truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
 });
```
#### history类型

自动监听触发PV事件，调用 history.replaceState 方法默认不触发pv事件    
使用如下：    
```js
 //启动单页面监听
 //mode 配置设置成 'history'
 DATracker.init('88888', {
    is_single_page: true,
    single_page_config: {
        //注意：mode 一定要配置正确 
        mode: 'history'
    },
    truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
 });
 ```
 配置调用 history.replaceState 方法触发pv事件
 ```js
 //启动单页面监听
 //mode 配置设置成 'history'
 //启动监听调用 history.replaceState
 DATracker.init('88888', {
    is_single_page: true,
    single_page_config: {
        //注意：mode 一定要配置正确 
        mode: 'history',
        //启动监听调用， track_replace_state 字段设置为 true
        track_replace_state: true
    },
    truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
 });
 ```

### time_event()

统计事件触发耗时(ms)，参数为事件名称。触发一次后移除该事件的耗时监听。

```js
//统计clickBuy事件的触发耗时
DATracker.time_event('clickBuy');
document.getElementsByTagName('button')[0].onclick = function(e) {
DATracker.track("clickBuy");
}
```

### track_links()

场景--- 在追踪链接的点击、表单的提交等在当前窗口进行页面跳转的行为时，可能会出现数据发送不及时导致的数据丢失。
```js
//一般这种情况如下方式解决
$('#sidebar-left').on('click', 'a', function(e) {
    e.preventDefault();
    var title = $(this).find('.autocut').text();
    var hasCalled = false;
    var href = $(this).attr('href');
    function track_callback() {
        if(!hasCalled) {
            hasCalled = true;
            location.href = href;
        }
    }
    //如果没有回调成功，设置超时回调
    setTimeout(track_callback, 500);
    DATracker.track(title, {}, track_callback);
});
```    
我们就封装了这个方法，方便使用
```js
//使用
DATracker.track_links('a.two','testLink', {ff:'sss'})
```

### session_interval_mins(分钟)

一次Session的超时时间，默认30分钟。
```js
 //自定义超时20分钟设置
 DATracker.init('88888', {
    session_interval_mins: 20
 });
```

### loaded

当sdk初始化结束后，所有事件发送前，可配置该方法    
例子：设置pageview事件的自定义事件属性
```js
//sdk初始化结束，执行该方法
var beforeFn = function(datracker) {
    //datracker 为sdk实例对象
    //pageview_attributes, pageview事件的自定义事件属性
    datracker.pageview_attributes = {
        test: '12344'
    };
};
DATracker.init('8888',{ loaded: beforeFn,truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
```

### 数据上报方式配置

sdk默认是 ajax方式上报，同时也支持 img 方式上报

启动 img 方式上报
```js
DATracker.init('8888',{ img: true});
```

### pageview_attributes
当需要自定义pageview事件的事件属性时，将属性对象(Object)赋值给该key
```js
//sdk初始化结束，执行该方法
var beforeFn = function(datracker) {
    //datracker 为sdk实例对象
    //pageview_attributes, pageview事件的自定义事件属性
    datracker.pageview_attributes = {
        //自定义属性
        test: '12344'
    };
};
DATracker.init('8888',{ loaded: beforeFn, truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
```

### track_pageview(properties)
当有些时候需要手动触发PV时，调用该方法，其中参数是PV事件的自定义属性。      
若选择手动触发PV，请关闭自动触发PV，否则PV事件将触发多次。      
```js
DATracker.init('8888', {track_pageview: false, truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
DATracker.track_pageview({ProductId: '22'});
```

### 上报数据字段的长度设置 `truncateLength`
支持上报数据字段的长度设置，默认不限制长度。解决数据过长时(get方式)数据部分被丢弃情况。     
```js
DATracker.init('8888', {truncateLength: 255, persistence: "localStorage",cross_subdomain_cookie: false});
``` 

### 本地存储方式设置
1. cookie 方式     
当前sdk默认保存数据到cookie，且跨子域保存。    
场景：若产品二级域是 163.com 的，由于公司很多产品都是这个域名，此时应该关闭跨子域。
关闭跨子域保存
```js
DATracker.init('8888', {cross_subdomain_cookie: false});
```

2. localStorage 方式     
```js
DATracker.init('8888', {persistence: "localStorage"});
```

### 去除匿名用户     
当前Hubble用户分为：匿名用户和真实用户。     
当调用 login 的时候，切换成真实用户，但是在此之前触发的事件（内置事件和自定义事件）是匿名用户。     
下面是保证都是真实用户的方案(sdk需支持V1.6.0及以上)：    
```js
var loaded = function(datracker) {
    if (datracker.get_user_id() !== '我是白云飘飘') {
       datracker.login('我是白云飘飘');
    }
};
DATracker.init('8888', {loaded: loaded, truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
```

在 loaded 这个钩子函数回调中设置真实用户。

### 采集页面停留时长

默认是不开启的，开启在初始化时候添加。配置说明：

```js

DATracker.init('8888', {
    // 开启页面停留时长配置
    pagetime: {
        enable_pagetime: true,  // 设置为true，表示开始 
        el_duration_querySelector: ['#createManualBtn'] // 这里是采集页面指定元素的停留时长，数组的每个选项是css选择器，请保证每个选择器在当前页面是唯一的。
    }
});
```

另外：指定采集哪些需要采集停留时长的元素，可通过在元素上添加属性标记，如。

```html
<img src="https://img2.baidu.com/it/u=3747442668,2149842317&fm=253&fmt=auto&app=138&f=JPEG?w=620&h=407" data-hubble-el-divid="img1"/>
<img src="https://img2.baidu.com/it/u=3747442668,2149842317&fm=253&fmt=auto&app=138&f=JPEG?w=620&h=407" data-hubble-el-divid="img2"/>
```

上面img元素上添加了一个  `data-hubble-el-divid="img1"` 的标记，sdk会自动采集这个元素的停留时长。标记 `data-hubble-el-divid` 的值必须保证当前页面唯一。


pagetime 的所有可配置说明：

```js
pagetime: {
    enable_pagetime: false, // 默认不开启
    single_page: true, // 假如应用是单页面应用，切换路由时是否需要监听，默认监听
    intersectionRoot: null, // 要监听的元素父元素，更细粒度（解决监听某个页面中，某个滚动父元素里的子元素），默认是当前窗口
    root: null, // 元素停留时长，监听的元素所在的父元素。默认 body。注意：是针对当前页面所有元素的父元素。
    el_threshold_steps: 10, // 元素监听默认步骤，按照 10份 分割
    el_threshold: 0.1, // 元素曝光可视区域的范围阈值(0-1)，默认 0.1（即10%）IntersectionObserver，大于这个阈值表示进入可视区域，否则表示离开可视区域
    polling_ms: 3000, // 间隔发送数据时间
    el_duration_querySelector: [], // 手动设置要监听的元素选择器集合（注意，值在当前页面一定要唯一，若出现重复，会导致数据不准确）
    el_divid_mark: 'data-hubble-el-divid', // 元素标记，要监听的元素上的标记，给外部用户使用（注意，值在当前页面一定要唯一，若出现重复，会导致数据不准确）
    el_divid_mark_inner: 'data-hubble-el-divid_inner', // 元素标记，统一，框架内部使用
    el_repeat_listenering: false, // 是否需要重新监听事件，默认不需要。当调用 setConfig 方法时候，可设置
    request_animation_frame: true, // 默认使用 requestAnimationFrame api做定时器（页面激活状态下才触发上报）。false 使用 settimeout
    callback: function() {} // 上报成功后的回调方法
}
```


### debug

设置为true后，每次触发事件，可在浏览器控制台打印出数据。
```js
 //调试
 DATracker.init('88888', {
    debug: true,
    truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false
 });
```
DEBUG增强功能：    
当设置为ture后，当推送采集日志时可触发loaded方法，捕获发送的数据
```html
<style type="text/css">
    #prebox {
        width: 300px;
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 999;
        padding: 10px;
        background: #1E211F;
        color: #fff;
        border-radius: 6px;
        pointer-events: auto;
        -webkit-overflow-scrolling: touch;
    }
    #pre {
        height: 200px;
        overflow: auto;
        font-size: 14px;
    }
</style>
<div id="prebox">
    <div id="pre">
        <p>打印日志</p>
    </div>
</div>
<script>
//打印日志容器
//<div id="pre"><p>打印日志</p></div>
var $pre = document.getElementById('pre');
var isJSON = typeof window.JSON === 'object' ? true : false;
var beforeFn = function(datracker) {
    datracker.debug = function(sendData) {
        var b = new Base64();  
        var node=document.createElement("pre");
        if(isJSON) {
            node.innerHTML = JSON.stringify(JSON.parse(b.decode(sendData.data)), undefined, 2);
        }
        $pre.insertBefore(node, $pre.childNodes[0]);
    };
}

DATracker.init('MA-BC5F-EF6D2BEB5CF4-test',{debug: true,  loaded: beforeFn, truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
</script>
```
附：Base64
```js
function Base64() {
    
       // private property
       _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    
       // public method for encoding
       this.encode = function (input) {
           var output = "";
           var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
           var i = 0;
           input = _utf8_encode(input);
           while (i < input.length) {
               chr1 = input.charCodeAt(i++);
               chr2 = input.charCodeAt(i++);
               chr3 = input.charCodeAt(i++);
               enc1 = chr1 >> 2;
               enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
               enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
               enc4 = chr3 & 63;
               if (isNaN(chr2)) {
                   enc3 = enc4 = 64;
               } else if (isNaN(chr3)) {
                   enc4 = 64;
               }
               output = output +
               _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
               _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
           }
           return output;
       }
    
       // public method for decoding
       this.decode = function (input) {
           var output = "";
           var chr1, chr2, chr3;
           var enc1, enc2, enc3, enc4;
           var i = 0;
           input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
           while (i < input.length) {
               enc1 = _keyStr.indexOf(input.charAt(i++));
               enc2 = _keyStr.indexOf(input.charAt(i++));
               enc3 = _keyStr.indexOf(input.charAt(i++));
               enc4 = _keyStr.indexOf(input.charAt(i++));
               chr1 = (enc1 << 2) | (enc2 >> 4);
               chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
               chr3 = ((enc3 & 3) << 6) | enc4;
               output = output + String.fromCharCode(chr1);
               if (enc3 != 64) {
                   output = output + String.fromCharCode(chr2);
               }
               if (enc4 != 64) {
                   output = output + String.fromCharCode(chr3);
               }
           }
           output = _utf8_decode(output);
           return output;
       }
    
       // private method for UTF-8 encoding
       _utf8_encode = function (string) {
           string = string.replace(/\r\n/g,"\n");
           var utftext = "";
           for (var n = 0; n < string.length; n++) {
               var c = string.charCodeAt(n);
               if (c < 128) {
                   utftext += String.fromCharCode(c);
               } else if((c > 127) && (c < 2048)) {
                   utftext += String.fromCharCode((c >> 6) | 192);
                   utftext += String.fromCharCode((c & 63) | 128);
               } else {
                   utftext += String.fromCharCode((c >> 12) | 224);
                   utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                   utftext += String.fromCharCode((c & 63) | 128);
               }
    
           }
           return utftext;
       }
    
       // private method for UTF-8 decoding
       _utf8_decode = function (utftext) {
           var string = "";
           var i = 0;
           var c = c1 = c2 = 0;
           while ( i < utftext.length ) {
               c = utftext.charCodeAt(i);
               if (c < 128) {
                   string += String.fromCharCode(c);
                   i++;
               } else if((c > 191) && (c < 224)) {
                   c2 = utftext.charCodeAt(i+1);
                   string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                   i += 2;
               } else {
                   c2 = utftext.charCodeAt(i+1);
                   c3 = utftext.charCodeAt(i+2);
                   string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                   i += 3;
               }
           }
           return string;
       }
   }
```


## 示例

### 引入sdk

将sdk引导代码放入网页的`head`部分
```html
<!DOCTYPE html>
<html>
    <header>
        <meta charset="utf-8">
        <title>示例</title>
        <script type="text/javascript">
            (function(document,datracker,root){function loadJsSDK(){var script,first_script;script=document.createElement("script");script.type="text/javascript";script.async=true;script.src="https://hubble-js-bucket.nosdn.127.net/DATracker.globals.1.6.13.js";first_script=document.getElementsByTagName("script")[0];first_script.parentNode.insertBefore(script,first_script)}if(!datracker["__SV"]){var win=window;var gen_fn,functions,i,lib_name="DATracker";window[lib_name]=datracker;datracker["_i"]=[];datracker["init"]=function(token,config,name){var target=datracker;if(typeof(name)!=="undefined"){target=datracker[name]=[]}else{name=lib_name}target["people"]=target["people"]||[];target["abtest"]=target["abtest"]||[];target["toString"]=function(no_stub){var str=lib_name;if(name!==lib_name){str+="."+name}if(!no_stub){str+=" (stub)"}return str};target["people"]["toString"]=function(){return target.toString(1)+".people (stub)"};function _set_and_defer(target,fn){var split=fn.split(".");if(split.length==2){target=target[split[0]];fn=split[1]}target[fn]=function(){target.push([fn].concat(Array.prototype.slice.call(arguments,0)))}}functions="track_heatmap register_attributes register_attributes_once clear_attributes unregister_attributes current_attributes single_pageview disable time_event get_appStatus track set_userId track_pageview track_links track_forms register register_once alias unregister identify login logout signup name_tag set_config reset people.set people.set_once people.set_realname people.set_country people.set_province people.set_city people.set_age people.set_gender people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.set_populationWithAccount  people.set_location people.set_birthday people.set_region people.set_account abtest.get_variation abtest.async_get_variable".split(" ");for(i=0;i<functions.length;i++){_set_and_defer(target,functions[i])}datracker["_i"].push([token,config,name])};datracker["__SV"]=1.6;loadJsSDK()}})(document,window["DATracker"]||[],window);
            // 初始化
            // 注意： 在Hubble平台创建一个类型为`Web`应用，复制对应的appkey，替换下面的 `xxxxxx`
            DATracker.init('xxxxxx', {truncateLength: 255,persistence: "localStorage",cross_subdomain_cookie: false});
        </script>
    </header>
    <body>
        <button id="buy">点击购买</button>
    </body>
</html>        

```

### 触发事件上报

sdk初始化后，用户点击Button按钮，调用API上报自定义事件

```js

DATracker.track('ViewProduct');

```



