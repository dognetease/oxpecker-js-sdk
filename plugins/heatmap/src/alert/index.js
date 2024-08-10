import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Radio from './radio';
import './index.less';
 
 
let defaultState = {
  alertStatus:false,
  closeAlert:function(){}
}
 
class Alert extends Component{
  static defaultProps = {
    heatMapType: 2,
    showNum: true,
    onChange: (config) => {}
  }
  constructor(props) {
    super(props);  
    this.state = {
        ...defaultState,
        heatMapTypeList: [
            {
                name: '点击热图',
                value: 2,
                checked: false
            },
            {
                name: '交互热图',
                value: 1,
                checked: false
            },
            {
                name: '注意力热图',
                value: 3,
                checked: false
            }
        ],
        showNumList: [
            {
                name: '显示',
                value: true,
                checked: false
            },
            {
                name: '隐藏',
                value: false,
                checked: false
            }
        ],
        heatMapType: 2,
        showNum: true
    };
  }

  componentDidMount() {
      this.onHeatMapType(this.props.heatMapType);
      this.onShowNum(this.props.showNum);
  }

  componentWillReceiveProps(nextProps) {
      if (this.props.heatMapType != nextProps.heatMapType) {
          this.setState({
            heatMapType: nextProps.heatMapType
          }, () => {
              this.onHeatMapType(this.state.heatMapType);
          });
      }
      if (this.props.showNum != nextProps.showNum) {
        this.setState({
            showNum: nextProps.showNum
        }, () => {
            this.onShowNum(this.state.showNum);
        });
    }
  }

  // css动画组件设置为目标组件
  FirstChild(props){
    const childrenArray = React.Children.toArray(props.children);
    return childrenArray[0] || null;
  }
  // 关闭弹框
  confirm() {
    this.setState({
      alertStatus:false
    })
    this.state.closeAlert();
  }
  open(options){
    options = options || {};
    options.alertStatus = true;
    this.setState({
      ...defaultState,
      ...options
    })
  }
  close(){
    this.state.closeAlert();
    this.setState({
      ...defaultState
    })
  }

  confirmCancel() {
    this.confirm();
  }

  confirmOk() {
    const {heatMapType, showNum} = this.state;
    this.confirm();
    this.props.onChange({
        heatMapType: heatMapType,
        showNum: showNum
    });
  }

  onHeatMapType(value) {
    if (typeof value === 'undefined' || value === '') {
        return;
    }
    let {heatMapTypeList, heatMapType} = this.state;
    heatMapTypeList.map(item => {
        item.checked = false;
        if (item.value == value) {
            item.checked = true;
            heatMapType = value;
        }
    });
    this.setState({
        heatMapTypeList: heatMapTypeList,
        heatMapType: heatMapType
    });
  }

  onShowNum(value) {
    if (typeof value === 'undefined' || value === '') {
        return;
    }
    let {showNumList, showNum} = this.state;
    showNumList.map(item => {
        item.checked = false;
        if (item.value == value) {
            item.checked = true;
            showNum = value;
        }
    });
    this.setState({
        showNumList: showNumList,
        showNum: showNum
    });
  }
  
   
  render(){
    return (
      <ReactCSSTransitionGroup
        component={this.FirstChild}
        transitionName='hide'
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}>
        <div className="hb-heat-alert-container-con" style={this.state.alertStatus? {display:'block'}:{display:'none'}}>
          <div className="alert-context">
            <div className="alert-title">热图控制</div>  
            <div className="alert-content-detail">
                <div style={{marginTop: '10px'}}>
                    <span style={{marginRight: '15px'}}>类型：</span>
                    <Radio 
                      list={this.state.heatMapTypeList}
                      onChange={ value => this.onHeatMapType(value)}
                    />
                </div>
                {
                    this.state.heatMapType == 1 ? 
                    <div style={{marginTop: '20px'}}>
                        <span>点击率：</span>
                        <Radio 
                        list={this.state.showNumList}
                        onChange={ value => this.onShowNum(value)}
                        />
                    </div> : 
                    ''
                }
            </div>
            <div className="comfirm">
              <a className="btn btn-default" onClick={e => this.confirmCancel()}>取消</a> 
              <a className="btn btn-primary" onClick={e => this.confirmOk()}>确认</a>
            </div>
          </div>
        </div>
      </ReactCSSTransitionGroup>
    );
  }
}
 
 
 
export default Alert;