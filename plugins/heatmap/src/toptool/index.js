/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2019-01-03
 * @description: 顶部工具栏
 */

import React from 'react';
import Select from '../select/index';

let dataList = [
    {
        value: '2',
        name: '点击热图'
    },
    {
        value: '1',
        name: '交互热图'
    },
    {
        value: '3',
        name: '注意力热图'
    }
];


let hubbleheatmapRecord = localStorage.getItem('hubbleheatmapRecord');
try {
    hubbleheatmapRecord = JSON.parse(hubbleheatmapRecord); 
    if (hubbleheatmapRecord.selectType == '1') {
        dataList = [
            {
                value: '1',
                name: '交互热图'
            },
            {
                value: '2',
                name: '点击热图'
            },
            {
                value: '3',
                name: '注意力热图'
            }
        ];
    }
} catch (error) {
    hubbleheatmapRecord = '';
}

 class TopTool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: hubbleheatmapRecord.selectType == '1' ? 1 : 2,    // 1表示当前显示的是dom节点热力图，2表示canvas热力图
            show: true,  // 头部工具栏是否显示
            showNum: true,  // dom热力图下，是否显示数字
            totalCount: 0,
            totalPV: 0,
            totalUV: 0,
            pagetime: 0 // 页面停留时长
        }
    }
    componentDidMount() {
        this.getFont();
        //this.onTypeChange(this.state.type);
    }
    /**
     * 从hubble平台拉取字体样式
     */
    getFont() {
        const { static_host } = this.props;
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css'; 
        link.href = static_host +'/analytics/dist/css/font/font.css?201801221057';
        document.head.appendChild(link);
    }
    toggle(type) {
        this.setState({
            show: type
        })
    }
    /**
     * 切换热力图类型
     * @param {*} type 
     */
    onTypeChange(type) {
        this.setState({
            type: type
        });
        localStorage.setItem('hubbleheatmapRecord', JSON.stringify({selectType:type}));
        this.props.onTypeChange(type);
    }
    /**
     * 显示点击率切换
     */
    onShowNumChange(type) {
        const { showNum } = this.state;
        if (showNum!=type) {
            this.setState({
                showNum: type
            })
            this.props.onShowNumChange(type);
        }   
    }
    /**
     * 更新查询结果
     * @param {*} param 
     */
    setResult(param) {
        this.setState(param)
    }
    render() {
        const { isInIFrame } = this.props;
        const { type, show, showNum, totalCount, totalPV, totalUV, pagetime } = this.state;
        return (
            <div id="hb-heatmap-toptool" className={ show? '':'top-hide' }>
                <div className="hb-top-toggle">
                {
                    show ? <div onClick={ e => this.toggle(false) } className="toggle"><i className="demo-icon icon-toggle-left"></i></div> : 
                    <div onClick={ e => this.toggle(true) }><i className="demo-icon icon-toggle-right"></i></div>
                }
                </div>
                <div style={{ float: 'left' }}>
                    <span style={{ float: 'left' }}>热图类型：</span>
                    <Select dataList={dataList} onChange={ e => this.onTypeChange(e) }/>
                    {
                        type==1 ?
                        <div className="dom-heat-tool">
                            <span>点击率</span>
                            <div onClick={ e => this.onShowNumChange(true) } className="circle">
                                <i className={"demo-icon icon-radio" + (showNum? '-checked':'')}></i>
                                <span>显示</span>
                            </div>
                            
                            <div onClick={ e => this.onShowNumChange(false) } className="circle">
                                <i className={"demo-icon icon-radio" + (showNum? '':'-checked')}></i>
                                <span>隐藏</span>
                            </div>
                            
                            <div className="color-wrap">
                                <span>0%</span>
                                <div className="color-range">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span>100%</span>
                            </div>  
                        </div> : null
                    }
                </div>
                <div style={{ float: 'right' }}>
                    <div className="target-wrap">
                        <span>总点击量：{ totalCount }</span>
                        <span>PV：{ totalPV }</span>
                        <span>UV：{ totalUV }</span>
                        <span>次均页面停留时长: {pagetime}</span>
                        {
                            isInIFrame ? null : <span className="top-refresh-btn" onClick={ e => this.props.onRefresh(e) }><i className="demo-icon icon-refresh"></i></span>
                        }
                    </div>
                </div>
            </div>
        )
    }
 }

 export default TopTool;