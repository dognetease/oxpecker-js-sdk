import React from 'react';
import Util from './util.jsx';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import Message from 'antd/lib/message';
import Button from 'antd/lib/button';
import Alert from 'antd/lib/alert';

import 'antd/lib/modal/style';
import 'antd/lib/tooltip/style';
import 'antd/lib/message/style';
import 'antd/lib/button/style';
import 'antd/lib/alert/style';

const api_host = DATracker.get_config('visualization_editor_control_host') ? DATracker.get_config('visualization_editor_control_host') :  DATracker.get_config('api_host');


class TopTool extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      testDetail: {},  //实验详情
      versionDetail: {}, //当前版本的详情数据
      cacheArr: [], //编辑过，但是还未保存的配置;每一项是一个数据，第一数据是当前步骤编辑后的状态，第二个数据是下一步编辑前的状态
      currIndex: 0, //定位当前处于第几步
      connectable: false, // 是否连接(APP 可视化所需字段)
      appEntryEditor: false, // 是否进入编辑界面（APP 可视化所需字段）
      appCanEditor: false,  // 是否能编辑（APP 可视化所需字段，进入编辑后再使用该字段，若是原版本，不可编辑）
      appChoiceElementable: false // app可视化配置：表示是否选择了一个元素编辑，若为false，表示不能做编辑操作
    }
  }
  componentDidMount() {
    
  }
  setDetail(testDetail, versionDetail) {
    this.setState({
      testDetail: testDetail
    });
    this.changeVersion(versionDetail);
  }
  // 切换版本
  changeVersion(versionDetail) {
    try {
      versionDetail.varValue = JSON.parse(versionDetail.varValue);
      versionDetail.varValue.variations = versionDetail.varValue.variations || [];
    } catch (error) {
      versionDetail.varValue = {
        variations: []
      };
    }
    this.setState({
      versionDetail: JSON.parse(JSON.stringify(versionDetail))
    })
  }
  // app可视化配置 当未选择元素时，不能编辑，此时 appChoiceElementable = false 。反之 appChoiceElementable = true
  setAppChoiceElementable(appChoiceElementable) {
    this.setState({
      appChoiceElementable: appChoiceElementable
    });
  }
  /**
   * 更新缓存列表
   * @param {*最新配置} param 
   * @param {*传入的配置是否是“还原”操作} isReset
   */
  updateChche(param, isReset) {
    let initData  = param.initData; //编辑前的配置
    let afterData = param.afterData; //编辑后的配置
    let cacheArr  = this.state.cacheArr;
    let currIndex = this.state.currIndex;
    if(cacheArr.length == 0) {
      //如果没编辑过，将第一个编辑的元素的初始状态作为第一步
      cacheArr.push([initData]);
      //afterData加入后一步中
      cacheArr.push([afterData]);
    } else {
      if (isReset) {
        // 如果是还原操作，将currIndex后面的记录全部舍弃
        cacheArr = cacheArr.slice(0, currIndex+1);
      }
      if(cacheArr[currIndex][0].selector == afterData.selector) {
        //如果前后编辑的是一个元素，认为是同一步，直接用最新的替换老的
        cacheArr[currIndex][0] = afterData;
      } else  {
        //如果前后编辑的是不同的元素，将initData合并到前一步，这样回退的时候就能找到之前的状态了
        cacheArr[currIndex].push(initData);
        //afterData加入后一步中
        cacheArr.push([afterData]);
      }
    }
    if(20 <= cacheArr.length) {
      //只保留20步的历史记录，超出的部分merge到testDetail中，这部分就固定不变了
      let first = cacheArr.splice(0,1);
      this.mergeDetail(first[0]); //first[0]是这一步编辑后的状态，first[1]是下一步编辑前的状态，不用保存
    }
    currIndex = cacheArr.length-1;
    this.setState({
      cacheArr: cacheArr,
      currIndex: currIndex
    });
  }
  /**
   * 将操作列表merge在一起，只保留变化的部分
   * @param {*} list 
   */
  mergeChange(list) {
    let param = {};
    //将同一个元素的修改队列放在一个list里
    //如param = {'#stop': [{...},{...}]}
    list.map( m => {
      m.map( n => {
        let key = n.selector;
        if(param[key] == undefined) {
          param[key] = [];
        }
        param[key].push(n);
      })
    });
    //然后拿最后一次的配置，与第一个相比较，找出变化的部分
    for(let key in param) {
      let arr = param[key];
      if(arr.length > 1) {
        let inDa = arr[0];
        let afDa = arr[arr.length-1];
        for(let attr in inDa.attributes) {
          if(inDa.attributes[attr] == afDa.attributes[attr]) {
            //将不变的部分删除
            delete inDa.attributes[attr];
            delete afDa.attributes[attr];
          }
        }
        for(let attr in inDa.css) {
          if(inDa.css[attr] == afDa.css[attr]) {
            //将不变的部分删除
            delete inDa.css[attr];
            delete afDa.css[attr];
          }
        }
        if(inDa.innerText == afDa.innerText) {
          delete inDa.innerText;
          delete afDa.innerText;
        }
        param[key] = afDa;
      }
    }
    //然后将改变的配置合并到versionDetail中
    return param;
  }
  appMergeChange(list) {
    let param = {};
    let views = [];
    //将同一个元素的修改队列放在一个list里
    //如param = {'$xxxId': [{...},{...}]}
    list.map( m => {
      m.map( n => {
        let key = n.selector;
        if(param[key] == undefined) {
          param[key] = [];
        }
        param[key].push(n);
      })
    });
    //然后拿最后一次的配置，与old相比较，找出变化的部分
    for(let key in param) {
      let arr = param[key];
      let afDa = arr[arr.length-1];
      for(let attr in afDa.property) {
        if(afDa.property[attr] == afDa.oldProperty[attr]) {
          //将不变的部分删除
          delete afDa.property[attr];
        }
      }
      param[key] = afDa;
      const obj = {};
      obj[key] = param[key];
      delete obj[key].selector;
      views.push(obj);
    }
    return views;
  }
  /**
   * 将改变的配置合并到versionDetail中
   */
  mergeDetail(param) {
    let { versionDetail } = this.state;
    let varValue = versionDetail.varValue;
    let variations = varValue.variations;

    let isIn = false;
    variations.map( (e,i) => {
      if(e.selector == param.selector) {

        for(let attr in param.attributes) {
          //属性attributes发生的改变
          e.attributes[attr] = param.attributes[attr];
        }
        for(let attr in param.css) {
          //样式css发生的改变
          e.css[attr] = param.css[attr];
        }
        if(param.innerText != undefined) {
          //文本innerText发生的改变
          e.innerText = param.innerText;
        }
        isIn = true;
      }
    });
    
    if(!isIn) {
      //如果不在，就加进去
      variations.push(param);
    }
  }
  //点击保存
  // isVersion  app可视化配置使用
  onSave(isVersion) {
    const { type } = this.props;
    const { appChoiceElementable } = this.state;
    if (type !== 'APP') {
      this.onWebSave();
    } else {
      // app可视化配置：若选择了元素，才能编辑（说明：app可视化配置中，只要选中了某个元素，那么焦点就不会消失）
      if (appChoiceElementable) {
        this.onAppSave(isVersion);
      }
    }
  }
  onWebSave() {
    let { testDetail, versionDetail, currIndex, cacheArr } = this.state;
    //保存时将0到currIndex的配置都merge到versionDetail中去
    let list = cacheArr.slice(0, currIndex+1);
    //先将变化的部分找到
    let map  = this.mergeChange(list);
    //然后merge到versionDetail中去
    for(let key in map) {
      this.mergeDetail(map[key]);
    }
    testDetail.versionList.map( (e,i) => {
      if( e.id == versionDetail.id ) {
        testDetail.versionList[i].varValue = JSON.stringify(this.state.versionDetail.varValue);
      }
    })
    //将testDetail保存到服务端
    this.doSave();
  }
  onAppSave(isVersion) {
    let { testDetail, versionDetail, currIndex, cacheArr } = this.state;
    const { type } = this.props;
    //保存时将0到currIndex的配置都merge到versionDetail中去
    let list = cacheArr.slice(0, currIndex+1);
    let msg = '';
    if (isVersion === 'version') {
      msg = 'isVersion';
    }
    this.trigger('doSave', {
      views: this.appMergeChange(list)
    }, msg);
  }
  //执行保存
  doSave() {
    let { testDetail } = this.state;
    let productId = location.href.match(/productId=([^&#]+)/)[1] || '';
    let testId    = location.href.match(/testId=([^&#]+)/)[1] || '' ;
    Util._.post(api_host + '/abi/abtest/modify?productId=' + productId, JSON.stringify(testDetail), (data) => {
      if(data.success) {
        this.restore();
        Message.success('保存成功');
      }else{
        Message.error('保存失败');
      }
    })
  }
  // 还原
  restore() {
    this.setState({cacheArr: [], currIndex: 0});
  }
  //后退
  back() {
    let { currIndex, cacheArr } = this.state;
    if(currIndex<=0) {
      return;
    }else{
      currIndex += -1;
    }
    this.trigger('setCurrParam', cacheArr[currIndex] || {});
    this.setState({ currIndex: currIndex });
  }
  //前进
  forword() {
    let { currIndex, cacheArr } = this.state;
    if(cacheArr.length-1<=currIndex) {
      return;
    }else{
      currIndex += 1;
    }
    this.trigger('setCurrParam', cacheArr[currIndex] || {});
    this.setState({ currIndex: currIndex });
  }
  //退出编辑
  onOut(e) {
    let { type } = this.props;
    if (type === 'APP') {
      this.trigger('out');
    } else {
      if(this.state.cacheArr.length == 0) {
        window.close();
        return;
      }
      let obj = Modal.confirm({
        title: '是否确定离开?',
        content: '信息尚未保存，如果不保存，配置将不会生效',
        className: 'hubble-visual-confirm-modal',
        cancelText: '取消',
        okText: '确定',
        onOk(e) {
          window.close();
        },
        onCancel(e) {
          obj.destroy(e);
        }
      });
    }
  }
  // app进入编辑
  onAppEntryEditor() {
    this.trigger('appEntryEditor', true);
  }
  render() {
    let { editable, type } = this.props;
    let { testDetail, currIndex, cacheArr, appEntryEditor, connectable, appCanEditor } = this.state;
    let returnText = '退出配置';
    let addressClassName = 'href autocut';
    let appEnterEditBtn = '';
    let tip = '';
    if (type === 'APP') {
      tip = <div className="f-left" style={{marginRight: '20px'}}><Alert message="配置未保存时建议不要移动手机屏幕，可能会影响保存结果" type="warning" showIcon /></div>;
    }
    let operation = (
      <div className={"f-right "+(editable? "":"hide")}>
        {tip}
        <Tooltip title="后退" getPopupContainer={trigger => trigger.parentNode}>
          <i onClick={ e => this.back() } className={ "demo-icon icon-go-back " + (currIndex<=0? 'disable':'') }></i>
        </Tooltip>
        <Tooltip title="前进" getPopupContainer={trigger => trigger.parentNode}>
          <i onClick={ e => this.forword() } className={ "demo-icon icon-go-forword " + (cacheArr.length-1<=currIndex? 'disable':'') }></i>
        </Tooltip>
        <Tooltip title="保存" getPopupContainer={trigger => trigger.parentNode}>
          <i onClick={ e => this.onSave() } className={ "demo-icon icon-save " }></i>
        </Tooltip>
      </div>
    );
    if (type === 'APP') {
      returnText = '退出';
      addressClassName = 'hide';
      if (editable) {
        if (!appEntryEditor) {
          operation = '';
          const content = <p>未连接移动端</p>;
          if (connectable) {
            appEnterEditBtn = <div className={"f-right"}><Button type="primary" onClick={ e => this.onAppEntryEditor() }>配置版本</Button></div>;
          } else {
            appEnterEditBtn = <div className={"f-right"}><Tooltip title={content} placement="left" getPopupContainer={ trigger => trigger.parentNode }><Button type="primary" disabled>配置版本</Button></Tooltip></div>;
          }
        } else if (!appCanEditor) {
          operation = '';
          appEnterEditBtn = '';
        }
      } else {
        appEnterEditBtn = '';
      }
    }
    return (
      <div ref="grab">
      <div className="f-left">
        <span className="back" onClick={ e => this.onOut(e) }><i className="demo-icon icon-return"></i>{returnText}</span>
        <span className={addressClassName}>地址：{ testDetail.variable }</span>
      </div>
      {appEnterEditBtn}
      {operation}
    </div>
    )
  }
}

export default TopTool;