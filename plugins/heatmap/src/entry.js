/* eslint-disable */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom'
import TopTool from './toptool/index';
import CanvasHeat from './canvasHeat/index';
import DomHeat from './domHeat/index';
import AttentionHeat from './attentionHeat/index';
import Loading from './util/loading';
import Message from './util/mssage';
import MobileControl from './mobileControl';

import './entry.less';

// window.testData = {
//   "totalPV":375,
//   "totalUV":2,
//   "setPaths":true,
//   "paths": [
//     {"clickNum":100,"clickUserNum":1,"path":".first",stat:".first,100,50","setClickNum":true,"setClickUserNum":true,"setPath":true},
//     {"clickNum":39,"clickUserNum":1,"path":"#222","setClickNum":true,"setClickUserNum":true,"setPath":true},
//     {"clickNum":9,"clickUserNum":2,"path":"#333","setClickNum":true,"setClickUserNum":true,"setPath":true},
//     {"clickNum":19,"clickUserNum":2,"path":"#444","setClickNum":true,"setClickUserNum":true,"setPath":true},
//     {"clickNum":58,"clickUserNum":2,"path":"#555","setClickNum":true,"setClickUserNum":true,"setPath":true},
//     {"clickNum":58,"clickUserNum":2,"path":"#666","setClickNum":true,"setClickUserNum":true,"setPath":true}
//   ],
//   "rows":[
//   {"day":"2018-04-15","pv":0,"uv":0,"paths":[{
//     clickNum:1,
//     clickUserNum:1,
//     path:".first",
//     setClickNum:true,
//     setClickUserNum:true,
//     setPath:true
//   }],"setPv":true,"setDay":true,"setUv":true,"pathsSize":0,"pathsIterator":null,"setPaths":false},
//   {"day":"2018-04-16","pv":12,"uv":2,"paths":[{
//     clickNum:5,
//     clickUserNum:5,
//     path:"#222",
//     setClickNum:true,
//     setClickUserNum:true,
//     setPath:true
//   }],"setPv":true,"setDay":true,"setUv":true,"pathsSize":0,"pathsIterator":[],"setPaths":true},
//   {"day":"2018-04-17","pv":0,"uv":0,"paths":[{
//     clickNum:8,
//     clickUserNum:8,
//     path:"#333",
//     setClickNum:true,
//     setClickUserNum:true,
//     setPath:true
//   }],"setPv":true,"setDay":true,"setUv":true,"pathsSize":0,"pathsIterator":null,"setPaths":false},
//   {"day":"2018-04-18","pv":0,"uv":0,"paths":[{
//     clickNum:3,
//     clickUserNum:3,
//     path:"#444",
//     setClickNum:true,
//     setClickUserNum:true,
//     setPath:true
//   }],"setPv":true,"setDay":true,"setUv":true,"pathsSize":0,"pathsIterator":null,"setPaths":false}]}

// for(var i=0; i<10000; i++) {
//   window.testData.paths.push({
//    "clickNum": parseInt(Math.random()*100),
//    "clickUserNum": parseInt(Math.random()*100),
//    "path":".first"+i,
//    "stat": ".first"+i+","+parseInt(Math.random()*150)+","+parseInt(Math.random()*100),
//    "setClickNum":true,
//    "setClickUserNum":true,
//    "setPath":true});
// }
// for(var i=0; i<10000; i++) {
//   window.testData.paths.push(window.testData.paths[5]);
// }

let isInIFrame = (window && window.parent && window.parent.window && (window !== window.parent.window)) ? true : false;
let queryId = sessionStorage.getItem('hubble_heatmap_id');
let param = {
  canvasURL: ( DATracker.get_config('heatmap_getdata_host') || 'https://hubble.netease.com' ) + '/hwi/heatmap/queryPosition',
  domURL: ( DATracker.get_config('heatmap_getdata_host') || 'https://hubble.netease.com' ) + '/hwi/heatmap/query',
  attentionUrl: ( DATracker.get_config('heatmap_getdata_host') || 'https://hubble.netease.com' ) + '/hwi/heatmap/queryAttention',
  hubble_heatmap_id: queryId,
  current_url: location.href.indexOf('hubble_heatmap_id') < 0 ? location.href : undefined
}

