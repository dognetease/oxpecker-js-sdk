import React from 'react';
import Collapse from 'antd/lib/collapse';
import Message from 'antd/lib/message';
import Text from './components/app/text.jsx';
import Background from './components/app/background.jsx';
import Border from './components/app/border.jsx';
import Placeholder from './components/placeholder.jsx';
import Target from './components/target.jsx';
import Util from './util.jsx';

import 'antd/lib/collapse/style';
import 'antd/lib/message/style';

class MainTool extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          initParam: {}, //保存点击元素时的初始状态，用于回退
          param: {},
          isOpen: true,
          appEntryEditor: false, // 是否进入编辑界面（APP 可视化所需字段）
          appCanEditor: false,  // 是否能编辑（APP 可视化所需字段，进入编辑后再使用该字段，若是原版本，不可编辑）
          appChoiceElementable: false // app可视化配置：表示是否选择了一个元素编辑，若为false，表示不能做编辑操作
      }
  }
  componentDidMount() {
    let { editable } = this.props;
    
    if(!editable) {
        Message.warning('已开始或结束的实验，不能进行编辑操作');
    }
    
  }
  setParam(param) {
    const { type } = this.props;
    const { appEntryEditor, appCanEditor } = this.state;
    let bool = true;
    if (type === 'APP') {
        if (!appEntryEditor) {
            bool = false;
        } else if (!appCanEditor) {
            bool = false;
        }
    }
    this.state.initParam = JSON.parse(JSON.stringify(param));
    this.state.param = JSON.parse(JSON.stringify(param));
    this.setState({ param: param });
    if (bool) {
        this.refs.text.setParam(param);
    }
  }
  getParam() {
      let initData  = JSON.parse(JSON.stringify(this.state.initParam));
      let afterData = JSON.parse(JSON.stringify(this.state.param));
      return {
        selector: initData.selector,
        initData: initData,
        afterData: afterData
      }
  }
  // 当未选择元素时，不能编辑，此时 appChoiceElementable = false 。反之 appChoiceElementable = true
  setAppChoiceElementable(appChoiceElementable) {
      this.setState({
        appChoiceElementable: appChoiceElementable
      });
  }
  onChange(type, param) {
    if(!this.state.param.selector || !this.state.appChoiceElementable) {
        //没选中元素时，不触发
        return;
    }
    Object.assign(this.state.param[type], param);
    
    this.trigger('onChange',this.state.param);
  }
  showChange(flag) {
    if(this.state.isOpen == flag) {
        return;
    }
    let mainObj = document.getElementById('hubble-visual-main');
    mainObj.style.overflow = 'hidden';
    if(flag) {
      //显示
      mainObj.style.width = '314px';

      mainObj.style.background = '#fff';
      mainObj.style.boxShadow = '0px 0px 8px rgba(0,0,0,0.2)';
      this.setState({ isOpen: flag });
      setTimeout(() => {
        mainObj.style.overflow = 'visible';
      }, 500);
    }else{
      //隐藏
      mainObj.style.width = '56px';
      
      setTimeout(() => {
        mainObj.style.background = 'transparent';
        mainObj.style.boxShadow = 'none';
        mainObj.style.overflow = 'visible';
        //等0.5s动画结束后
        this.setState({ isOpen: flag });
      }, 500);
    }
  }
  restore() {
    this.refs.text.restore();
    this.setState({
        param: {}
    });
  }
  render() {
    let { editable, type } = this.props;
    let { isOpen,  appEntryEditor, appCanEditor, appChoiceElementable } = this.state;
    let template = (
        <div>
            <div className={ "open-btn " + (isOpen? "hide":"") } onClick={ e => this.showChange(true) }>
                <i className="demo-icon icon-be-large"></i>
            </div>
            <div className={ "head " + (isOpen? "":"hide") } ref="head">
                <span className="verti-line">||||||</span>
                {/* <div className="close-btn" onClick={ e => this.showChange(false) }>
                    <i className="demo-icon icon-be-small"></i>
                </div> */}
            </div>
            <Collapse className={ isOpen? "":"hide" } bordered={false} defaultActiveKey={['text','background','border']}>
                <Collapse.Panel header="文本" key="text">
                    <Text ref="text" onChange={ (e,p) => this.onChange(e,p) }></Text>
                    {
                        (!editable || !appChoiceElementable)? <div className="main-mask"></div> : null
                    }
                </Collapse.Panel>
            </Collapse>
        </div>
    );
    if (type === 'APP') {
        if (!appEntryEditor) {
            template = '';
        } else if (!appCanEditor) {
            template = '';
        }
    }
    return (
        <div>
            {template}
        </div>
    )
  }
}

export default MainTool;