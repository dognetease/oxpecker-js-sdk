import React from 'react';
import Input from 'antd/lib/input';
import Select from 'antd/lib/Select';
import Radio from 'antd/lib/radio';

import 'antd/lib/input/style';
import 'antd/lib/select/style';
import 'antd/lib/radio/style';

import ColorPicker from '../../colorPicker/colorPicker.jsx';
class Text extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      textColor: '',
      fontSize: '',
      fontWeight: '0',
      textAlignment: ''
    };
  }
  componentDidMount() {

  }
  // color值为rgba
  getRgbaP(color) {
    // test
    //color = 'rgba(241,112,19,0.2)';
    try {
      const rgbaArr = color.replace('rgba(','').replace(')','').split(',');
      // app传过来的透明度值范围是（0-255），故需要转化
      const a = rgbaArr[3]/255;
      return 'rgba('+ rgbaArr[0] + ',' + rgbaArr[1] +',' + rgbaArr[2] + ',' + a + ')';
    } catch (error) {
      return 'rgba(255,255,255,0)';
    }
  }
  setParam(param) {
    this.setState({
      text: param.property['text'],
      textColor: param.property['textColor'],
      fontSize: param.property['fontSize'],
      fontWeight: param.property['fontWeight'],
      textAlignment: param.property['textAlignment']
    })
    this.refs.picker.setColor(this.getRgbaP(param.property['textColor']));
  }
  onTextChange(e) {
    let value = e.target.value;
    this.state.text = value;
    this.setState({ text: value });
    this.props.onChange('property', { 'text': value });
  }
  onColorChange(rgb) {
    // rgb = {r: 241, g: 112, b: 19, a: 0.39}
    // 传给app透明度值范围是（0-255），故需要转化
    const a = Math.ceil(rgb.a * 255);
    const value = 'rgba('+ rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')' ;
    console.log(value)
    this.state.textColor = value;
    this.setState({ textColor: value });
    this.props.onChange('property', { 'textColor': value });
  }
  onSizeChange(e) {
    let value = e.target.value;
    this.state.fontSize = value;
    this.setState({ fontSize: value });
    this.props.onChange('property', { 'fontSize': value });
  }
  onfontWeightChange(e) {
    let value = e;
    this.state.fontWeight = value;
    this.setState({ fontWeight: value });
    this.props.onChange('property', { 'fontWeight': value });
  }
  onAlignChange(e) {
    let value = e.target.value;
    this.state.textAlignment = value;
    this.setState({ textAlignment: value });
    this.props.onChange('property', { 'textAlignment': value });
  }
  // 清空还原初始数据
  restore() {
    this.setState({
      text: '',
      textColor: '',
      fontSize: '',
      fontWeight: '',
      textAlignment: ''
    })
    this.refs.picker.setColor('rgba(255,255,255,0)');
  }
  render() {
    let { text, textColor, fontSize, fontWeight, textAlignment } = this.state;
    return (
      <div className="m-item text">
        <div className="i-line clearfix">
            <Input.TextArea onChange={ e => this.onTextChange(e) } value={ text }/>
        </div>
        <div className="i-line clearfix">
           <label>颜色：<ColorPicker ref="picker" onChange={ (e, value) => this.onColorChange(e,value) } style={{display:'inline-block'}}/></label>
        </div>
        <div className="i-line clearfix">
          <label>字号：<Input onChange={ e => this.onSizeChange(e) } value={ fontSize } maxLength="10" placeholder="字号"/></label>
        </div>
        {/* <div className="i-line clearfix">
          <div className="left">
            <label>对齐</label>
          </div>
          <div className="right">
            <Radio.Group onChange={ e => this.onAlignChange(e) } value={ textAlignment } getPopupContainer={trigger => trigger.parentNode}>
              <Radio.Button value="0"><i className="demo-icon icon-textAlignment-left" style={{marginLeft:"-2px"}}></i></Radio.Button>
              <Radio.Button value="1"><i className="demo-icon icon-textAlignment-center" style={{marginLeft:"-2px"}}></i></Radio.Button>
              <Radio.Button value="2"><i className="demo-icon icon-textAlignment-right" style={{marginLeft:"-2px"}}></i></Radio.Button>
              <Radio.Button value="3"><i className="demo-icon icon-textAlignment-justify"></i></Radio.Button>
            </Radio.Group>
          </div>
        </div> */}
      </div>
    )
  }
}

export default Text;