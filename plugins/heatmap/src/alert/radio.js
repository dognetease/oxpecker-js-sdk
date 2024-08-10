import React, { Component } from 'react';

import './index.less';

class Radio extends Component{
	static defaultProps = {
        list: [],
        onChange: (value) => {}
	}

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    onChange(value) {
        this.props.onChange(value);
    }

    render() {
        const {list} = this.props;
        return (
            <div className="hb-heat-radio-group">
                {
                    list.map(item => {
                        if (item.checked) {
                            return (
                                <label className="hb-heat-radio-wrapper hub-heat-radio-wrapper-checked" key={item.value} onClick={e => this.onChange(item.value)}>
                                    <span className="hb-heat-radio hb-heat-radio-checked">
                                        <input type="radio" className="hb-heat-radio-input" value={item.value} defaultChecked={true} />
                                        <span className="hb-heat-radio-inner"></span>
                                    </span>
                                    <span>{item.name}</span>
                                </label>
                            )
                        }
                        return (
                            <label className="hb-heat-radio-wrapper"  key={item.value} onClick={e => this.onChange(item.value)}>
                                <span className="hb-heat-radio">
                                    <input type="radio" className="hb-heat-radio-input" value={item.value} />
                                    <span className="hb-heat-radio-inner"></span>
                                </span>
                                <span>{item.name}</span>
                            </label>
                        )
                    })
                }
            </div>
        );
    }
}

export default Radio;