let hubbleheatmapRecord = localStorage.getItem('hubbleheatmapRecord');
try {
    hubbleheatmapRecord = JSON.parse(hubbleheatmapRecord); 
    if (hubbleheatmapRecord.selectType == '1') {
        dataList = [
            {
                value: '1',
                name: '交互热图'
            },
            {
                value: '2',
                name: '点击热图'
            },
            {
              value: '3',
              name: '注意力热图'
          }
        ];
    }
} catch (error) {
    hubbleheatmapRecord = '';
}

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: hubbleheatmapRecord.selectType == '1' ? 1 : 2,
      msg: '',
      // 点击热图查询状态
      canvasLoading: true,
      // 交互热图查询状态
      domLoading: true,
      // 注意力热图查询状态
      attentionLoading: true,
      static_host: DATracker.get_config('static_host') || DATracker.get_config('api_host'),
      param: param
    }
  }
  componentDidMount() {
    if (DATracker.config.is_single_page && 
        DATracker.config.single_page_config.mode === 'hash' &&
        location.href.indexOf('hubble_heatmap_id') > -1) {
      let url = location.href;
      url = url.replace(/\&hubble_heatmap_id=([a-zA-Z0-9]*)/g,'');
      url = url.replace(/\?hubble_heatmap_id=([a-zA-Z0-9]*)&/g,'');
      url = url.replace(/\?hubble_heatmap_id=([a-zA-Z0-9]*)/g,'');

      location.href = url;
    }
    this.canvasMap.hide();
    this.refresh();
    this.path = this.getPath();
    if (DATracker.config.is_single_page) {
      if(DATracker.config.single_page_config.mode === 'history') {
          if(!history.pushState || !window.addEventListener) return;
          this.on(history, 'pushState', DATracker._.bind(this.handleUrlChange, this) );
          this.on(history, 'replaceState', DATracker._.bind(this.handleUrlChange, this) );
          window.addEventListener('popstate', DATracker._.bind(this.handleUrlChange, this));
      } else if(DATracker.config.single_page_config.mode === 'hash') {
        DATracker._.register_hash_event( DATracker._.bind(this.handleUrlChange, this) );
      }
    }

    this.changeType(this.state.type);
  }
  urlChangeFn() {
    
    param.current_url = location.href.indexOf('hubble_heatmap_id') < 0 ? location.href : undefined;
    this.setState({
      param: param
    }, () => {
      this.refresh();
    });
  }
  handleUrlChange() {
    var self = this;
    setTimeout(function() {
        if(DATracker.config.single_page_config.mode === 'hash') {
          self.urlChangeFn();
        } else if( DATracker.config.single_page_config.mode === 'history' ) {
            var oldPath = self.path;
            var newPath = self.getPath();
            if(oldPath != newPath && self.shouldTrackUrlChange(newPath, oldPath)) {
                self.path = newPath;
                if(historyDidUpdate || self.config.track_replace_state) {
                  self.urlChangeFn();
                }
            }
        }
    }, 0);
  }
  shouldTrackUrlChange(newPath, oldPath) {
    return !!(newPath && oldPath);
  }
  getPath() {
    return location.pathname + location.search;
  }


  /**
   * 绑定事件
   * @param {*} obj 
   * @param {*} event 
   * @param {*} callFn 
   */
  on(obj, event, callFn) {
    if(obj[event]) {
        var fn = obj[event];
        obj[event] = function() {
            var args = Array.prototype.slice.call(arguments);
            callFn.apply(this, args);
            fn.apply(this, args);
        };
    } else {
        obj[event] = function() {
            var args = Array.prototype.slice.call(arguments);
            callFn.apply(this, args);
        };
    }
  }
  /**
   * 切换热力图类型
   * @param {*} type 
   */
  changeType(type) {
    this.setState({ type: type });
    if (type==1) {
      this.domMap.show();
      this.canvasMap.hide();
    } else 
    if (type ==2){
      this.canvasMap.show();
      this.domMap.hide();
    } else 
    if (type == 3) {
      this.attentionMap.show();
      this.canvasMap.hide();
      this.domMap.hide();
    }
  }
  /**
   * 显示/隐藏点击率
   * @param {*} e 
   */
  changeShowNum(e) {
    if (e == true) {
      // 显示
      this.domMap.showClickNum();
      this.attentionMap.showClickNum();
    } else {
      // 隐藏
      this.domMap.hideClickNum();
      this.attentionMap.hideClickNum();
    }
  }
  /**
   * 点击热图查询完毕
   * @param {*} e 
   */
  onCanvasLoaded(e) {
    this.topTool.setResult(e);
    this.setState({
      canvasLoading: false
    }, () => {
      this.emitLoadStatus();
    })
  }
  /**
   * 交互热图查询完毕
   * @param {*} e 
   */
  onDomLoaded(e) {
    this.topTool.setResult(e);
    this.setState({
      domLoading: false
    }, () => {
      this.emitLoadStatus();
    })
  }
  /**
   * 注意力热图查询完毕
   */
   onAttentionLoaded(e) {
    this.topTool.setResult(e);
    this.setState({
      attentionLoading: false
    }, () => {
      this.emitLoadStatus();
    })
   }
  /**
   * 当loading结束后，通知父窗口，解除父窗口强制刷新、查询连个按钮的loading状态
   */
  emitLoadStatus() {
    const { canvasLoading, domLoading, param, attentionLoading } = this.state;
    if (!canvasLoading && !domLoading && !attentionLoading) {
      // 两个热力图都查询完了才通知父窗口
      window.parent.window.postMessage({
        method: 'data_loaded',
        heatId: param.hubble_heatmap_id
      },'*'); 
    }
  }
  /**
   * 刷新数据
   * @param {*true表示强制刷新} flag 
   */
  refresh(flag) {
    this.setState({
      canvasLoading: true,
      domLoading: true,
      attentionLoading: true
    })
    this.canvasMap.getData(flag);
    this.domMap.getData(flag);
    this.attentionMap.getData(flag);
  }
  onError(msg) {
    this.setState({ msg: msg }, () => {
      setTimeout(() => {
        this.setState({ msg: '' });
      }, 5000);
    });
  }
  
  isMobile() {
    return "ontouchstart" in window;
  }

  render() {
    const { type, msg, canvasLoading, domLoading, attentionLoading, static_host, param } = this.state;
    return (
      <div style={{ position: "static!important" }}>
        <Message msg={ msg }/>
        {
          this.isMobile() ? 
          <MobileControl 
            ref={ root => this.topTool = root }
            static_host={ static_host }
            isInIFrame={ isInIFrame }
            onTypeChange={ e => this.changeType(e) } 
            onShowNumChange={ e => this.changeShowNum(e) } 
            onRefresh={ e => this.refresh(true) }
          /> 
          : 
          <TopTool
            ref={ root => this.topTool = root }
            static_host={ static_host }
            isInIFrame={ isInIFrame }
            onTypeChange={ e => this.changeType(e) } 
            onShowNumChange={ e => this.changeShowNum(e) } 
            onRefresh={ e => this.refresh(true) }
          />
        }

        <CanvasHeat
          heatType={ type }
          loading={ canvasLoading }
          ref={ root => this.canvasMap = root }
          param={ param }
          onDataLoaded={ e => this.onCanvasLoaded(e) }
          onError={ e => this.onError(e) }
        />
        <DomHeat
          heatType={ type }
          loading={ domLoading }
          ref={ root => this.domMap = root }
          param={ param }
          onDataLoaded={ e => this.onDomLoaded(e) }
          onError={ e => this.onError(e) }
        /> 
        <AttentionHeat
          heatType={ type }
          loading={ attentionLoading }
          ref={ root => this.attentionMap = root }
          param={ param }
          onDataLoaded={ e => this.onAttentionLoaded(e) }
          onError={ e => this.onError(e) }
        /> 
        {
          (canvasLoading || domLoading || attentionLoading) ? <Loading /> : null
        }
      </div>
    )
  }
}

let renderFunc = function() {
  let container = document.createElement('div');
  container.id = 'hb-heatmap-container';
  document.body.appendChild(container);
  ReactDOM.render(<Entry />, container);

  /**
   * 设置父窗口iframe的高度
   * @return {[type]} [description]
   */
  if (isInIFrame) {
    window.parent.window.postMessage({
      method: 'heatmap_init',
      heatId: queryId,
      height: $(document.body)[0].scrollHeight
    },'*'); 
  }
}

let heatConf = DATracker.get_config('heatmap') || {};
if (typeof heatConf.renderDelay === 'number') {
  setTimeout(() => {
    renderFunc()
  }, heatConf.renderDelay);
} else {
  renderFunc();
}


