/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2019-01-21
 * @description: 消息提示组件
 */
import React from 'react';

class Message extends React.Component {
    
    render() {
        const { msg } = this.props;
        return (
            <div className="hb-heat-message" style={{ top: (msg? "0px":"-64px") }}>
                { msg }
            </div>
        )
    }
}

export default Message;