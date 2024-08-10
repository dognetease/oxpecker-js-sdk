/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2019-01-04
 * @description: 下拉框
 */
import $ from 'jquery';
import React from 'react';

import './index.less';

 class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slideDown: false,
            dataList: [],
            activeItem: {}
        }
    }
    componentDidMount() {
        const { dataList } = this.props;
        this.setState({
            dataList: dataList
        }, () => {
            if (dataList.length > 0) {
                this.setState({
                    activeItem: dataList[0]
                })
            }
        })
       
        $(document.body).click((e) => {
            if ($(e.target).parents(".hb-heat-select-container").length == 0) {
                this.setState({
                    slideDown: false
                })
            }
        })
    }
    /**
     * 选中回调
     * @param {*} item 
     */
    onSelectChange(item) {
        this.setState({
            activeItem: item
        })
        this.props.onChange(item.value);
    }
    onToggle(e) {
       
        e.nativeEvent.stopImmediatePropagation();
        const { slideDown } = this.state;
        this.setState({
            slideDown: !slideDown
        })
    }
    render () {
        const { slideDown, dataList, activeItem } = this.state;
        return (
            <div className="hb-heat-select-container" onClick={ e => this.onToggle(e) }>
                <div className="hb-heat-select-button">{ activeItem.name || '' }</div>
                <span className="demo-icon icon-angle-down-mini"></span>
                <ul style={{display: (slideDown? 'block':'none')}}>
                {
                    dataList.map(item => {
                        return (
                            <li key={item.value} onClick={ e => this.onSelectChange(item) } className={activeItem.value==item.value ? 'active':''}>{ item.name }</li>
                        )
                    })
                }
                </ul>
            </div>
        )
    }
 }

 export default Select;