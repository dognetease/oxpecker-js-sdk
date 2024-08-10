/**
 * 上报事件日志
 */
import { DATATYPE, DEFAULTEVENTID, SDKTYPE } from './config';
import { _, console } from './utils'

var EventTrack = function(instance) {
    this.instance = instance;
    this.local_storage = this.instance.local_storage;

    // 初始化时间（事件相关）
    this.local_storage.register_once({
        updatedTime: 0,
        sessionStartTime: 0
    });
    // 将当前的referrer保存到本地缓存
    this.local_storage.register({
        sessionReferrer: document.referrer
    });
    // 当前会话内发送数据数记录
    this.local_storage.register_once({
        sendNumClass: {
            allNum: 0,
            errSendNum: 0
        }
    });
    // 单页面应用：触发页面切换时，设置 referrer
    var now_url = document.URL;
    var self = this;
    _.innerEvent.on('singlePage:change', function() {
        self.local_storage.register({
            sessionReferrer: now_url
        });
        now_url = document.URL;
    });
};
 
// 扩展
_.extend(EventTrack.prototype, {
    // 判断是否为其它渠道
    _check_channel: function() {
        var referrer = this.instance.get_property('sessionReferrer');
        var is_other_channel = false;
        // 若本地缓存的referrer 的host跟当前页不一样，那么可以确定是其它渠道进来的
        if(_.get_host(referrer) != window.location.host) {
            is_other_channel = true;
        }
        return is_other_channel; 
    },
    /**
     * TODO
     * 判断指定事件是否被禁止上报
     * @param {String} event_name
     * @returns {Boolean} 
     */
    _event_is_disabled: function(event_name) {
        return false;
    },
    // 开启新会话
    _start_new_session: function() {
        this.local_storage.register({
            sessionUuid: _.UUID(),
            sessionStartTime: new Date().getTime()
        });
        this.track('da_session_start');
    },
    // 关闭当前会话
    _close_cur_session: function() {
        /*
            为了便于绘制用户事件发生轨迹图，区分会话close和最后一次事件触发时间的顺序，会话关闭时间需要做些微调
            1. 如果本地拿到了上次（非会话事件）事件的触发时间，time = this.instance.get_property('LASTEVENT').time + 1;
            2. 如果未拿到，time = new Date().getTime() - 1;
        */
        var time = new Date().getTime() - 1;
        var sessionStartTime = this.instance.get_property('sessionStartTime');
        var LASTEVENT = this.instance.get_property('LASTEVENT');
        if (LASTEVENT && LASTEVENT.time) {
            time = LASTEVENT.time + 1;
        }

        this.track('da_session_close', {
            sessionCloseTime: time,
            sessionTotalLength: time - sessionStartTime
        });
    },
    /**
     * 会话业务逻辑实现
     * 判断会话重新开启：条件--- 会话首次开始、指定的一段时间内用户无事件操作、其它渠道进来
     */
    _session: function(callback) {
        var session_start_time = 1 * this.instance.get_property('sessionStartTime') / 1000;
        var updated_time = 1 * this.instance.get_property('updatedTime') / 1000;
        var now_data_time_ms = new Date().getTime();
        var now_date_time_se = 1 * now_date_time_ms / 1000;
        // 会话结束判断
        if (
            session_start_time === 0 ||
            now_date_time_se > updated_time + 60 * this.instance._get_config('session_interval_mins') ||
            this._check_channel()
        ) {
            // 当会话首次开始时，不用发送会话关闭事件
            if (session_start_time === 0) {
                // 新打开一个会话
                this._start_new_session();
            } else {
                this._close_cur_session();
                this._start_new_session();
            }
        }
        // 更新本地记录时间
        this.local_storage.register({
            updatedTime: now_data_time_ms
        });
        // 执行回调
        if (_.isFunction(callback)) {
            callback();
        }
    },
    /**
     * 用户注册
     * @param {String} user_id
     */
    signup: function(user_id) {
        var oldUserId = this.instance.get_user_id();
        oldUserId = oldUserId==undefined ? '' : oldUserId;
        if(oldUserId != user_id){
            this.local_storage.register({'user_id': user_id});
            this.track('da_u_signup',{
                "oldUserId": oldUserId,
                "newUserId": user_id
            });
        }
    },
    /**
     * 用户登录和注册时调用
     * @param {String} user_id 用户唯一标识
     */
    login: function(user_id) {
        // 注册自定义事件
        _.innerEvent.trigger('userId:change', {type: 'login', userId: user_id});
        this.signup(user_id);
        this.track('da_u_login');
    },
    /**
     * 用户退出，清除用户名
     */
    logout: function(callback) {
        // 注册自定义事件
        _.innerEvent.trigger('userId:change', {type: 'logout', userId: this.instance.get_distinct_id()});
        this.local_storage.unregister('user_id');
        var hasCalled = false;
        function track_callback() {
            if(!hasCalled) {
                hasCalled = true;
                if(typeof callback === 'function') {
                    callback();
                }
            }
        }
        //如果没有回调成功，设置超时回调
        setTimeout(track_callback, this.get_config('track_links_timeout'));
        this.track('da_u_logout', {}, track_callback);
    },
    /**
     * 追踪事件（上报用户事件触发数据）
     * @param {String} event_name 事件名称（必须）
     * @param {Object} properties 事件属性
     * @param {Function} callback 上报后的回调方法
     * @param {String} event_type 自定义事件类型
     * @returns {Object} track_data 上报的数据
     */
    track: function(event_name, properties, callback, event_type) {
        if (!_.isFunction(callback)) {
            callback = function() {};
        }
        if (_.isUndefined(event_name)) {
            console.error('上报数据需要一个事件名称');
            return;
        }
        // 禁止上报的事件
        if (this._event_is_disabled(event_name)) {
            callback(0);
            return;
        }
        // 重新读取缓存
        this.local_storage.load();
        // 事件属性
        properties = properties || {};
        // 临时保存一份事件属性
        var userSetProperties = _.JSONDecode(_.JSONEncode(properties));
        // 事件耗时字段值
        var costTime;
        // 若当前事件是需要监听的，那么移除该事件的耗时监听器，获取设置监听器的时间戳，计算耗时
        var startListenTimestamp = this.local_storage.remove_event_timer(event_name);
        if (!_.isUndefined(startListenTimestamp)) {
            costTime = new Date().getTime() -  startListenTimestamp;
        }
        // 事件类型
        var dataType = DATATYPE;
        // 若是内置事件，事件类型需要重置，优先
        if (DEFAULTEVENTID[event_name]) {
            dataType = DEFAULTEVENTID[event_name].dataType;
        } else 
        // 否则的话，若外部传入事件类型，重置
        if (event_type) {
            dataType = event_type;
        }
        // 事件触发时间
        var time = new Date().getTime();
        // 若是会话结束事件，因为会话结束事件可能不是实时触发的，此时事件触发时间需重置
        if (event_name === 'da_session_close') {
            time = properties.sessionCloseTime;
            // 若是会话结束事件，会新增字段，故上报前需移除新增的字段
            delete userSetProperties['sessionCloseTime'];
            delete userSetProperties['sessionTotalLength'];
        }
        // 合并用户自定义的通用事件属性
        userSetProperties = _.extend({}, this.instance.get_property('superProperties'), userSetProperties);
        //触发pageview时，外部设置了该pv的自定义事件属性，这里发送该自定义事件属性
        if(data_type === 'pv') {
            if(_.isObject(this.instance.pageview_attributes)) {
                userSetProperties = _.extend({}, this.instance.pageview_attributes || {}, userSetProperties);
            }
        }
        // 上报的数据
        var data = {
            // 事件类型
            dataType: dataType,
            // 用户id
            userId: this.instance.get_property('user_id'),
            // sdk类型
            sdkType: SDKTYPE,
            // sdk库版本
            sdkVersion: this.instance.get_config('LIB_VERSION'),
            // 事件名称
            eventId: event_name,
            // 事件触发时间
            time: time,
            // 用户首次访问时间
            persistedTime: this.instance.get_property('persistedTime'),
            // 客户端唯一凭证（设备凭证）
            deviceUdid: this.instance.get_distinct_id(),
            // 页面打开场景，默认 Browser
            pageOpenScene: 'Browser',
            // 应用凭证
            appKey: this.instance.get_config('token'),
            // 触发该事件的耗时统计
            costTime: costTime,
            // 关闭的会话存在时长
            sessionTotalLength: properties.sessionTotalLength,
            // 当前事件所属的会话id
            sessionUuid: this.instance.get_property('sessionUuid'),
            // 事件的属性
            attributes: userSetProperties
        };
        // 合并客户端信息
        data = _.extend({}, data, _.info.properties());
        // 合并渠道推广信息
        data = _.extend({}, data, this.instance.channel.getParams());
        // 合并网站来源
        data = _.extend({}, data, this.instance.secondLevelSource.getParams());
        
        // 若在Hubble平台内访问的网页，不能上报数据，但需将data传递给其它插件
        if (this.instance.get_config('hubble_render_mode')) {
            // TODO
            return false;
        }

        var truncateLength = this.instance.get_config('truncateLength');
        var truncate_data = data;
        if (_.isNumber(truncateLength) && truncateLength > 0) {
            truncate_data = _.truncate(truncate_data, truncateLength);
        }
        
    }
});

export default EventTrack;