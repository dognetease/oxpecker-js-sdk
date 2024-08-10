import React from 'react';
import Input from 'antd/lib/input';
import ColorPicker from '../../colorPicker/colorPicker.jsx';

import 'antd/lib/input/style';
class Background extends React.Component {
  constructor(props) {
    super(props);
    this.backgroundColor = {
      backgroundColor: ''
    };
  }
  componentDidMount() {

  }
  setParam(param) {
    this.refs.picker.setColor(param.property['backgroundColor']);
  }
  onColorChange(value) {
    this.setState({ backgroundColor: value });
    this.props.onChange('property', { 'backgroundColor': value });
  }
  render() {
    return (
      <div className="m-item background">
        <div className="i-line clearfix">
          <div className="left">
            <label>背景</label>
          </div>
          <div className="right">
            <ColorPicker ref="picker" onChange={ e => this.onColorChange(e) } style={{width: "85px"}}/>
          </div>
        </div>
      </div>
    )
  }
}

export default Background;