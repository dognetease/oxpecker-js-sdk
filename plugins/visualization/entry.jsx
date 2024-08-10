import React from 'react';
import ReactDOM from 'react-dom';
import MainTool from './mainTool.jsx';
import TopTool from './topTool.jsx';
import Util from './util.jsx';

import './entry.less';

import ChoiceElement from './choiceElement';
const api_host = DATracker.get_config('visualization_editor_control_host') ? DATracker.get_config('visualization_editor_control_host') :  DATracker.get_config('api_host');
const static_host = DATracker.get_config('static_host') || DATracker.get_config('api_host');
getFont();

/**
 * 页面各个组件初始化
 */
function init(testDetail, verDetail) {
  ChoiceElement.init();

  let topCnt  = document.createElement('div');
  let mainCnt = document.createElement('div');
  topCnt.id   = 'hubble-visual-top';
  mainCnt.id  = 'hubble-visual-main';
  mainCnt.className  = 'open';

  document.body.appendChild(mainCnt);
  document.body.appendChild(topCnt);

  let topObj  = ReactDOM.render(<TopTool editable={ !testDetail.status }/>, topCnt);
  let mainObj = ReactDOM.render(<MainTool editable={ !testDetail.status }/>, mainCnt);

  Util.installEvent(topObj);
  Util.installEvent(mainObj);

  topObj.setDetail(testDetail, verDetail);
      
  //退出编辑
  topObj.listen('out', function() {

  })
  //回退
  topObj.listen('back', function() {
 
  })
  //前进
  topObj.listen('forward', function() {

  })
  /**
   * flag: -1代表回退，渲染的是initData；+1代表前进，渲染的是afterData
   * 例如当前保存了三步，点击回退到第二步，实际上我们要回到的是第三步编辑的初始状态，也就是第三步数据的initData
   * 注意，第三步的initData并不等于第二步的afterData
   */
  topObj.listen('setCurrParam', function(param) {

    //如果前进的话，定位到最后一个操作的元素
    let lastData = param[param.length-1];
    //渲染结束状态
    mainObj.setParam(lastData);
    
    param.map( e => {
      ChoiceElement.setElementAttributes(e);
    })
  })
  //参数变化时，触发UI变化
  mainObj.listen('onChange', function(param) {
    joinEdited();
    //将改变的配置渲染到页面上
    ChoiceElement.setElementAttributes(param);
  });
  // 执行还原操作
  mainObj.listen('onReset', function(param) {
    joinEdited(true);
    //将改变的配置渲染到页面上
    ChoiceElement.setElementAttributes(param);
  })
  //选择元素
  ChoiceElement.listen('selected', function(next) {
    mainObj.setParam(next);
  })
  
  function joinEdited(isReset) {
    let curDom = mainObj.getParam(); 
    if(!!curDom.selector) {
      topObj.updateChche(curDom, isReset);
    }
  }
  let varValue = verDetail.varValue || {};
  let varList  = varValue.variations || [];
  ChoiceElement.setElementArrAttributes(varList);
}
/**
 * 从hubble平台拉取字体样式
 */
function getFont() {

  var link  = document.createElement('link');
  link.rel  = 'stylesheet';
  link.type = 'text/css'; 
  link.href = static_host + '/analytics/dist/css/font/font.css?201801221057';

  document.head.appendChild(link);
}
//获取实验详情
function getTestDetail() {
  let productId = location.href.match(/productId=([^&#]+)/)[1] || '';
  let testId    = location.href.match(/testId=([^&#]+)/)[1] || '';
  let versionId = location.href.match(/versionId=([^&#]+)/)[1] || '';
  let url = api_host +'/abi/abtest/get';
  //let url = 'http://dev.hubble.netease.com/abi/abtest/get';
  url += '?productId=' + productId;
  url += '&id=' + testId;
  Util._.get(url, function(data) {
    if(data.success) {
      let detail = data.relatedObject;
      
      let verList = detail.versionList;
      let verDetail = verList.find( e => {
        return e.id == versionId;
      })
      verDetail = verDetail || {};
      
      //获取实验详情之后再执行初始化
      init(detail, verDetail);
    }
  })
}

getTestDetail();