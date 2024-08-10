/**
 * 设置初始来源domain模块
 */
import {_} from './utils';

var source = {
    data: {
        secondLevelSource: '',
        outsideReferer: false,
        APPKEY: ''
    },
    init: function(APPKEY) {
        if(typeof APPKEY === 'undefined') return;
        this.data.APPKEY = APPKEY;
        this.checkReferer();
        this.setParams();
        this.save();
    },
    //检测是否外链过来
    checkReferer: function() {
        if(document.referrer) {
            if(_.get_host(document.referrer)  != window.location.host ) {
                this.data.outsideReferer = true;
            }
        }
    },
    setParams: function() {
        var cookieSecondLevelSource = _.cookie.get('hb_'+ this.data.APPKEY + '_source');
        if(!cookieSecondLevelSource) {
            cookieSecondLevelSource = '';
        }
        if(this.data.outsideReferer) {
            cookieSecondLevelSource = _.get_host(document.referrer);
        }
        this.data.secondLevelSource = cookieSecondLevelSource;
    },
    //secondLevelSource保存到本地cookie
    save: function() {
        if(this.data.outsideReferer) {
            _.cookie.set('hb_'+ this.data.APPKEY + '_source', this.data.secondLevelSource, 30, true);
        }
    },
    //获取来源数据
    getParams: function() {
        return {secondLevelSource: this.data.secondLevelSource};
    }
};

export default source;

