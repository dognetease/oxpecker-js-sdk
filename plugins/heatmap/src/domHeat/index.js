/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2019-01-03
 * @description: 利用伪元素实现的热力图
 */
import React from 'react';
import $ from 'jquery';
import echarts from '../../lib/echarts.simple.min';
import MathTool from '../util/mathTool';
import pathMap from '../../pathMap';

class DomHeat extends React.Component {
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
        let data = this.formatData(param);
        
        this.state.paths     = data.paths || [];

        this.state.series    = data.series || [];

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
                const lever = this.getLever(pathElelemt.clickPercent);
                try {
                    let pathBack = pathMap.toLongFunc(pathElelemt.path);
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
                            eleObj.attr('data-click',pathElelemt.clickPercent+'%');
                            if (positionStyle == 'absolute') {
                                eleObj.addClass('sa-click-area-position');
                            }
                        } else {
                            //如果在页面上能找到这个元素，则渲染它
                            eleObj.removeClass('sa-click-area');
                            eleObj.removeClass('sa-click-area'+lever);
                            eleObj.removeAttr('data-heat-place');
                            eleObj.removeAttr('data-click');
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
     * 过去点击数据
     */
    formatData(param) {
        //var start = new Date();
        //console.log('formatData开始 '+start.getHours()+':'+start.getMinutes()+':'+start.getSeconds());
        param.series = [];
        //给每个dom元素都加一个位置编号,要保证paths的元素和rows里的元素，同一个元素的编号相同
        for(let x=0; x<param.paths.length; x++){
            let totalItem    = param.paths[x];
            totalItem.place  = x;  //位置编号
            totalItem.detail = []; //将rows里的明细数据写进来
            totalItem.clickPercent = MathTool.formatNum(totalItem.clickNum*100/param.totalPV); //汇总的点击率
            for(let y=0; y<param.rows.length; y++){
        
                let dayItem = param.rows[y]; //一天的数据
                dayItem.paths = dayItem.paths || [];
        
                let hasData;
                for(let z=0; z<dayItem.paths.length; z++){
                    let domItem = dayItem.paths[z];  //每个dom的数据
                    domItem.clickPercent = MathTool.formatNum(domItem.clickNum*100/dayItem.pv);
                    if(domItem.path == totalItem.path){
                        hasData = domItem;
                    }
                }
        
                if(!hasData){
                //如果dom在这一天没有数据，则补0
                totalItem.detail.push({
                    clickNum: 0,
                    clickUserNum: 0,
                    clickPercent: 0,
                    path: totalItem.path
                });
                }else{
                    totalItem.detail.push(hasData);
                }
            }
        }
        for(let i=0; i<param.rows.length; i++){
            let row = param.rows[i];
            param.series.push(row.day.substr(5));
        }
        //var end = new Date();
        //console.log('formatData结束 '+end.getHours()+':'+end.getMinutes()+':'+end.getSeconds());
        return param;
    }
    /**
     * 为元素绑定data-click属性
     * 按点击率大小为元素添加样式
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
    
        let data = this.formatData(param);
        
        this.state.paths     = data.paths || [];

        this.state.series    = data.series || [];

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
            let lever = this.getLever(ele.clickPercent);
            try{
                let pathBack = pathMap.toLongFunc(ele.path);
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
                    eleObj.attr('data-click',ele.clickPercent+'%');
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
                let clickNum = dom.getAttribute('data-click');
                $(dom).wrap('<div class=\''+className+'\' data-heat-place='+place+' data-click='+clickNum+'></div>');
                dom.setAttribute('class', '');
                dom.setAttribute('data-heat-place', '');
                dom.setAttribute('data-click', '');
            }
        });
    }
    /**
     * 根据点击比获取热力值等级
     */
    getLever(value) {
        if(0<= value && value<1){
            return 1;
        }else if(1<= value && value<5){
            return 2;
        }else if(5<= value && value<10){
            return 3;
        }else if(10<= value && value<15){
            return 4;
        }else if(15<= value && value<50){
            return 5;
        }else if(50<= value){
            return 6;
        }
    }
    
    /**
     * 展示明细窗口
     * @param {*} e 
     * @param {*} div 
     * @param {*} isShow 
     */
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
    /**
     * hover时生成明细数据弹窗
     */
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
                    '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">当前内容：{{data_current_content}}</div>' +
                    '<div>点击次数: {{clickNum}}</div>' +
                    '<div>点击用户数: {{clickUserNum}}</div>' +
                    '<div>点击率: {{clickPercent}}%</div>' +
                    '<div style="height:1px; margin-top:13px; background: #444;"></div>' +
                '</div>';
        var newStr = '';
        var isShow = true;
        //明细窗口容器
        var container  = document.createElement('div');
        container.id = 'hb-heat-click-detail';
        if (this.isMobile()) {
            container.setAttribute('style','border-radius:4px;display:none;position: fixed; right:0px; background: #3B3D40;line-height:26px;font-size:14px;width:90%; margin:0 auto; height:422px;color: #fff;font-family: "MicrosoftYaHei", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;box-shadow: 0 2px 4px rgba(0,0,0,0.24);z-index:999999;top:50%;left:50%; transform:translateX(-50%) translateY(-50%);');
        } else {
            // container.setAttribute('style','border-radius:4px;display:none;position: fixed; right:0px; top:0; background: #3B3D40;line-height:26px;font-size:14px;width:400px;height:422px;color: #fff;font-family: "MicrosoftYaHei", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;box-shadow: 0 2px 4px rgba(0,0,0,0.24);z-index:999999;');
            container.setAttribute('style','border-radius:4px;display:none;position: fixed; right:0px; background: #3B3D40;line-height:26px;font-size:14px;width:400px;height:422px; height:422px;color: #fff;font-family: "MicrosoftYaHei", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;box-shadow: 0 2px 4px rgba(0,0,0,0.24);z-index:999999;top:15%;left:50%;');
        }


        document.body.appendChild(container);

        this.container = container;
    
        //左边的箭头
        //var arrow    = document.createElement('div');
        //arrow.setAttribute('style','position:absolute;left:-7px;top:10px;width:0px;height:0px;border-top:7px solid transparent;border-bottom:7px solid transparent;border-right:8px solid #3B3D40;');
        //container.appendChild(arrow);
    
        //点击信息容器
        var infoCont = document.createElement('div');
        container.appendChild(infoCont);
    
        //趋势图容器
        var chartCont = document.createElement('div');
        if (this.isMobile()) {
            chartCont.setAttribute('style','width:320px;height:310px;margin:0px 10px;');
        } else {
            chartCont.setAttribute('style','width:380px;height:310px;margin:0px 10px;');
        }
        
        container.appendChild(chartCont);
        //初始化曲线图
        me.chartObj    = echarts.init(chartCont);
    
        // $(container).mouseleave(function(){
        //     if(me.is_fix_state === 'notfix'){
        //         target_is_on_float = false;
        //         container.style.display = 'none';        
        //     }
        // });
    
        // $(container).mouseenter(function(){
        //     if(me.is_fix_state === 'notfix'){
        //         target_is_on_float = true;
        //     }
        // });
    
        $(container).on('animationend', function(){
            container.className = '';
        });

        $(container).on('click', '#hb-heatmap-mobile-domHeat-close', function() {
            container.style.display = 'none';
        });

    
        this.state.is_fix_state = 'notfix';
    
        // 绑定浮动层的显示
        var timeEle = 300;
    
        function showBoxDetailContent(e){
            mouseoverEvent = e;
            var target = e.target;
            var pos = target.getAttribute('data-heat-place');
            var data;
            for(let i=0; i<me.state.paths.length; i++){
                if(pos == me.state.paths[i].place){
                    data = me.state.paths[i];
                }
            }
            if(!data){
                return false;
            }
        
            var textContent = $.trim(target.textContent);
            if (textContent) {
                textContent = textContent.replace(/[\r\n]/g, ' ').replace(/[ ]+/g, ' ').substring(0, 255);
            }
        
            data.data_current_content = textContent || '没有值';
        
            newStr = str.replace(/\{\{[^\{\{]+\}\}/g,function(a){
                a = a.slice(2,-2);
                if(typeof a === 'string' && typeof data === 'object'){
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
                    me.renderChart(e);
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
                me.renderChart(e);
            });
        } else {
            $(document).mouseover(function(e){
                let { heatType } = me.props;
                var target = e.target;
                current_over = target;

                if(heatType==1 && $(target).hasClass('sa-click-area')){
                    showBoxDetail(e);
                    detailShow = true;
                } else if (heatType==1 && $(target).parents('.sa-click-area').length > 0){
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
    /**
     * 渲染dom点击率趋势图
     */
    renderChart(e) {
        var target = e.target;
        var pos = target.getAttribute('data-heat-place');
        var paths = this.state.paths;
        var domData = [];
        for(let i=0; i<paths.length; i++){
            if(paths[i].place == pos){
                domData = paths[i].detail;
            }
        }
    
        var clickNum = [];
        for(let i=0; i<domData.length; i++){
            clickNum.push(domData[i].clickNum);
        }
    
        var clickPercent = [];
        for(let i=0; i<domData.length; i++){
            clickPercent.push(domData[i].clickPercent);
        }
    
        var option = {
        grid: {
            bottom: 80
        },
        tooltip : {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            }
        },
        legend: {
            itemWidth: 9,
            itemHeight: 9,
            data:[{
            name: '点击次数',
            icon: 'circle',
            textStyle: {
                color: '#fff'
            }
            },{
                name:'点击率',
                icon: 'circle',
                textStyle: {
                color: '#fff'
            }
            }]
        },
        xAxis : {
                type : 'category',
                data : this.state.series,
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                    color: '#fff'
                    }
                }
        },
        yAxis: [
            {
                name: '点击次数(次)',
                type: 'value',
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                    color: '#fff'
                    }
                },
                splitLine: {
                    lineStyle: {
                    color: '#666'
                    }
                }
            },
            {
                name: '点击率(%)',
                type: 'value',
                
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                    color: '#fff'
                    }
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name:'点击次数',
                type:'bar',
                itemStyle: {
                    normal: {
                    color: '#4876D4'
                    }
                },
                barMaxWidth: 12,
                data: clickNum
            },
            {
                name:'点击率',
                type:'line',
                yAxisIndex:1,
                symbolSize: 9,
                itemStyle: {
                    color: '#FECF66'
                },
                lineStyle: {
                    normal: {
                        width: 2,
                        color: '#FECF66'
                    }
                },
                data: clickPercent
            }
        ]
        };
    
        this.chartObj.setOption(option);
    }
    /**
     * 显示点击率
     */
    showClickNum() {
        $('#HBSHOWCLICKSTYLE').remove();
    }
    /**
     * 隐藏点击率
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
    getData(hardRefresh) {
        const { param } = this.props;

        $.ajax({
          url: param.domURL,
          data: {
            hubble_heatmap_id: param.hubble_heatmap_id,
            current_url: param.current_url,
            useCache: hardRefresh ? false:true
          },
          success: (data) => {
            if (data.success) {
                let result = data.relatedObject;
                this.setData(result);
                this.props.onDataLoaded({
                    totalPV: result.totalPV,
                    totalUV: result.totalUV,
                })
                this.render();
            } else {
                this.props.onError(data.message);
                this.props.onDataLoaded({
                    totalPV: 0,
                    totalUV: 0,
                })
            }
          },
          error: (e) => {
            this.props.onError('系统繁忙，请稍后重试');
            this.props.onDataLoaded({
                totalPV: 0,
                totalUV: 0,
            })
          }
        })
    }
    render() {
        return (
          <div></div>
        )
    }
}

export default DomHeat;