import React from 'react';
import Input from 'antd/lib/input';
import Select from 'antd/lib/Select';
import Radio from 'antd/lib/radio';

import ColorPicker from '../../colorPicker/colorPicker.jsx';

import 'antd/lib/input/style';
import 'antd/lib/select/style';
import 'antd/lib/radio/style';

class Border extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      borderColor: '',
      borderWidth: ''
    };
  }
  componentDidMount() {

  }
  setParam(param) {
    this.setState({
      borderColor: param.property['borderColor'],
      borderWidth: param.property['borderWidth']
    })
  }
  onColorChange(e) {
    let value = e;
    this.state.borderColor = value;
    this.setState({ borderColor: value });
    this.props.onChange('property', { 'borderColor': value });
  }
  onWidthChange(e) {
    let value = e.target.value;
    this.state.borderWidth = value;
    this.setState({ borderWidth: value });
    this.props.onChange('property', { 'borderWidth': value });
  }
  render() {
    let { borderColor, borderWidth } = this.state;
    return (
      <div className="m-item border">
        <div className="i-line clearfix">
          <div className="left">
            <label><ColorPicker onChange={ e => this.onColorChange(e) }/></label>
          </div>
          <div className="left">
            <Input onChange={ e => this.onWidthChange(e) } value={ borderWidth } maxLength="10"  placeholder="粗细"/>
          </div>
        </div>
      </div>
    )
  }
}

export default Border;