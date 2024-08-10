/**
 * 上报用户属性
 */
 import { PEOPLE_RESERVED_PROPERTY, SDKTYPE, PEOPLE_PROPERTY_ID } from './config';
 import { _, console } from './utils';

 var PeopleTrack = function(instance) {
    this.instance = instance;
    this.local_storage = this.instance.local_storage;
 };

 // 扩展
 _.extend(PeopleTrack.prototype, {
    /**
     * 检测设置的属性是否为系统保留属性
     * @param {String} prop 
     */
    _is_reserved_property: function(prop) {
        return PEOPLE_RESERVED_PROPERTY.indexOf(prop) > -1;
    },
    //上报用户属性数据
    _send_request: function(properties, callback) {
        if (!_.isFunction(callback)) {
            callback = function() {};
        }
        properties = properties || {};

        var data = {
            dataType: 'ie',
            appKey: this.instance._get_config('token'),
            // 客户端唯一凭证(设备凭证)
            deviceUdid: this.instance.get_distinct_id(),
            userId: this.instance.get_user_id(),
            // 上报时间
            time: new Date().getTime(),
            // sdk类型 （js，小程序、安卓、IOS、server、pc）
            sdkType: SDKTYPE,
            // 事件id
            eventId: PEOPLE_PROPERTY_ID,
            // 用户首次访问时间
            persistedTime: this.instance.get_property('persistedTime'),
            // 页面打开场景, 默认 Browser
            pageOpenScene: 'Browser',
            // 自定义用户属性
            attributes: properties
        };

        // 合并渠道推广信息
        data = _.extend({}, data, this.instance.channel.get_channel_params());
        // 合并二级访问来源信息
        data = _.extend({}, data, this.instance.source.get_params());
        // 上报数据字段截取
        var truncateLength = this.instance.get_config('truncateLength');
        var truncated_data = data;
        // 截取字段
        if (_.isNumber(truncateLength) && truncateLength > 0) {
            truncated_data = _.truncate(data, truncateLength);
        }
        console.log('上报的数据（截取长度'+truncateLength+ '）:', truncated_data); 

        var callback_fn = (response) => {
            callback(response, data);
        };
        // 上报
        this.instance.send_request(truncated_data, callback_fn);

        return truncated_data;
    },
    /**
     * 设置用户属性 
     * DATracker.people.set('gender', 'aa'); ||
     * DATracker.people.set({
     *   'Company': 'aa'
     * });
     * 
     * 上报数据结构："attributes":{
                        "$userProfile":{
                            "name":"张三"
                            "$type":"profile_set"
                        }
                    }
    */
    set: function(prop, to, callback) {
     var set_props = {};
     if (_.isObject(prop)) {
        _.each(prop, (v ,k) => {
            // 不是系统保留属性
            if (!this._is_reserved_property(k)) {
                set_props[k] = v;
            }
        });
        callback = to;
     } else {
        set_props[prop] = to;
     }
     if(set_props['$userProfile'] === undefined){
        set_props['$type'] = 'profile_set';
        set_props = {'$userProfile': set_props};
     }
     return this._send_request(set_props, callback);
    },
    // 用户属性：真实姓名
    set_realname: function(realname) {
        this.set({"$realName" : realname});
    },
    // 用户属性：所在国家
    set_country: function(country) {
        this.set({"$country" : country});
    },
    // 用户属性：地区（省份）
    set_province: function(region) {
        this.set({"$region" : region});
    },
    // 用户属性：地区（省份）
    set_region: function(region) {
        this.set_province(region);
    },
    // 用户属性：城市
    set_city: function(city) {
        this.set({"$city" : city});
    },
    // 用户属性：年龄
    set_age: function(age) {
        this.set({"$age" : age});
    },
    // 用户属性：性别 0-女，1-男，2-未知
    set_gender: function(gender) {
        if (gender == 0 || gender == 1 || gender == 2) {
            this.set({"$gender" : gender});
        }
    },
    // 用户属性：生日（出生日期）
    set_birthday = function(birthday) {
        if(!_.checkTime(birthday)) return; 
        this.set({"$birthday" : birthday});
    },
    // 用户属性：产品账号
    set_account: function(account) {
        this.set({"$account" : account});
    },
    // 用户属性：账户、姓名、生日、性别
    set_populationWithAccount: function(account, realname, birthday, gender) {
        if(!account || !realname || !birthday || !gender) return;
        if(!_.checkTime(birthday)) return;
        if (gender != 0 && gender != 1 && gender != 2) return; 
        //生日合法检测，yy-MM-dd
        this.set({'$account': account, "$realName" : realname, "$birthday": birthday, "$gender": gender});
    },
    // 用户属性：国家、地区（省份）、城市
    set_location: function(country, region, city) {
        if(!country || !region || !city) return;
        this.set({"$country" : country, "$region": region, "$city": city});
    }
 });

 export default PeopleTrack;