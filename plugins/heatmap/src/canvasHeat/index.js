/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2019-01-03
 * @description: 利用伪元素实现的热力图
 */
import React from 'react';
import $ from 'jquery';
import heatmapFactory from '../../lib/heatmap';
import Util from '../util/mathTool';
import pathMap from '../../pathMap';

let testData = {
    "success":true,
    "errorCode":200,
    "message":"成功",
    "relatedObject":{
        "totalPositionClickNum": 6,
        "positions":[
            {"position":".first19,60,30,150,100","positionClickNum":3,"setPosition":true,"setPositionClickNum":true},
            {"position":".first28,90,10,150,100","positionClickNum":9,"setPosition":true,"setPositionClickNum":true},
            {"position":".first79,80,30,150,100","positionClickNum":5,"setPosition":true,"setPositionClickNum":true},
            {"position":".first197,80,30,150,100","positionClickNum":5,"setPosition":true,"setPositionClickNum":true},
            {"position":".first375,80,30,150,100","positionClickNum":5,"setPosition":true,"setPositionClickNum":true}
        ],
        "useCache":false,
        "cacheDate":null,
        "truncated":false,
        "setUseCache":true,
        "setTruncated":true,
        "setCacheDate":false,
        "positionsSize":13,
        "setTotalPositionClickNum":true,
        "setPositions":true
    }
}

