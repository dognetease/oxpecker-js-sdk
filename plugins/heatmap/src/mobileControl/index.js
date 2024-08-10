import React from 'react';
import Alert from '../alert';

import './index.less';



let hubbleheatmapRecord = localStorage.getItem('hubbleheatmapRecord');
try {
    hubbleheatmapRecord = JSON.parse(hubbleheatmapRecord) || {};
} catch (error) {
    hubbleheatmapRecord = {};
}

class MobileControl extends React.Component {
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
        };
    }

    componentDidMount() {
        this.getFont();
        this.move();
    }
    
    move() {
        var passiveSupported = false;

        try {
          var options = Object.defineProperty({}, "passive", {
            get: function() {
              passiveSupported = true;
            }
          });
          window.addEventListener("test", null, options);
        } catch(err){}  

        var div1 = document.querySelector('#hb-heatmap-mobile-controlBtn');
        //限制最大宽高，不让滑块出去
        var maxW = document.body.clientWidth - div1.offsetWidth;
        var maxH = document.body.clientHeight - div1.offsetHeight;
        //手指触摸开始，记录div的初始位置
        div1.addEventListener('touchstart', function(e) {
            var ev = e || window.event;
            var touch = ev.targetTouches[0];
            oL = touch.clientX - div1.offsetLeft;
            oT = touch.clientY - div1.offsetTop;
           // document.addEventListener("touchmove", function(){}, false);
        });

        //触摸中的，位置记录
        div1.addEventListener('touchmove', function(e) {
            e.preventDefault();
            var ev = e || window.event;
            var touch = ev.targetTouches[0];
            var oLeft = touch.clientX - oL;
            var oTop = touch.clientY - oT;
            if(oLeft < 0) {
            oLeft = 0;
            } else if(oLeft >= maxW) {
            oLeft = maxW;
            }
            if(oTop < 0) {
            oTop = 0;
            } else if(oTop >= maxH) {
            oTop = maxH;
            }
            div1.style.left = oLeft + 'px';
            div1.style.top = oTop + 'px';
            // 必须配置 { passive: false }， 否则会出现警告
        }, { passive: false });
        //触摸结束时的处理
        div1.addEventListener('touchend', function() {
          // document.removeEventListener("touchmove", defaultEvent);
        });
        //阻止默认事件
        function defaultEvent(e) {
           e.preventDefault();
        }
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
    onTypeChange() {
        const {type} = this.state;
        localStorage.setItem('hubbleheatmapRecord', JSON.stringify({selectType:type}));
        this.props.onTypeChange(type);
    }
    /**
     * 显示点击率切换
     */
    onShowNumChange() {
        const {showNum} = this.state;
        this.props.onShowNumChange(showNum);   
    }
    /**
     * 更新查询结果
     * @param {*} param 
     */
    setResult(param) {
        this.setState(param)
    }

    // 弹出框
    showModel() {
        this.refs.alert.open();
    }

    onChangeConfig(config) {
        const {showNum, type} = this.state;
        this.setState({
            type: config.heatMapType,
            showNum: config.showNum
        }, () => {
            if (type != config.heatMapType) {
                this.onTypeChange();
            }
            if (showNum != config.showNum) {
                this.onShowNumChange();
            }
        });
    }

    render() {
        const { isInIFrame } = this.props;
        const { type, show, showNum, totalCount, totalPV, totalUV, pagetime } = this.state;
        return (
            <div>
                <div id="hb-heatmap-toptool" className={ show ? 'hb-heatmap-toptool-mobile':'hb-heatmap-toptool-mobile top-hide' }>
                    <div className="hb-top-toggle">
                        {
                            show ? <div onClick={ e => this.toggle(false) } className="toggle"><i className="demo-icon icon-toggle-left"></i></div> : 
                            <div onClick={ e => this.toggle(true) }><i className="demo-icon icon-toggle-right"></i></div>
                        }
                    </div>
                    <div style={{ float: 'left', width: '80%' }}>
                       {
                            isInIFrame ? null : <span className="top-refresh-btn" onClick={ e => this.props.onRefresh(e) }  style={{ float: 'right' }}><i className="demo-icon icon-refresh"></i></span>
                        }
                        <div className="target-wrap">
                            <span>总点击量：{ totalCount }</span>
                            <span>PV：{ totalPV }</span>
                            <span>UV：{ totalUV }</span>
                            <br />
                            <span>次均页面停留时长: {pagetime}</span>
                        </div>
                    </div>
                </div>
                <div 
                    ref="controlBtn"
                    className="hb-heatmap-mobile-controlBtn"
                    id="hb-heatmap-mobile-controlBtn"
                    onClick={e => this.showModel()}
                >
                    <span style={{display: 'block', width: '35px', margin: '6px 0 0 5px'}}>
                        {
                            type == 2 ? '点击热图' : '交互热图'
                        }
                    </span>
                </div>

                <Alert 
                  ref="alert"
                  heatMapType={type}
                  showNum={showNum}
                  onChange={config => this.onChangeConfig(config)}
                />
            </div>
        )
    }
}

export default MobileControl;