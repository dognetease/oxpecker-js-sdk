/**
 * @description: 注意力热力图
 */
 import React from 'react';
 import $ from 'jquery';
 import MathTool from '../util/mathTool';
 
 class AttentionHeat extends React.Component {
     constructor(props) {
         super(props);
         this.state = {
             //当前页面的点击数据汇总
             paths: [],       
             //由于页面上一些dom节点是动态生成的，首次渲染热力图的时候，可能还没有这个节点
             //那么渲染热力图时，把页面上找不到的dom节点先缓存起来，通过循环渲染缓存的节点，直到缓存队列为空
             cachePaths: [],
             //事件循环的句柄
             loopLink: null,
             //时间范围
             series: [],
             is_fix_state: null,
             dataSource: null
         }
         this.container = '';
     }
     componentDidMount() {
        this.createDetailBox();
     }
     componentWillReceiveProps(nextProps) {
      if (this.props.heatType !== nextProps.heatType) {
        this.container.style.display = 'none';
      }
     }
     // 判断元素是否可在浏览器可视区域
     // partiallyVisible = true 表示元素只需要部分出现在可视区域（false: 需要整个元素都在可视区域内）
     inViewport(el, partiallyVisible) {
         const { top, left, bottom, right } = el.getBoundingClientRect();
         const { innerHeight, innerWidth } = window;
         return partiallyVisible
         ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
         ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
         : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
     }
     setData(param) {
         this.state.dataSource = param;
         if(!document.querySelectorAll ){
             alert('请更新到最新版浏览器,建议用chrome或者firefox');
             return false;
         }
         
         this.state.paths     = param.divs || [];
 
         this.state.series    = param.series || [];
 
         let timer;
         $(window).scroll(() => {
             if (timer) {
                 clearTimeout(timer);
             }
             timer = setTimeout(() => {
                 this.renderHeatPoint(this.state.paths);
             }, 200);
         });
         this.renderHeatPoint(this.state.paths);
     }
     renderHeatPoint(paths) {
         (paths || []).map(pathElelemt => {
             if (pathElelemt) {
                 const lever = this.getLever(pathElelemt.divtime);
                 try {
                     //let pathBack = pathMap.toLongFunc(pathElelemt.path);
                     let pathBack = pathElelemt.divid.split(',')[1]
                     let eleObj = $(pathBack);
                     if(eleObj.length > 0) {
                         if (['hb-heatmap-container', 'hb-heat-click-detail'].indexOf(eleObj[0].id) > -1) {
                             return;
                         }
                         if (eleObj.parents('#hb-heat-click-detail').length || eleObj.parents('#hb-heatmap-container').length) {
                             return;
                         }
                         // 若当前需渲染的元素自生定位是 absolute，那么就不能覆盖这个元素本身的定位属性
                         let positionStyle = eleObj[0].ownerDocument.defaultView.getComputedStyle(eleObj[0], null).getPropertyValue('position');
                         if (this.inViewport(eleObj[0], true)) {
                             //如果在页面上能找到这个元素，则渲染它
                             eleObj.addClass('sa-click-area');
                             eleObj.addClass('sa-click-area'+lever);
                             eleObj.attr('data-heat-place', pathElelemt.place);
                             eleObj.attr('data-click',pathElelemt.divtime);
                             eleObj.attr('data-ratio', pathElelemt.ratio);
                             if (positionStyle == 'absolute') {
                                 eleObj.addClass('sa-click-area-position');
                             }
                         } else {
                             //如果在页面上能找到这个元素，则渲染它
                             eleObj.removeClass('sa-click-area');
                             eleObj.removeClass('sa-click-area'+lever);
                             eleObj.removeAttr('data-heat-place');
                             eleObj.removeAttr('data-click');
                             eleObj.removeAttr('data-ratio');
                             if (positionStyle == 'absolute') {
                                 eleObj.removeClass('sa-click-area-position');
                             }
                         }
                     }
                 } catch (error) {
                     
                 }
             }
         });
     }
     isMobile() {
         return "ontouchstart" in window;
     }

     /**
      * 为元素绑定data-click属性
      * 按停留时长为元素添加样式
      */
     setData2(param) {
         this.state.dataSource = param;
         if(!document.querySelectorAll ){
             alert('请更新到最新版浏览器,建议用chrome或者firefox');
             return false;
         }
         this.state.cachePaths = [];
         //清除循环
         if(this.state.loopLink) {
             clearInterval(this.state.loopLink);
         }
    
         
         this.state.paths     = param.divs || [];
 
         this.state.series    = param.series || [];
 
         let purNumber = 500; // 1秒钟需要渲染的元素个数
         let times = Math.ceil(this.state.paths.length / purNumber); //如果一次渲染 purNumber 个节点，需要渲染多少次
         for(let i=0; i<times; i++) {
             setTimeout(() => {
                 //现在用1秒钟渲染 purNumber 个节点
                 let list = this.state.paths.slice(i*purNumber, (i+1)*purNumber);
                 this.state.cachePaths = this.state.cachePaths.concat(this.renderHeatPoint(list));
             }, i*1000);
         }
         setTimeout(() => {
             //等初次渲染完了，再循环渲染剩下的节点
             this.renderLoop();
         }, times*1000);
 
         //var end = new Date();
         //console.log('查找节点结束 '+end.getHours()+':'+end.getMinutes()+':'+end.getSeconds());
     }
     /**
      * 根据元素路径，绘制热力图，将没有找到的节点return出来
      * @param {*} paths 
      */
     renderHeatPoint2(paths) {
         let cacheList = [];
         paths = paths || [];
         for(let i=0; i<paths.length; i++){
             let ele = paths[i];
             if (!ele) {
                 continue;
             }
             let lever = this.getLever(ele.divtime);
             try{
                 // let pathBack = pathMap.toLongFunc(ele.path);
                 let pathBack = pathElelemt.divid.split(',')[1]
                 let eleObj = $(pathBack);
                 if(eleObj.length > 0) {
                     if (['hb-heatmap-container', 'hb-heat-click-detail'].indexOf(eleObj[0].id) > -1) {
                         return;
                     }
                     if (eleObj.parents('#hb-heat-click-detail').length || eleObj.parents('#hb-heatmap-container').length) {
                         return;
                     }
                     // 若当前需渲染的元素自生定位是 absolute，那么就不能覆盖这个元素本身的定位属性
                     let positionStyle = eleObj[0].ownerDocument.defaultView.getComputedStyle(eleObj[0], null).getPropertyValue('position');
                     //如果在页面上能找到这个元素，则渲染它
                     eleObj.addClass('sa-click-area');
                     eleObj.addClass('sa-click-area'+lever);
                     eleObj.attr('data-heat-place', ele.place);
                     eleObj.attr('data-click',ele.divtime);
                     eleObj.attr('data-ratio', ele.ratio);
                     if (positionStyle == 'absolute') {
                         eleObj.addClass('sa-click-area-position');
                     }
                 } else {
                     //如果找不到，说明还没生成或者其他原因，先把它缓存起来
                     if (ele.path !== '') {
                         cacheList.push(ele);
                     }
                 }
             }catch(e){
         
             }
         }
         return cacheList;
     }
     /**
      * 将还没有渲染出来的数据，循环渲染出来
      */
     renderLoop() {
         console.log(this.state.cachePaths, this.state.cachePaths.length);
         if(this.state.cachePaths.length == 0) {
           //如果全都渲染了，清除循环
           if(this.state.loopLink) clearInterval(this.state.loopLink);
           //this.img();
           return;
         }
         this.state.loopLink = setInterval( () => {
           this.state.cachePaths = this.renderHeatPoint(this.state.cachePaths);
         }, 1000);
     }
     img() {
         let domArr = $('.sa-click-area');
         domArr.each((index, dom) => { 
             if (dom.tagName.toLowerCase() == 'img') {
                 let className = dom.getAttribute('class');
                 let place = dom.getAttribute('data-heat-place');
                 let divtime = dom.getAttribute('data-click');
                 let ratio = dom.getAttribute('data-ratio');
                 $(dom).wrap('<div class=\''+className+'\' data-heat-place='+place+' data-click='+divtime+' data-ratio='+ratio +'></div>');
                 dom.setAttribute('class', '');
                 dom.setAttribute('data-heat-place', '');
                 dom.setAttribute('data-click', '');
                 dom.setAttribute('data-ratio', '');
             }
         });
     }
     /**
      * 根据点击比获取热力值等级
      */
     getLever(value) {
       const time = value/1000
         if(0<= time && time<1){
             return 1;
         }else if(1<= time && time<5){
             return 2;
         }else if(5<= time && time<10){
             return 3;
         }else if(10<= time && time<15){
             return 4;
         }else if(15<= time && time<50){
             return 5;
         }else if(50<= time){
             return 6;
         }
     }
    

     /**
      * 显示点击率
      */
     showClickNum() {
         $('#HBSHOWCLICKSTYLE').remove();
     }
     /**
      * 隐藏次均停留时长
      */
     hideClickNum() {
         if ($('#HBSHOWCLICKSTYLE').length==0) {
             let addStyle = $('<style id="HBSHOWCLICKSTYLE" type="text/css">.sa-click-area:after{content:""}</style>')
             addStyle.appendTo(document.head);
         }
     }
     /**
      * 显示色块
      */
     showBGColor() {
         $('#HBSHOWBGColor').remove();
     }
     /**
      * 隐藏热快
      */
     hideGBColor() {
         if ($('#HBSHOWBGColor').length==0) {
             let addStyle = $('<style id="HBSHOWBGColor" type="text/css">input.sa-click-area{background: #fff!important;}.sa-click-area:before{background: none!important;}</style>')
             addStyle.appendTo(document.head);
         }
     }
     show() {
         this.showClickNum();
         this.showBGColor();
     }
     hide() {
         this.hideClickNum();
         this.hideGBColor();
     }
    
     timeFormate(time) {
       let str = time;
       // 小于1s
       if (time < 1000) {
         str = time + ' 毫秒'
       } else 
       // 小于1分钟
       if (time >= 1000 && time < 1000 * 60) {
         str = (+(Math.round(time/(1000) + "e2")  + "e-2")).toFixed(0) + ' 秒'
       } else 
       // 小于1小时
       if (time >= 1000 * 60 && time < 1000 * 60 * 60 ) {
        str = (+(Math.round(time/(1000 * 60) + "e2")  + "e-2")).toFixed(0) + ' 分'
       } else {
        str = (+(Math.round(time/(1000 * 60 * 60) + "e2")  + "e-2")).toFixed(0) + ' 小时'
       }
       return str;
     }

     getData(hardRefresh) {
         const { param } = this.props;
 
         $.ajax({
           url: param.attentionUrl,
           data: {
             hubble_heatmap_id: param.hubble_heatmap_id,
             current_url: param.current_url,
             useCache: hardRefresh ? false:true
           },
           success: (data) => {
             if (data.success) {
                 let result = data.relatedObject;
                 (result.divs || []).forEach(item => {
                   item.divtime = this.timeFormate(item.divtime);
                   item.ratio = item.ratio * 100 + '%';
                 })
                 this.setData(result);
                 this.props.onDataLoaded({
                  pagetime: this.timeFormate(result.pagetime)
                 });
                 this.render();
             } else {
                 this.props.onError(data.message);
                 this.props.onDataLoaded({
                  pagetime: 0
                 })
             }
           },
           error: (e) => {
             this.props.onError('系统繁忙，请稍后重试');
             this.props.onDataLoaded({
              pagetime: 0
             })
           }
         })
     }

     createDetailBox() {
        var me = this;
        // 浮动层的内容的初始化
        var mouseoverEvent = null;
        var target_is_on_float = false;
    
        var closeStr = '';
        //if (this.isMobile()) {
            closeStr = '<span style="color:#fff; text-align: right;display: block; cursor:pointer;" id="hb-heatmap-mobile-domHeat-close">X</span>';
        //}
        var str = '<div style="padding: 13px 16px; z-index: 9999;">' +
                    closeStr +
                    // '<div style="margin-bottom: 10px;">次均停留时长: {{divtime}}</div>' +
                    '<div style="margin-bottom: 10px;">区域停留时长/页面停留时长比值：{{ratio}}</div>' +
                    '<div style="height:1px; margin-top:13px; background: #444;"></div>' +
                '</div>';
      
        var isShow = true;
        //明细窗口容器
        var container  = document.createElement('div');
        container.id = 'hb-heat-click-detail';
        if (this.isMobile()) {
            container.setAttribute('style','border-radius:4px;display:none;position: fixed; right:0px; background: #3B3D40;line-height:26px;font-size:14px;width:90%; margin:0 auto; height:120px;color: #fff;font-family: "MicrosoftYaHei", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;box-shadow: 0 2px 4px rgba(0,0,0,0.24);z-index:999999;top:50%;left:50%; transform:translateX(-50%) translateY(-50%);');
        } else {
            container.setAttribute('style','border-radius:4px;display:none;position: fixed; right:0px; background: #3B3D40;line-height:26px;font-size:14px;width:200px;height:120px;color: #fff;font-family: "MicrosoftYaHei", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;box-shadow: 0 2px 4px rgba(0,0,0,0.24);z-index:999999;top:15%;left:50%;');
        }


        document.body.appendChild(container);

        this.container = container;
    
        //点击信息容器
        var infoCont = document.createElement('div');
        container.appendChild(infoCont);

    
        $(container).on('animationend', function(){
            container.className = '';
        });

        $(container).on('click', '#hb-heatmap-mobile-domHeat-close', function() {
            container.style.display = 'none';
        });

    
        this.state.is_fix_state = 'notfix';
    
        // 绑定浮动层的显示
        var timeEle = 100;
    
        function showBoxDetailContent(e){
            mouseoverEvent = e;
            var target = e.target;
            var time = target.getAttribute('data-click');
            var ratio = target.getAttribute('data-ratio');
            const data = {
              divtime: time,
              ratio: ratio
            }
            newStr = str.replace(/\{\{[^\{\{]+\}\}/g,function(a){
              a = a.slice(2,-2);
              if(typeof a === 'string'){
                return data[a];
              }
            });
            infoCont.innerHTML = newStr;
            me.showDetailBox(e,container,isShow);
        }
        function showBoxDetail(e){
            var target = e.target;
            setTimeout(function(){
                if(target === current_over){
                    showBoxDetailContent(e);
                }
            },timeEle);
        }
    
        var current_over = null;
        
        if (this.isMobile()) {
            $(document).on('click', function(e) {
                var target = e.target;
                var className = target.className;
                current_over = target;
                if(typeof className !== 'string' || (' ' + className + ' ').indexOf(' sa-click-area ') === -1){
                  return false;
                } 
                showBoxDetailContent(e);
            });
        } else {
            $(document).mouseover(function(e){
                let { heatType } = me.props;
                var target = e.target;
                current_over = target;

                if(heatType==3 && $(target).hasClass('sa-click-area')){
                    showBoxDetail(e);
                    detailShow = true;
                } else if (heatType==3 && $(target).parents('.sa-click-area').length > 0){
                    var parent = $(target).parents('.sa-click-area')[0];
                    current_over = parent;
                    target = parent;
                    detailShow = true;
                    showBoxDetail({target: target});
                } else if ($(target).parents('#hb-heat-click-detail').length > 0) {
                    // over到明细窗口的画，不做处理
                } else {
                    container.style.display = 'none';
                }
            });
        }
     }

     showDetailBox(e,container,isShow) {
        if(this.state.is_fix_state === 'fixslidedown'){
      
          container.style.position = 'fixed';
          container.style.left = 'auto';
          container.style.right = 0;
          container.style.top = 0;
          
          if(isShow){
              container.className = 'sa-heat-box-effect-2017314';
          }
      
        } else if(this.state.is_fix_state === 'notfix'){
        
            var width = MathTool.getBrowserWidth();
        
            var target = e.target;
            var offset = $(target).offset();
            var domWid = $(target)[0].offsetWidth;
            var x = offset.left + domWid + 7;
            var y = offset.top+1;
        
            if(width < (x + 400)){
                //如果右边距离不够放左边
                x = offset.left - 400-7;
                if(offset.left < 400){
                    //如果左边距离还不够，就放屏幕正中间
                    x = (width-400)/2;
                }
            }
            

            if (!this.isMobile()) {
                container.style.position = 'absolute';
                container.style.left = x + 'px';
                container.style.top = y + 'px';
            }
        }

        if(container.style.display !== 'block'){
            container.style.display = 'block';
        }
     }

     render() {
         return (
           <div></div>
         )
     }
 }
 
 export default AttentionHeat;