class CanvasHeat extends React.Component {
    static defaultProps = {
        splitHeight: 8000   // 分块渲染的块高度
    }
    constructor(props) {
        super(props);
        this.state = {
           rendering: false,  // 表示正在渲染
           containers: [] // 页面超过一定长度时，浏览器会停止canvas的写画操作，所以遇到这种情况需要分成几个canvas显示
        }
    }
    componentDidMount() {
        // 页面初始高度
        let initHeight = Util.getPageHeight();
        $(window).resize(() => {
            // 窗口大小发生变化时，重新绘制（为提升性能，延后0.3秒）
            if (this.renderLink) {
                clearTimeout(this.renderLink);
            }
            $('.HBHEATMAPCONTAINER').css({
                width: Util.getPageWidth()
            })
            this.renderLink = setTimeout(() => {
                if (!this.props.loading && this.dataSource) {
                    this.setData(this.dataSource);
                }
            }, 500);
        })
        // 每隔1秒钟判断一下页面高度是否变化，如果变化超过300px，那么进行重绘

        setInterval(() => {
            let curHeight = Util.getPageHeight();
            if (Math.abs(curHeight - initHeight) > 300 && this.dataSource) {
                this.setData(this.dataSource);
            }
        }, 2000);
        
        let isMobile = Util.isMobile();
        let timer;
        $(window).scroll(() => {
            if (isMobile) {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    if (this.dataSource) {
                        this.setData(this.dataSource);
                    }
                }, 500);
            }
        });
    }
    componentWillReceiveProps(nextProps) {
        if (this.dataSource) {
            if (nextProps.heatType == 2) {
                this.calculate();
            } else {
                this.setState({
                    containers: []
                }, () => {
                    this.renderHeat();
                })
            }
        }
    }

    getData(hardRefresh) {
        const { param } = this.props;

        $.ajax({
          url: param.canvasURL,
          data: {
            hubble_heatmap_id: param.hubble_heatmap_id,
            current_url: param.current_url,
            useCache: hardRefresh ? false:true
          },
          success: (data) => {
            if (data.success) {
              let result = data.relatedObject || {};
              this.setData(result.positions || []);
              this.props.onDataLoaded({
                  totalCount: result.totalPositionClickNum || 0
              });
            } else {
                this.props.onError(data.message || '系统繁忙，请稍后重试');
                this.props.onDataLoaded({
                    totalCount: 0
                });
            }
          },
          error: (e) => {
            this.props.onError('系统繁忙，请稍后重试');
            this.props.onDataLoaded({
                totalCount: 0
            });
          }
        })
    }
    setData(data) {
        if (this.state.rendering == true) {
            return;
        } else {
            this.state.rendering = true;
        }
        
        this.dataSource = data;
        // debugger
        //this.dataSource.length = 100;
        //this.calculate();
    }
    /**
     * 计算各个container的高度
     */
    calculate() {
        const { splitHeight } = this.props;
        $('.HBHEATMAPCONTAINER').find('canvas').remove();
        $('.HBHEATMAPCONTAINER').css({
            width: 0,
            height: 0
        })
        // 页面高度，如果页面高度超过8000px，那么分段显示
        let pageWidth  = Util.getPageWidth();
        let pageHeight = Util.getPageHeight();
        let containers = [];

        // 需要多少个8000px高度的canvas
        let num = parseInt(pageHeight/splitHeight);
        for(let i=0; i<num; i++) {
            containers.push({
                width: pageWidth,
                height: splitHeight
            })
        }
        if (pageHeight%splitHeight) {
            // 如果没能整除，还得加一个
            containers.push({
                width: pageWidth,
                height: pageHeight - num*splitHeight
            })
        }
        
        this.setState({
            containers: containers
        }, () => {
            this.renderHeat();
        })
    }
    renderHeat() {
        const { splitHeight } = this.props;
        const { containers } = this.state;

        let instances = [];
        containers.map((item,index) => {
            let itemC = this.refs["container"+index];
            if (itemC.nodeType == 1) {
                $(itemC).css({
                    width: (item.width + "px"),
                    height: (item.height + "px")
                })
                instances.push(heatmapFactory.create({
                    container: itemC
                }))
            }
        })

        var points = [];
        var max = 0;
       
        this.dataSource.map(item => {
            if (item.position) {
                var val = item.positionClickNum || 0;
                max = Math.max(max, val);

                let list  = item.position.split(',');
                let path  = list[0];     // 元素路径
                    path  = pathMap.toLongFunc(path);
                let left  = list[1] || 0;   // 点击的位置距离元素左边的距离
                let top   = list[2] || 0;   // 点击的位置距离元素上边的距离
                let domW  = list[3] || 0;   // 当时点击时，元素的宽度
                let domH  = list[4] || 0;   // 当时点击时，元素的高度
                
                let ele   = [];
                try {
                    ele = $(path);
                } catch(e) {

                }
                if (ele.length > 0 ) {
                    let posi = Util.getBoundingClientRect(ele[0]); // 元素的位置
                    let domWidth  = ele[0].scrollWidth;
                    let domHeight = ele[0].scrollHeight;
                    let scaleW = 1;     // 宽度系数
                    let scaleH = 1;     // 高度系数
                    if (domW && !isNaN(domW) && domWidth!=0 && domW!=domWidth) {
                        // 如果点击时保存的元素的宽度，并且与现在不一样，那么进行换算
                        scaleW = domWidth/domW
                    }
                    if (domH && !isNaN(domH) && domHeight!=0 && domH!=domHeight) {
                        // 如果点击时保存的元素的宽度，并且与现在不一样，那么进行换算
                        scaleH = domHeight/domH;
                    }

                    let xPos = parseInt(+posi.left + left*scaleW);
                    let yPos = parseInt(+posi.top + top*scaleH);
                    var point = {
                        x: xPos, // 点的位置=元素的位置 + 鼠标相对元素的位置
                        y: yPos%splitHeight,
                        value: val,
                        radius: 30
                    };
                    let conIndex = Math.ceil(yPos/splitHeight) - 1; // 这个点应该绘制在哪个container里面
                    if (!points[conIndex]) {
                        points[conIndex] = [];
                    }
                    points[conIndex].push(point);
                }
            }
        })

        instances.map((item,index) => {
            item.setData({
                max: max,
                data: points[index] || []
            });
        })
        this.state.rendering = false;
    }
    show() {
        $(this.body).show();
    }
    hide() {
        $(this.body).hide();
    }
    render() {
        const { containers } = this.state;
        return (
            <div id="HBHEATMAPMASK" ref={ root => this.body=root }>
            {
                containers.map((item, index) => {
                    return <div
                            ref={ "container"+index }
                            key={ "container"+index }
                            className="HBHEATMAPCONTAINER"
                           ></div>
                })
            }
            </div>
        )
    }
}

 export default CanvasHeat;