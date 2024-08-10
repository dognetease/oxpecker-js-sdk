/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2019-01-03
 * @description: loading组件
 */
import React from 'react';

class Loading extends React.Component {
    render() {
        return (
            <div id="sa-loading-mask">
                <div className="loadingCnt" style={{display:'block', top: '300px'}}>
                    <div className="spinner">
                    <div>&nbsp;</div>
                    <div className="rect2">&nbsp;</div>
                    <div className="rect3">&nbsp;</div>
                    <div className="rect4">&nbsp;</div>
                    <div className="rect5">&nbsp;</div>
                    </div>  
                </div>
            </div>
        )

        
    }
}

export default Loading;