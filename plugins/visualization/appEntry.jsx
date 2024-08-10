import React from 'react';
import ReactDOM from 'react-dom';
import MainTool from './appMainTool.jsx';
import TopTool from './appTopTool.jsx';
import Util from './util.jsx';
import 'antd/dist/antd.css';
import './appEntry.less';

const TYPE = 'APP';
const api_host = DATracker.get_config('visualization_editor_control_host') ? DATracker.get_config('visualization_editor_control_host') :  DATracker.get_config('api_host');
const static_host = DATracker.get_config('static_host') || DATracker.get_config('api_host');
getFont();

let topObj, mainObj;

function destroy() {
  try {
    let top  = document.getElementById('hubble-visual-top');
    let main = document.getElementById('hubble-visual-main');
    let style = document.getElementsByClassName('hubble-visual-style');
    let font = document.getElementsByClassName('hubble-visual-font');
    let head = document.getElementsByTagName('head')[0];
    if(top) {
      ReactDOM.unmountComponentAtNode(top);
      top.remove();
    }
    if(main) {
      ReactDOM.unmountComponentAtNode(main);
      main.remove();
    }
    if(style) {
      for (let k = 0; k < style.length; k += 1) {
        if (style[k] && style[k].remove) {
          head.removeChild(style[k]);
        }
      }
    }
    if(font) {
      for (let k = 0; k < font.length; k += 1) {
        if (font[k] && font[k].remove) {
          font[k].remove();
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * 页面各个组件初始化
 */
function init(testDetail, verDetail) {

  let topCnt  = document.createElement('div');
  let mainCnt = document.createElement('div');
  topCnt.id   = 'hubble-visual-top';
  mainCnt.id  = 'hubble-visual-main';
  mainCnt.className  = 'open';

  document.body.appendChild(mainCnt);
  document.body.appendChild(topCnt);
  // appChoiceElementable 表示是否选择了一个元素编辑，若为false，表示不能做编辑操作
  topObj  = ReactDOM.render(<TopTool editable={ !testDetail.status } appChoiceElementable={ false } type={TYPE} />, topCnt);
  mainObj = ReactDOM.render(<MainTool editable={ !testDetail.status } appChoiceElementable={ false } type={TYPE} />, mainCnt);
  console.log('编辑组件初始化',new Date());
  Util.installEvent(topObj);
  Util.installEvent(mainObj);

  topObj.setDetail(testDetail, verDetail);

  //退出编辑
  topObj.listen('out', function() {
    if (typeof appVisualizationSdk.goBack === 'function') {
      appVisualizationSdk.goBack();
    }
  })
  //回退
  topObj.listen('back', function() {
 
  })
  //前进
  topObj.listen('forward', function() {

  })
  // 保存
  topObj.listen('doSave', function(data, msg) {
    if (typeof appVisualizationSdk.save === 'function') {
      appVisualizationSdk.setData(data);
      appVisualizationSdk.save('doSave', msg);
    }
  });
  // 是否进入编辑监听
  topObj.listen('appEntryEditor', function(bool) {
    if (typeof appVisualizationSdk.setAppEntryEditor === 'function') {
      const callback = (appEntryEditor) => {
        topObj.setState({
          appEntryEditor: appEntryEditor
        });
        mainObj.setState({
          appEntryEditor: appEntryEditor
        });
      }
      appVisualizationSdk.setAppEntryEditor(callback);
    }
  });
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
      
    })
  })
  //参数变化时，触发UI变化
  mainObj.listen('onChange', function(param) {
    joinEdited();
    appVisualizationSdk.setData(param);
  })
  
  function joinEdited() {
    let curDom = mainObj.getParam();
    if(!!curDom.selector) {
      topObj.updateChche(curDom);
    }
  }
  
}

/**
 * 从hubble平台拉取字体样式
 */
function getFont() {

  var link  = document.createElement('link');
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.className='hubble-visual-font';
  link.href = static_host + '/analytics/dist/css/font/font.css?201801221057';

  document.head.appendChild(link);
}

window.appVisualizationSdk = {
  init: function(detail, verDetail) {
    init(detail, verDetail);
  },
  // 切换版本
  changeVersion: function(verDetail) {
    if (!verDetail) return ;
    const callback = () => {
      if (verDetail.verType === '原版本') {
        this.setAppCanEditor(false);
      } else {
        this.setAppCanEditor(true);
      }
      if (topObj) {
        topObj.changeVersion(verDetail);
      } else {
        setTimeout(() => {
          callback();
        }, 500);
      }
    };
    callback();
  },
  // 退出
  setGoBack: function(callback) {
    console.log('setGoBack', typeof callback, new Date());
    this.goBack = callback || function() {};
  },
  // 重置保存方法
  setSave: function(callback) {
    this.withoutSave = callback || function() {};
  },
  // 保存配置
  save: function(msgType, versionStr) {
    if (msgType !== 'doSave') {
      let bool = true;
      if (versionStr && versionStr !== 'version') {
        bool = false;
      }
      if (bool) {
        topObj.onSave(versionStr);
      }
    }
    if (versionStr === 'version') {
      return;
    }
    if (typeof this.withoutSave === 'function') {
      const callback = () => {
        topObj.restore();
        mainObj.restore();
        if (this.saveSuccessFn) {
          this.saveSuccessFn();
        }
      };
      this.setAppChoiceElementable(false);
      this.withoutSave(this.data, callback.bind(this));
    }
  },
  // 销毁
  appVisualizationSdkDestroy: destroy,
  setData: function(data,successFn) {
    this.data = data;
    if (typeof successFn === 'function') {
      this.saveSuccessFn = successFn;
    }
  },
  getData: function() {
    return this.data;
  },
  // 是否连接中状态设置
  setConnectable: function(connectable) {
    const callback = () => {
      if (topObj) {
        topObj.setState({connectable: connectable});
      } else {
        setTimeout(() => {
          callback();
        }, 500);
      }
    };
    callback();
  },
  // 是否进入编辑界面设置
  setAppEntryEditorFn: function(callback) {
    this.setAppEntryEditor = callback || function() {};
  },
  // 进入编辑后再使用该方法，若是原版本，不可编辑
  setAppCanEditor: function(appCanEditor) {
    if (topObj) {
      topObj.setState({appCanEditor: appCanEditor});
    }
    if (mainObj) {
      mainObj.setState({appCanEditor: appCanEditor});
    }
  },
  // 选择一个元素编辑
  choiceElement: function(choiceElementData) {
    mainObj.setParam(choiceElementData);
    this.setAppChoiceElementable(true);
  },
  setAppChoiceElementable: function(appChoiceElementable) {
    mainObj.setAppChoiceElementable(appChoiceElementable);
    topObj.setAppChoiceElementable(appChoiceElementable);
  },
  // app可视化配置map
  visualizationMap: {
      
  }
};


