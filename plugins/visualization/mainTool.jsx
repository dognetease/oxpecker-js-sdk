import React from 'react';
import Collapse from 'antd/lib/collapse';
import Message from 'antd/lib/message';
import Size from './components/size.jsx';
import Imagg from './components/image.jsx';
import Text from './components/text.jsx';
import Background from './components/background.jsx';
import Border from './components/border.jsx';
import Placeholder from './components/placeholder.jsx';
import Target from './components/target.jsx';
import Util from './util.jsx';
import ChoiceElement from './choiceElement';

import 'antd/lib/collapse/style';
import 'antd/lib/message/style';

class MainTool extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        isActive: false,  // 当选中一个元素后激活
        initParam: {}, //保存点击元素时的初始状态，用于回退
        param: {},
        isOpen: true
      }
  }
  componentDidMount() {
    let { editable } = this.props;
    if (this.refs.head) {
        Util.startDrag(this.refs.head, 'hubble-visual-main');
        Util.startDrag(this.refs.beLarge, 'hubble-visual-main');
    }
    
    if(!editable) {
        Message.warning('已开始或结束的实验，不能进行编辑操作');
    }
  }
  setParam(param) {
    this.showChange(true);
    this.state.initParam = JSON.parse(JSON.stringify(param));
    this.state.param = JSON.parse(JSON.stringify(param));
    this.setState({ param: param, isActive: true }, () => {
        this.refs.size.setParam(param.css);
        this.refs.border.setParam(param.css);
        if(this.refs.background) {
            this.refs.background.setParam(param.css);
        }
        if(this.refs.text) {
            this.refs.text.setParam(param);
        }
        if(this.refs.imagg) {
            this.refs.imagg.setParam(param.attributes);
        }
        if(this.refs.placeholder) {
            this.refs.placeholder.setParam(param.attributes);
        }
        if(this.refs.target) {
            this.refs.target.setParam(param.attributes);
        }
    });
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
  /**
   * 还原一个元素原始的属性
   * @param {*需要还原的组件} type 
   */
  setInitParam(type) {
    const { param } = this.state;
    if(!param.selector) {
        //没选中元素时，不触发
        return;
    }
    let initParam = ChoiceElement.getElementOriginalAttributes(param.selector);
    let oo;
    switch(type) {
        case 'size':
        case 'border':
        case 'background':
        // 这几个控件设置的是css
            oo = this.refs[type].setParam(initParam.css);
            oo.isReset = true;
            this.onChange('css', oo);
            break;
        case 'imagg':
        case 'placeholder':
        case 'target':
        // 这几个控件设置的是attributes
            oo = this.refs[type].setParam(initParam.attributes);
            oo.isReset = true;
            this.onChange('attributes', oo);
            break;
        case 'text':
        // 这几个控件两者都有
            oo = this.refs[type].setParam(initParam);
            oo.isReset = true;
            this.onChange('top', { 'innerText': oo.innerText });
            this.onChange('css', oo.css);
            break;
        default:
            return;
    }
  }
  onChange(type, param) {
    if(!this.state.param.selector) {
        //没选中元素时，不触发
        return;
    }
    let isReset = param.isReset;
    delete param.isReset;

    if(type == 'top') {
        Object.assign(this.state.param, param);
    } else {
        Object.assign(this.state.param[type], param);
    }
    if (isReset) {
        this.trigger('onReset',this.state.param);
    } else {
        this.trigger('onChange',this.state.param);
    }
  }
  showChange(flag) {
    if(this.state.isOpen == flag || window.isDraging) {
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
      }, 300);
    }else{
      //隐藏
      mainObj.style.width = '56px';
      
      setTimeout(() => {
        mainObj.style.background = 'transparent';
        mainObj.style.boxShadow = 'none';
        mainObj.style.overflow = 'visible';
        //等0.3s动画结束后
        this.setState({ isOpen: flag });
      }, 300);
    }
  }
  render() {
    let { editable } = this.props;
    let { isActive, isOpen, param } = this.state;
    let css  = param.css || {};
    let attr = param.attributes || {};
    let template = (
        <div>
            <div className={ "open-btn " + (isOpen? "hide":"") } ref="beLarge" onClick={ e => this.showChange(true) }>
                <i className="demo-icon icon-be-large"></i>
            </div>
            <div className={ "head " + (isOpen? "":"hide") } ref="head">
                <span className="verti-line">条件配置</span>
                <div className="close-btn" onClick={ e => this.showChange(false) }>
                    <i className="demo-icon icon-be-small"></i>
                </div>
            </div>
            <Collapse className={ isOpen? "":"hide" } bordered={false} defaultActiveKey={['size','imagg','text','background','border','placeholder','target']}>
                <Collapse.Panel header="尺寸" key="size">
                    {
                        isActive ? <div className="reset" onClick={ e => this.setInitParam('size') }>还原</div> : null
                    }
                    <Size ref="size" onChange={ (e,p) => this.onChange(e,p) }></Size>
                </Collapse.Panel>
                {
                    param.nodeName==="IMG"?
                    <Collapse.Panel header="图片" key="imagg">
                        {
                            isActive ? <div className="reset" onClick={ e => this.setInitParam('imagg') }>还原</div> : null
                        }
                        <Imagg ref="imagg" onChange={ (e,p) => this.onChange(e,p) }></Imagg>
                    </Collapse.Panel> : null
                }
                {
                    param.innerText!==undefined?
                    <Collapse.Panel header="文本" key="text">
                        {
                            isActive ? <div className="reset" onClick={ e => this.setInitParam('text') }>还原</div> : null
                        }
                        <Text ref="text" onChange={ (e,p) => this.onChange(e,p) }></Text>
                    </Collapse.Panel> : null
                }
                {
                    param.nodeName!=="IMG"?
                    <Collapse.Panel header="背景" key="background">
                        {
                            isActive ? <div className="reset" onClick={ e => this.setInitParam('background') }>还原</div> : null
                        }
                        <Background ref="background" onChange={ (e,p) => this.onChange(e,p) }></Background>
                    </Collapse.Panel> : null
                }
                <Collapse.Panel header="边框" key="border">
                    {
                        isActive ? <div className="reset" onClick={ e => this.setInitParam('border') }>还原</div> : null
                    }
                    <Border ref="border" onChange={ (e,p) => this.onChange(e,p) }></Border>
                </Collapse.Panel>
                {
                    attr.placeholder!==undefined?
                    <Collapse.Panel header="提示信息" key="placeholder">
                        {
                            isActive ? <div className="reset" onClick={ e => this.setInitParam('placeholder') }>还原</div> : null
                        }
                        <Placeholder ref="placeholder" onChange={ (e,p) => this.onChange(e,p) }></Placeholder>
                    </Collapse.Panel> : null
                }
                {
                    attr.href!==undefined?
                    <Collapse.Panel header="目标链接" key="target">
                        {
                            isActive ? <div className="reset" onClick={ e => this.setInitParam('target') }>还原</div> : null
                        }
                        <Target ref="target" onChange={ (e,p) => this.onChange(e,p) }></Target>
                    </Collapse.Panel> : null
                }
                {
                    !editable? <div className="main-mask"></div> : null
                }
            </Collapse>
        </div>
    );
    return (
        <div>
            {template}
        </div>
    )
  }
}

export default MainTool;