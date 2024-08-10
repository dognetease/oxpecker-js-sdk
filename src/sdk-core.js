/* eslint-disable */
import Config from './config';
import { _, console, userAgent } from './utils';
import app_js_bridge from './app_js_bridge';
import campaign from './campaign';
import single_page from './single_page';
import source  from './source';
import heatmap from './heatmap';
//引入abtest
import abtest from './abtest';
// 共同cookie值，取出的值用来做打通关联--163.com
import commonCookie from './commonCookie';
import OxpeckerSDK from './oxpecker/index.js';

/*
 * DATracker JS Library
 *
 * Copyright 2018, DATracker, Inc. All Rights Reserved
 * https://hubble.netease.com/
 *
 * Includes portions of Underscore.js
 * http://documentcloud.github.com/underscore/
 * (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
 * Released under the MIT License.
 */

/*
SIMPLE STYLE GUIDE:

this.x_x === public function
this._x === internal - only use within this file
this.__x === private - only use within the class

Globals should be all caps
*/
var init_type;       // MODULE or SNIPPET loader
var DATracker_master; // main DATracker instance / object
var INIT_MODULE  = 0;
var INIT_SNIPPET = 1;
var INIT_SYNC = 2;
var SDKTYPE = 'js';

var oxpeckerSDK = new OxpeckerSDK();
/*
 * Constants
 */
/** @const */   var PRIMARY_INSTANCE_NAME     = 'DATracker';
/** @const */   var SET_QUEUE_KEY             = '__mps';
/** @const */   var SET_ONCE_QUEUE_KEY        = '__mpso';
/** @const */   var ADD_QUEUE_KEY             = '__mpa';
/** @const */   var APPEND_QUEUE_KEY          = '__mpap';
/** @const */   var UNION_QUEUE_KEY           = '__mpu';
/** @const */   var SET_ACTION                = 'attributes';
/** @const */   var SET_ONCE_ACTION           = 'attributes';
/** @const */   var ADD_ACTION                = 'attributes';
/** @const */   var APPEND_ACTION             = 'attributes';
/** @const */   var UNION_ACTION              = '$union';
// This key is deprecated, but we want to check for it to see whether aliasing is allowed.
/** @const */   var PEOPLE_DISTINCT_ID_KEY    = '$people_distinct_id';
/** @const */   var EVENT_TIMERS_KEY          = 'costTime';
/** @const */   var RESERVED_PROPERTIES       = [
    SET_QUEUE_KEY,
    SET_ONCE_QUEUE_KEY,
    ADD_QUEUE_KEY,
    APPEND_QUEUE_KEY,
    UNION_QUEUE_KEY,
    PEOPLE_DISTINCT_ID_KEY,
    EVENT_TIMERS_KEY
];


/*
 * Dynamic... constants? Is that an oxymoron?
 */
var HTTP_PROTOCOL = (('https:' === document.location.protocol) ? 'https://' : 'http://');

    // http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
    // https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#withCredentials
var USE_XHR = (window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());

    // IE<10 does not support cross-origin XHR's but script tags
    // with defer won't block window.onload; ENQUEUE_REQUESTS
    // should only be true for Opera<12
var ENQUEUE_REQUESTS = !USE_XHR && (userAgent.indexOf('MSIE') === -1) && (userAgent.indexOf('Mozilla') === -1);

/*
 * Module-level globals
 */
var DEFAULT_CONFIG = {
    'get_path':               '/track/w/',
    'post_path':               '/track/wp/',
    'api_host':               'https://hubble.netease.com',
    'app_host':               'https://hubble.netease.com',
    'autotrack':              false,
    'cdn':                    'https://hubble.netease.com',
    'cross_subdomain_cookie': false,
    'persistence':            'localStorage',
    'persistence_name':       '',
    'cookie_name':            '',
    'loaded':                 function() {},
    'store_google':           true,
    'test':                   false,
    'verbose':                false,
    'img':                    false,
    'method':                 'get',
    'track_pageview':         true,
    'debug':                  false,
    'track_links_timeout':    300,
    'cookie_expiration':      36500,  //36500
    'upgrade':                false,
    'disable_persistence':    false,
    'disable_cookie':         false,
    'secure_cookie':          false,
    'ip':                     true,
    'property_blacklist':     [],
    'session_interval_mins':  30,
    'is_single_page':          false,
    //mode: hash、history、memoryhistory（不支持）
    'single_page_config':     {
        mode: 'hash',
        track_replace_state: false
    },
    //pageview，默认自动触发
    'pageview':              true,
    //h5和native打通配置，默认为false
    'use_app_track':         false,
    // 在hubble平台内跳转到第三方网页，启动渲染模式不发数据
    'hubble_render_mode': false,
    //热力图引入的js地址
    'heatmap_url' : 'https://hubble.netease.com/track/w/heatmap/heatmap.js',
    //拉取热力图请求地址
    'heatmap_getdata_host': 'https://hubble.netease.com',
    // 发送数据异常上报开关，默认为false
    'send_error': false,
    // 在hubble平台中，控制js文件的路径
    'control_js_url': 'https://hubble.netease.com/track/w/control/control.js',
    // 可视化实验编辑js文件路径
    'visualization_editor_js_url': 'https://hubble.netease.com/track/w/visualization/visualization.js',
    // 截取字段，-1 表示不截取 默认截取
    'truncateLength': 255,
    'commonCookie': true,
    "campaigin": {
        useHour: false, // 默认使用天
        day: 30,
        hour: 30 * 24
        //keepCachedUtm: false // 默认一直用最新的推广信息，设置为true，不更新本地已存在的推广信息
    }
};

//默认事件类型
var DATATYPE = 'e';

//内置事件列表
var DEFAULTEVENTID = {
    //表示会话开始事件
    'da_session_start': {
        'dataType': 'ie'
    },
    //表示会话结束事件
    'da_session_close': {
        'dataType': 'ie'
    },
    //通过用户登陆传入的 userId 信息来映射设备 ID, 用户登出事件
    'da_u_login': {
        'dataType': 'ie'
    },
    //用户登录事件
    'da_u_logout': {
        'dataType': 'ie'
    },
    //用户 ID 关联 绑定输入的 newUserId 和已有 userID，用户注册等同一用户 userId 变动场景。
    'da_u_signup': {
        'dataType': 'ie'
    },
    //用户属性设置内部事件
    'da_user_profile': {
        'dataType': 'ie'
    },
    //页面浏览事件，浏览是一大类用户交互集合，设计特定 dataType = “pv”
    'da_screen': {
        'dataType': 'pv'
    },
    //广告点击事件
    'da_ad_click': {
        'dataType': 'ie'
    },
    //应用激活事件，应用第一次打开时发送
    'da_activate': {
        'dataType': 'ie'
    },
    //abtest事件
    'da_abtest': {
        'dataType': 'ie'
    },
    // 发送数据异常错误
    'da_send_error': {
        'dataType': 'ie'
    }
};

var DOM_LOADED = false;

/**
 * DomTracker Object
 * @constructor
 */
var DomTracker = function() {};

// interface
DomTracker.prototype.create_properties = function() {};
DomTracker.prototype.event_handler = function() {};
DomTracker.prototype.after_track_handler = function() {};

DomTracker.prototype.init = function(mixpanel_instance) {
    this.mp = mixpanel_instance;
    return this;
};

/**
 * @param {Object|string} query
 * @param {string} event_name
 * @param {Object=} properties
 * @param {function(...[*])=} user_callback
 */
DomTracker.prototype.track = function(query, event_name, properties, user_callback) {
    var that = this;
    var elements = _.dom_query(query);

    if (elements.length === 0) {
        console.error('The DOM query (' + query + ') returned 0 elements');
        return;
    }

    _.each(elements, function(element) {
        _.register_event(element, this.override_event, function(e) {
            var options = {};
            var props = that.create_properties(properties, this);
            var timeout = that.mp.get_config('track_links_timeout');

            that.event_handler(e, this, options);

            // in case the DATracker servers don't get back to us in time
            window.setTimeout(that.track_callback(user_callback, props, options, true), timeout);

            // fire the tracking event
            that.mp.track(event_name, props, that.track_callback(user_callback, props, options));
        });
    }, this);

    return true;
};

/**
 * @param {function(...[*])} user_callback
 * @param {Object} props
 * @param {boolean=} timeout_occured
 */
DomTracker.prototype.track_callback = function(user_callback, props, options, timeout_occured) {
    timeout_occured = timeout_occured || false;
    var that = this;

    return function() {
        // options is referenced from both callbacks, so we can have
        // a 'lock' of sorts to ensure only one fires
        if (options.callback_fired) { return; }
        options.callback_fired = true;

        if (user_callback && user_callback(timeout_occured, props) === false) {
            // user can prevent the default functionality by
            // returning false from their callback
            return;
        }

        that.after_track_handler(props, options, timeout_occured);
    };
};

DomTracker.prototype.create_properties = function(properties, element) {
    var props;

    if (typeof(properties) === 'function') {
        props = properties(element);
    } else {
        props = _.extend({}, properties);
    }

    return props;
};

/**
 * LinkTracker Object
 * @constructor
 * @extends DomTracker
 */
var LinkTracker = function() {
    this.override_event = 'click';
};
_.inherit(LinkTracker, DomTracker);

LinkTracker.prototype.create_properties = function(properties, element) {
    var props = LinkTracker.superclass.create_properties.apply(this, arguments);

    if (element.href) { props['url'] = element.href; }

    return props;
};

LinkTracker.prototype.event_handler = function(evt, element, options) {
    options.new_tab = (
        evt.which === 2 ||
        evt.metaKey ||
        evt.ctrlKey ||
        element.target === '_blank'
    );
    options.href = element.href;

    if (!options.new_tab) {
        evt.preventDefault();
    }
};

LinkTracker.prototype.after_track_handler = function(props, options) {
    if (options.new_tab) { return; }

    setTimeout(function() {
        window.location = options.href;
    }, 0);
};

/**
 * DATracker Persistence Object
 * @constructor
 */
var DATrackerPersistence = function(config) {
    this['props'] = {};

    if (config['persistence_name']) {
        this.name = 'mp_' + config['persistence_name'];
    } else {
        this.name = 'mp_' + config['token'] + '_hubble';
    }

    var storage_type = config['persistence'];
    if (storage_type !== 'cookie' && storage_type !== 'localStorage') {
        console.critical('Unknown persistence type ' + storage_type + '; falling back to cookie');
        storage_type = config['persistence'] = 'cookie';
    }

    var localStorage_supported = function() {
        var supported = true;
        try {
            var key = '__hbssupport__',
                val = 'xyz';
            _.localStorage.set(key, val);
            if (_.localStorage.get(key) !== val) {
                supported = false;
            }
            _.localStorage.remove(key);
        } catch (err) {
            supported = false;
        }
        if (!supported) {
            console.error('localStorage unsupported; falling back to cookie store');
        }
        return supported;
    };
    if (storage_type === 'localStorage' && localStorage_supported()) {
        this.storage = _.localStorage;
    } else {
        this.storage = _.cookie;
    }

    this.load();
    this.update_config(config);
    this.upgrade(config);
    this.save();
};

DATrackerPersistence.prototype.properties = function() {
    var p = {};
    // Filter out reserved properties
    _.each(this['props'], function(v, k) {
        if (!_.include(RESERVED_PROPERTIES, k)) {
            p[k] = v;
        }
    });
    return p;
};

DATrackerPersistence.prototype.load = function() {
    if (this.disabled) { return; }

    var entry = this.storage.parse(this.name);

    if (entry) {
        this['props'] = _.extend({}, entry);
    }
};

DATrackerPersistence.prototype.upgrade = function(config) {
    var upgrade_from_old_lib = config['upgrade'],
        old_cookie_name,
        old_cookie;

    if (upgrade_from_old_lib) {
        old_cookie_name = 'mp_super_properties';
        // Case where they had a custom cookie name before.
        if (typeof(upgrade_from_old_lib) === 'string') {
            old_cookie_name = upgrade_from_old_lib;
        }

        old_cookie = this.storage.parse(old_cookie_name);

        // remove the cookie
        this.storage.remove(old_cookie_name);
        this.storage.remove(old_cookie_name, true);

        if (old_cookie) {
            this['props'] = _.extend(
                this['props'],
                old_cookie['all'],
                old_cookie['events']
            );
        }
    }

    if (!config['cookie_name'] && config['name'] !== 'DATracker') {
        // special case to handle people with cookies of the form
        // mp_TOKEN_INSTANCENAME from the first release of this library
        old_cookie_name = 'mp_' + config['token'] + '_' + config['name'];
        old_cookie = this.storage.parse(old_cookie_name);

        if (old_cookie) {
            this.storage.remove(old_cookie_name);
            this.storage.remove(old_cookie_name, true);

            // Save the prop values that were in the cookie from before -
            // this should only happen once as we delete the old one.
            this.register_once(old_cookie);
        }
    }

    if (this.storage === _.localStorage) {
        old_cookie = _.cookie.parse(this.name);

        _.cookie.remove(this.name);
        _.cookie.remove(this.name, true);

        if (old_cookie) {
            this.register_once(old_cookie);
        }
    }

    // 是cookie方式存储
    if (this.storage === _.cookie) {
        old_cookie = _.localStorage.parse(this.name);

        _.localStorage.remove(this.name);

        if (old_cookie) {
            this.register_once(old_cookie);
        }
    }
};

DATrackerPersistence.prototype.save = function() {
    if (this.disabled) { return; }
    this.storage.set(
        this.name,
        _.JSONEncode(this['props']),
        this.expire_days,
        this.cross_subdomain,
        this.secure
    );
};

DATrackerPersistence.prototype.remove = function() {
    // remove both domain and subdomain cookies
    this.storage.remove(this.name, false);
    this.storage.remove(this.name, true);
};

// removes the storage entry and deletes all loaded data
// forced name for tests
DATrackerPersistence.prototype.clear = function() {
    this.remove();
    this['props'] = {};
};

/**
 * @param {Object} props
 * @param {*=} default_value
 * @param {number=} days
 */
DATrackerPersistence.prototype.register_once = function(props, default_value, days) {
    if (_.isObject(props)) {
        if (typeof(default_value) === 'undefined') { default_value = 'None'; }
        this.expire_days = (typeof(days) === 'undefined') ? this.default_expiry : days;

        _.each(props, function(val, prop) {
            if (!this['props'][prop] || this['props'][prop] === default_value) {
                this['props'][prop] = val;
            }
        }, this);

        this.save();

        return true;
    }
    return false;
};

/**
 * @param {Object} props
 * @param {number=} days
 */
DATrackerPersistence.prototype.register = function(props, days) {
    if (_.isObject(props)) {
        this.expire_days = (typeof(days) === 'undefined') ? this.default_expiry : days;

        _.extend(this['props'], props);

        this.save();

        return true;
    }
    return false;
};

DATrackerPersistence.prototype.unregister = function(prop) {
    if (prop in this['props']) {
        delete this['props'][prop];
        this.save();
    }
};


// safely fills the passed in object with stored properties,
// does not override any properties defined in both
// returns the passed in object
DATrackerPersistence.prototype.safe_merge = function(props) {
    _.each(this['props'], function(val, prop) {
        if (!(prop in props)) {
            props[prop] = val;
        }
    });

    return props;
};

DATrackerPersistence.prototype.update_config = function(config) {
    this.default_expiry = this.expire_days = config['cookie_expiration'];
    this.set_disabled(config['disable_persistence']);
    this.set_cross_subdomain(config['cross_subdomain_cookie']);
    this.set_secure(config['secure_cookie']);
};

DATrackerPersistence.prototype.set_disabled = function(disabled) {
    this.disabled = disabled;
    if (this.disabled) {
        this.remove();
    }
};

DATrackerPersistence.prototype.set_cross_subdomain = function(cross_subdomain) {
    if (cross_subdomain !== this.cross_subdomain) {
        this.cross_subdomain = cross_subdomain;
        this.remove();
        this.save();
    }
};

DATrackerPersistence.prototype.get_cross_subdomain = function() {
    return this.cross_subdomain;
};

DATrackerPersistence.prototype.set_secure = function(secure) {
    if (secure !== this.secure) {
        this.secure = secure ? true : false;
        this.remove();
        this.save();
    }
};

DATrackerPersistence.prototype._add_to_people_queue = function(queue, data) {
    var q_key = this._get_queue_key(queue),
        q_data = data[queue],
        set_q = this._get_or_create_queue(SET_ACTION),
        set_once_q = this._get_or_create_queue(SET_ONCE_ACTION),
        add_q = this._get_or_create_queue(ADD_ACTION),
        union_q = this._get_or_create_queue(UNION_ACTION),
        append_q = this._get_or_create_queue(APPEND_ACTION, []);

    if (q_key === SET_QUEUE_KEY) {
        // Update the set queue - we can override any existing values
        _.extend(set_q, q_data);
        // if there was a pending increment, override it
        // with the set.
        this._pop_from_people_queue(ADD_ACTION, q_data);
        // if there was a pending union, override it
        // with the set.
        this._pop_from_people_queue(UNION_ACTION, q_data);
    } else if (q_key === SET_ONCE_QUEUE_KEY) {
        // only queue the data if there is not already a set_once call for it.
        _.each(q_data, function(v, k) {
            if (!(k in set_once_q)) {
                set_once_q[k] = v;
            }
        });
    } else if (q_key === ADD_QUEUE_KEY) {
        _.each(q_data, function(v, k) {
            // If it exists in the set queue, increment
            // the value
            if (k in set_q) {
                set_q[k] += v;
            } else {
                // If it doesn't exist, update the add
                // queue
                if (!(k in add_q)) {
                    add_q[k] = 0;
                }
                add_q[k] += v;
            }
        }, this);
    } else if (q_key === UNION_QUEUE_KEY) {
        _.each(q_data, function(v, k) {
            if (_.isArray(v)) {
                if (!(k in union_q)) {
                    union_q[k] = [];
                }
                // We may send duplicates, the server will dedup them.
                union_q[k] = union_q[k].concat(v);
            }
        });
    } else if (q_key === APPEND_QUEUE_KEY) {
        append_q.push(q_data);
    }

    console.log('打印数据:');
    console.log(data);

    this.save();
};

DATrackerPersistence.prototype._pop_from_people_queue = function(queue, data) {
    var q = this._get_queue(queue);
    if (!_.isUndefined(q)) {
        _.each(data, function(v, k) {
            delete q[k];
        }, this);

        this.save();
    }
};

DATrackerPersistence.prototype._get_queue_key = function(queue) {
    if (queue === SET_ACTION) {
        return SET_QUEUE_KEY;
    } else if (queue === SET_ONCE_ACTION) {
        return SET_ONCE_QUEUE_KEY;
    } else if (queue === ADD_ACTION) {
        return ADD_QUEUE_KEY;
    } else if (queue === APPEND_ACTION) {
        return APPEND_QUEUE_KEY;
    } else if (queue === UNION_ACTION) {
        return UNION_QUEUE_KEY;
    } else {
        console.error('Invalid queue:', queue);
    }
};

DATrackerPersistence.prototype._get_queue = function(queue) {
    return this['props'][this._get_queue_key(queue)];
};
DATrackerPersistence.prototype._get_or_create_queue = function(queue, default_val) {
    var key = this._get_queue_key(queue);
    default_val = _.isUndefined(default_val) ? {} : default_val;

    return this['props'][key] || (this['props'][key] = default_val);
};

DATrackerPersistence.prototype.set_event_timer = function(event_name, timestamp) {
    var timers = this['props'][EVENT_TIMERS_KEY] || {};
    timers[event_name] = timestamp;
    this['props'][EVENT_TIMERS_KEY] = timers;
    this.save();
};

DATrackerPersistence.prototype.remove_event_timer = function(event_name) {
    var timers = this['props'][EVENT_TIMERS_KEY] || {};
    var timestamp = timers[event_name];
    if (!_.isUndefined(timestamp)) {
        delete this['props'][EVENT_TIMERS_KEY][event_name];
        this.save();
    }
    return timestamp;
};

/**
 * DATracker Library Object
 * @constructor
 */
var DATrackerLib = function() {};

/**
 * DATracker People Object
 * @constructor
 */
var DATrackerPeople = function() {};

var DATrackerABtest = abtest;



/**
 * create_DAlib(token:string, config:object, name:string)
 *
 * This function is used by the init method of DATrackerLib objects
 * as well as the main initializer at the end of the JSLib (that
 * initializes document.DATracker as well as any additional instances
 * declared before this file has loaded).
 */
var create_DAlib = function(token, config, name) {
    var instance,
        target = (name === PRIMARY_INSTANCE_NAME) ? DATracker_master : DATracker_master[name];

    if (target && init_type === INIT_MODULE || target && init_type === INIT_SYNC) {
        instance = target;
    } else {
        if (target && !_.isArray(target)) {
            console.error('You have already initialized ' + name);
            return;
        }
        instance = new DATrackerLib();
    }

    instance._init(token, config, name);

    instance['people'] = new DATrackerPeople();
    instance['people']._init(instance);

    instance['abtest'] = DATrackerABtest;
    instance['abtest'].init(instance);

    // if any instance on the page has debug = true, we set the
    // global debug to be true
    Config.DEBUG = Config.DEBUG || instance.get_config('debug');

    instance['__autotrack_enabled'] = instance.get_config('autotrack');
    // if (instance.get_config('autotrack')) {
    //     var num_buckets = 100;
    //     var num_enabled_buckets = 100;
    //     if (!autotrack.enabledForProject(instance.get_config('token'), num_buckets, num_enabled_buckets)) {
    //         instance['__autotrack_enabled'] = false;
    //         console.log('Not in active bucket: disabling Automatic Event Collection.');
    //     } else if (!autotrack.isBrowserSupported()) {
    //         instance['__autotrack_enabled'] = false;
    //         console.log('Disabling Automatic Event Collection because this browser is not supported');
    //     } else {
    //         autotrack.init(instance);
    //     }

    //     try {
    //         add_dom_event_counting_handlers(instance);
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    // if target is not defined, we called init after the lib already
    // loaded, so there won't be an array of things to execute
    if (!_.isUndefined(target) && _.isArray(target)) {
        // Crunch through the people queue first - we queue this data up &
        // flush on identify, so it's better to do all these operations first
        instance._execute_array.call(instance['people'], target['people']);
        instance._execute_array(target);
        instance._execute_array.call(instance['abtest'], target['abtest']);
    }

    return instance;
};

// Initialization methods

/**
 * This function initializes a new instance of the DATracker tracking object.
 * All new instances are added to the main DATracker object as sub properties (such as
 * DATracker.library_name) and also returned by this function. To define a
 * second instance on the page, you would call:
 *
 *     DATracker.init('new token', { your: 'config' }, 'library_name');
 *
 * and use it like so:
 *
 *     DATracker.library_name.track(...);
 *
 * @param {String} token   Your DATracker API token
 * @param {Object} [config]  A dictionary of config options to override
 * @param {String} [name]    The name for the new DATracker instance that you want created
 */
DATrackerLib.prototype.init = function (token, config, name) {
    if (_.isUndefined(name)) {
        console.error('You must name your new library: init(token, config, name)');
        return;
    }
    if (name === PRIMARY_INSTANCE_NAME) {
        console.error('You must initialize the main DATracker object right after you include the DATracker js snippet');
        return;
    }

    var instance = create_DAlib(token, config, name);
    DATracker_master[name] = instance;
    instance._loaded();

    return instance;
};

DATrackerLib.prototype.oxpecker_init = function (appKey, config = {}) {
    if (appKey) {
        oxpeckerSDK.setAppKey(appKey);
    }

    oxpeckerSDK.updateConfig(config);
};


DATrackerLib.prototype.oxpecker_set_url = function (urls = {}) {
    oxpeckerSDK.setUrl(urls);
};


DATrackerLib.prototype.oxpecker_update_config = function (config) {
    oxpeckerSDK.flush();
    oxpeckerSDK.updateConfig(config);
};


DATrackerLib.prototype.oxpecker_remove_config = function (key) {
    oxpeckerSDK.flush();
    oxpeckerSDK.removeConfigByKey(key);
};


DATrackerLib.prototype.oxpecker_set_token = function (token) {
    if (typeof token === 'string' && token.length > 0) {
        oxpeckerSDK.setToken(token);
    }
};

DATrackerLib.prototype.oxpecker_flush = function () {
    oxpeckerSDK.flush();
};


DATrackerLib.prototype.oxpecker_set_product_profile = function (config) {
    oxpeckerSDK.flush();
    oxpeckerSDK.setProductProfile(config);
};

DATrackerLib.prototype.oxpecker_send_by_beacon = function () {
    oxpeckerSDK.sendByBeacon();
}

DATrackerLib.prototype.oxpecker_set_base_attributes = function (base) {
    oxpeckerSDK.configBaseAttributes(base);
}

DATrackerLib.prototype.oxpecker_config_sdk = function (option) {
    oxpeckerSDK.configSDK(option);
}

DATrackerLib.prototype.oxpecker_set_host = function (host) {
    oxpeckerSDK.setHost(host);
}

// DATracker._init(token:string, config:object, name:string)
//
// This function sets up the current instance of the DATracker
// library.  The difference between this method and the init(...)
// method is this one initializes the actual instance, whereas the
// init(...) method sets up a new library and calls _init on it.
//
DATrackerLib.prototype._init = function(token, config, name) {
    var _self = this;
    _self['__loaded'] = true;
    _self['config'] = {};
    if(typeof config !== 'undefined') {
        if(typeof config.single_page_config !== 'undefined') {
            if(typeof config.single_page_config.track_replace_state === 'undefined') {
                config.single_page_config.track_replace_state = DEFAULT_CONFIG.single_page_config.track_replace_state;
            }
        }
    }

    _self['pageOpenScene'] = 'Browser';

    _self.set_config(_.extend({}, DEFAULT_CONFIG, config, {
        'name': name,
        'token': token,
        'callback_fn': ((name === PRIMARY_INSTANCE_NAME) ? name : PRIMARY_INSTANCE_NAME + '.' + name) + '._jsc'
    }));
    //外部来源
    source.init(token);
    //渠道推广初始化
    campaign.init(token, this);

    _self['_jsc'] = function() {};

    _self.__dom_loaded_queue = [];
    _self.__request_queue = [];
    _self.__disabled_events = [];
    _self._flags = {
        'disable_all_events': false
    };

    _self['persistence'] = _self['cookie'] = new DATrackerPersistence(_self['config']);

    _self['cookie'].register({
        sessionReferrer: document.referrer
    });
    _self['cookie'].register_once({
        updatedTime: 0,
        sessionStartTime: 0
    });
    // 当前会话内发送数据数记录
    _self['cookie'].register_once({
        sendNumClass: {
            allNum: 0,
            errSendNum: 0
        }
    });
    _self.commonCookie = commonCookie;

    var heatmapConfig =  _self.get_config('heatmap');

    if(_.isObject(heatmapConfig)) {
        heatmapConfig.clickmap = heatmapConfig.clickmap || 'default';
    }


    //打通app与h5
    var bridegObj = app_js_bridge(_self);
    //获取native传递给客户端数据
    _self.get_appStatus = function(func) {
        var callback = function(app_info) {
            try{
                if(typeof func === 'function') {
                    func(app_info);
                }
            } catch(e){}
        };
        bridegObj.getAppStatus(callback);
    };
    //发送数据到native
    _self._get_SendCall = function(data, event_name, callback, jsTrack) {
        if(_self.get_config('hubble_render_mode')) {
            return false;
        }
        bridegObj.getSendCall(data, event_name, callback, jsTrack);
    };

    heatmap.init(_self, function() {
        // 判断是否进入abtest调试或进入可视化编辑，是的话，不允许上报数据给服务端
        if (DATrackerABtest.isTestDebug() || DATrackerABtest.isEditor()) {
            _self.set_config({hubble_render_mode: true});
        } else {
            _self.set_config({hubble_render_mode: false});
        }
        _self._loaded();
        _self._send_da_activate();

        //发送广告点击事件
        if(campaign.data.isAdClick) {
            _self._ad_click();
        }
        //启动单页面，修改 referrer
        if(_self.get_config('is_single_page')) {
            _self['cookie'].register({
                currentReferrer: decodeURIComponent(location.href)
            });
            _self._single_page();
        }

        if (_self.get_config('track_pageview')) {
            _self.track_pageview();
        } else {
            _self._session();
        }
    });
};

/**
 * 数据发送到native
 */
DATrackerLib.prototype._sendNativeCall = function(data, event_name, callback, jsTrack) {
    if(this.get_config('use_app_track')) {
        if(typeof this._get_SendCall === 'function') {
            this._get_SendCall(data, event_name, callback, jsTrack);
        }
    }
};

/**
 * 发送广告点击事件
 */
DATrackerLib.prototype._ad_click = function() {
    var data = this.track('da_ad_click');
    return data;
};

/**
 * @method this._session();
 * @param {Function} pvCallback 执行pv事件的回调
 */
DATrackerLib.prototype._session = function(pvCallback) {
    var sessionStartTime = 1 * this['cookie'].props.sessionStartTime / 1000;
    var updatedTime = 1 * this['cookie'].props.updatedTime / 1000;
    var sessionUuid = this['cookie'].props.sessionUuid;
    //当前时间转换为秒
    var nowDateTime = new Date().getTime();
    var nowDate = 1 * nowDateTime / 1000;
    //其它渠道
    var otherWBool = !this._check_referer();
    //session结束
    if( sessionStartTime == 0 || nowDate > updatedTime + 60 * this.config.session_interval_mins || otherWBool) {
        if(sessionStartTime == 0) {
           //会话开始
            this['cookie'].register({
                sessionUuid: _.UUID(),
                sessionStartTime: new Date().getTime()
            });
            this._track_da_session_start();
        } else {
            this._track_da_session_close();
            this['cookie'].register({
                sessionUuid: _.UUID(),
                sessionStartTime: new Date().getTime()
            });
            this._track_da_session_start()
        }
    }

    this['cookie'].register({
        updatedTime: nowDateTime
    });
    if(typeof pvCallback === 'function') {
        pvCallback();
    }
};
/**
 * @method this._track_da_session_start()
 */
DATrackerLib.prototype._track_da_session_start = function(page) {
    var data = this.track('da_session_start');
    return data;
};
/**
 * @method this._track_da_session_close()
 */
DATrackerLib.prototype._track_da_session_close = function(page) {
    // var LASTEVENT = this.cookie.props.LASTEVENT || {
    //     time: new Date().getTime(),
    //     eventId: ''
    // };
    //为了便于绘制轨迹图，区分 close和最后一次事件触发时间的顺序，做处理
    // 1. 如果本地拿到了上次（非会话事件）事件的触发时间，time = this.cookie.props.LASTEVENT.time + 1;
    // 2. 如果未拿到，time = new Date().getTime() - 1;
    var time = new Date().getTime() - 1;
    var sessionStartTime = this.cookie.props.sessionStartTime;
    if(this.cookie.props.LASTEVENT && this.cookie.props.LASTEVENT.time) {
        time = this.cookie.props.LASTEVENT.time + 1;
    }
    var sessionCloseTime =  time;
    var sessionTotalLength = sessionCloseTime - sessionStartTime;
    var data = this.track('da_session_close', {
        sessionCloseTime: sessionCloseTime,
        sessionTotalLength: sessionTotalLength
    });
    return data;
};
/**
 * @method _check_referer
 */
DATrackerLib.prototype._check_referer = function() {
    var referrer = this.cookie.props.sessionReferrer;
    var bool = true;
    //直接打开
    if(!referrer) {
        bool = true;
    } else {
        //跳转过来
        // var domain = document.domain;
        // if(window.location.port) {
        //     domain += ':' + window.location.port;
        // }
        // 若当前存储的方式是cookie，且支持跨二级域
        if (this.get_config('persistence') === 'cookie' && this.get_config('cross_subdomain_cookie')) {
            if(_.get_second_domain(_.get_host(referrer)) != _.get_second_domain(window.location.host)) {
                bool = false;
            }
        } else {
            if(_.get_host(referrer) != window.location.host) {
                bool = false;
            }
        }
    }
    return bool;
};
/**
 * @method _single_page()
 */
DATrackerLib.prototype._single_page = function() {
    var _self = this;
    var current_page_url = decodeURIComponent(location.href);
    var callback_fn = function() {};
    var change = function() {
        _.innerEvent.trigger('singlePage:change');
    };
    if(this.get_config('single_page_config').mode === 'hash') {
        callback_fn = function() {
            _self['cookie'].register({
                sessionReferrer: current_page_url
            });
            _self._single_pageview();
            current_page_url = decodeURIComponent(location.href);
            change();
        };
    } else if(this.get_config('single_page_config').mode === 'history') {
        callback_fn = function() {
            _self._single_pageview();
            change();
        };
    }

    single_page.init({
        mode: this.get_config('single_page_config').mode,
        callback_fn: callback_fn,
        track_replace_state: this.get_config('single_page_config').track_replace_state
    });
};

// Private methods

DATrackerLib.prototype._loaded = function() {
    this._ = _;
    this.get_config('loaded')(this);
};

DATrackerLib.prototype._dom_loaded = function() {
    _.each(this.__dom_loaded_queue, function(item) {
        this._track_dom.apply(this, item);
    }, this);
    _.each(this.__request_queue, function(item) {
        this._send_request.apply(this, item);
    }, this);
    delete this.__dom_loaded_queue;
    delete this.__request_queue;
};

DATrackerLib.prototype._track_dom = function(DomClass, args) {
    if (this.get_config('img')) {
        console.error('You can\'t use DOM tracking functions with img = true.');
        return false;
    }

    if (!DOM_LOADED) {
        this.__dom_loaded_queue.push([DomClass, args]);
        return false;
    }

    var dt = new DomClass().init(this);
    return dt.track.apply(dt, args);
};

/**
 * _prepare_callback() should be called by callers of _send_request for use
 * as the callback argument.
 *
 * If there is no callback, this returns null.
 * If we are going to make XHR/XDR requests, this returns a function.
 * If we are going to use script tags, this returns a string to use as the
 * callback GET param.
 */
DATrackerLib.prototype._prepare_callback = function(callback, data) {
    if (_.isUndefined(callback)) {
        return null;
    }

    if (USE_XHR) {
        var callback_function = function(response) {
            callback(response, data);
        };
        return callback_function;
    } else {
        // if the user gives us a callback, we store as a random
        // property on this instances jsc function and update our
        // callback string to reflect that.
        var jsc = this['_jsc'];
        var randomized_cb = '' + Math.floor(Math.random() * 100000000);
        var callback_string = this.get_config('callback_fn') + '[' + randomized_cb + ']';
        jsc[randomized_cb] = function(response) {
            delete jsc[randomized_cb];
            callback(response, data);
        };
        return callback_string;
    }
};
//触发  method 可有，可不有，get 还是 post 方式
DATrackerLib.prototype._send_request = function(url, data, callback, errorFn, otherFn, method) {
    if (ENQUEUE_REQUESTS) {
        this.__request_queue.push(arguments);
        return;
    }

    if (method === 'post' || this.get_config('method') === 'post') {
       this._send_request_post(url, data, callback, errorFn, otherFn);
       return;
    }

    // needed to correctly format responses
    var verbose_mode = this.get_config('verbose');
    if (data['verbose']) { verbose_mode = true; }

    if (this.get_config('test')) { data['test'] = 1; }
    if (verbose_mode) { data['verbose'] = 1; }
    if (this.get_config('img')) {
        data['img'] = 1;
        url += 'da.gif';
    }
    if (!USE_XHR) {
        if (callback) {
            data['callback'] = callback;
        } else if (verbose_mode || this.get_config('test')) {
            // Verbose output (from verbose mode, or an error in test mode) is a json blob,
            // which by itself is not valid javascript. Without a callback, this verbose output will
            // cause an error when returned via jsonp, so we force a no-op callback param.
            // See the ECMA script spec: http://www.ecma-international.org/ecma-262/5.1/#sec-12.4
            data['callback'] = '(function(){})';
        }
    }


    //data['ip'] = this.get_config('ip')?1:0;
    data['_'] = new Date().getTime().toString();
    url += '?' + _.HTTPBuildQuery(data);

    if ('img' in data) {
        var img = document.createElement('img');
        img.src = url;
        img.width = 1;
        img.height = 1;
        if (typeof callback === 'function') {
            callback(0);
        }
        img.onload = function() {
            this.onload = null;
        };
        img.onerror = function() {
            this.onerror = null;
        };
        img.onabort = function() {
            this.onabort = null;
        };
    } else if (USE_XHR) {
        try {
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.withCredentials = false;
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (otherFn) {
                        otherFn();
                    }
                    if (req.status === 200) {
                        if (callback) {
                            if (verbose_mode) {
                                callback(_.JSONDecode(req.responseText));
                            } else {
                                callback(Number(req.responseText));
                            }
                        }
                    } else {
                        var error = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                        console.error(error);
                        if (callback) {
                            if (verbose_mode) {
                                callback({status: 0, error: error});
                            } else {
                                callback(0);
                            }
                        }
                        if (errorFn) {
                            errorFn({
                                state: req.status,
                                statusText: req.statusText
                            });
                        }
                    }
                }
            };
            req.send(null);
        } catch (e) {
            console.error(e);
            if (otherFn) {
                otherFn();
            }
            if (errorFn) {
                errorFn({
                    state: 'notSend',
                    statusText: e
                });
            }
        }
    } else {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = url;
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
    }
};

//触发-post方式---
DATrackerLib.prototype._send_request_post = function(url, data, callback, errorFn, otherFn) {
    if (!USE_XHR) {
        return;
    }
    try {
        var req = new XMLHttpRequest();
        req.open('POST', url, true);
        req.withCredentials = false;
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (otherFn) {
                    otherFn();
                }
                if (req.status === 200) {
                    if (callback) {
                        callback(Number(req.responseText));
                    }
                } else {
                    var error = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                    console.error(error);
                    if (callback) {
                        callback(0);
                    }
                    if (errorFn) {
                        errorFn({
                            state: req.status,
                            statusText: req.statusText
                        });
                    }
                }
            }
        };
        data['_'] = new Date().getTime().toString();
        req.send(_.HTTPBuildQuery(data));
    } catch (e) {
        console.error(e);
        if (otherFn) {
            otherFn();
        }
        if (errorFn) {
            errorFn({
                state: 'notSend',
                statusText: e
            });
        }
    }
};

/**
 * _execute_array() deals with processing any DATracker function
 * calls that were called before the DATracker library were loaded
 * (and are thus stored in an array so they can be called later)
 *
 * Note: we fire off all the DATracker function calls && user defined
 * functions BEFORE we fire off DATracker tracking calls. This is so
 * identify/register/set_config calls can properly modify early
 * tracking calls.
 *
 * @param {Array} array
 */
DATrackerLib.prototype._execute_array = function(array) {
    var fn_name, alias_calls = [], other_calls = [], tracking_calls = [];
    _.each(array, function(item) {
        if (item) {
            fn_name = item[0];
            if (typeof(item) === 'function') {
                item.call(this);
            } else if (_.isArray(item) && fn_name === 'alias') {
                alias_calls.push(item);
            } else if (_.isArray(item) && fn_name.indexOf('track') !== -1 && typeof(this[fn_name]) === 'function') {
                tracking_calls.push(item);
            } else {
                other_calls.push(item);
            }
        }
    }, this);

    var execute = function(calls, context) {
        _.each(calls, function(item) {
            if(_.isFunction(this[item[0]])) {
                this[item[0]].apply(this, item.slice(1));
            }
        }, context);
    };

    execute(alias_calls, this);
    execute(other_calls, this);
    execute(tracking_calls, this);
};

/**
 * push() keeps the standard async-array-push
 * behavior around after the lib is loaded.
 * This is only useful for external integrations that
 * do not wish to rely on our convenience methods
 * (created in the snippet).
 *
 * ### Usage:
 *     DATracker.push(['register', { a: 'b' }]);
 *
 * @param {Array} item A [function_name, args...] array to be executed
 */
DATrackerLib.prototype.push = function(item) {
    this._execute_array([item]);
};

/**
 * Disable events on the DATracker object. If passed no arguments,
 * this function disables tracking of any event. If passed an
 * array of event names, those events will be disabled, but other
 * events will continue to be tracked.
 *
 * Note: this function does not stop other DATracker functions from
 * firing, such as register() or people.set().
 *
 * @param {Array} [events] An array of event names to disable
 */
DATrackerLib.prototype.disable = function(events) {
    if (typeof(events) === 'undefined') {
        this._flags.disable_all_events = true;
    } else {
        this.__disabled_events = this.__disabled_events.concat(events);
    }
};

/**
 * Track an event. This is the most important and
 * frequently used DATracker function.
 *
 * ### Usage:
 *
 *     // track an event named 'Registered'
 *     DATracker.track('Registered', {'Gender': 'Male', 'Age': 21});
 *
 * To track link clicks or form submissions, see track_links() or track_forms().
 *
 * @param {String} event_name The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc.
 * @param {Object} [properties] A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself.
 * @param {Function} [callback] If provided, the callback function will be called after tracking the event.
 * setData_type datatype 类型
 * method 上报数据的方式 get post
 */
DATrackerLib.prototype.track = function(event_name, properties, callback, setData_type, method) {
    var nowMethod = method || this.get_config('method')
    if (typeof(callback) !== 'function') {
        callback = function() {};
    }

    if (_.isUndefined(event_name)) {
        console.error('No event name provided to DATracker.track');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        callback(0);
        return;
    }
    this['cookie'].load();

    // set defaults
    properties = properties || {};
    var otherProperties = {};
    //用户自定义属性
    var userSetProperties = {};
    if (nowMethod === 'post') {
        userSetProperties = JSON.parse(JSON.stringify(properties));
    } else {
        userSetProperties = _.JSONDecode(_.JSONEncode(properties));
    }


    // set EVENT_TIMERS_KEY if time_event was previously called for this event
    var start_timestamp = this['persistence'].remove_event_timer(event_name);
    if (!_.isUndefined(start_timestamp)) {
        var duration_in_ms = new Date().getTime() - start_timestamp;
        otherProperties[EVENT_TIMERS_KEY] = duration_in_ms;
    }

    // note: extend writes to the first object, so lets make sure we
    // don't write to the persistence properties object and info
    // properties object by passing in a new object

    // update properties with pageview info and super-properties

    //自定义属性中删除不需要的属性
    if( event_name == 'da_session_close' ) {
        otherProperties['sessionCloseTime'] = userSetProperties['sessionCloseTime'];
        otherProperties['sessionTotalLength'] = userSetProperties['sessionTotalLength'];
        delete userSetProperties['sessionCloseTime'];
        delete userSetProperties['sessionTotalLength'];
    }

    properties = _.extend(
        {},
        _.info.properties(),
        this['persistence'].properties(),
        otherProperties
    );

    var property_blacklist = this.get_config('property_blacklist');
    if (_.isArray(property_blacklist)) {
        _.each(property_blacklist, function(blacklisted_prop) {
            delete properties[blacklisted_prop];
        });
    } else {
        console.error('Invalid value for property_blacklist config: ' + property_blacklist);
    }
    var data_type = DATATYPE;
    //如果是内置事件,事件类型重新设置
    if(DEFAULTEVENTID[event_name]) {
        data_type = DEFAULTEVENTID[event_name].dataType;
    } else if( setData_type ) {
        data_type = setData_type;
    }

    //当触发的事件非指定的这些事件(da_session_start,da_session_close,da_activate)，触发检测 _session() 方法
    if( !_.include(['da_session_start', 'da_session_close', 'da_activate'], event_name) ) {
        this._session();
    }

    //只有已访问页面后，sessionReferrer 重置
    //如果不是内置事件，那么 sessionReferrer 重置
    //如果是'da_activate'，那么 sessionReferrer 重置
    //解决document.referrer 当是外链时，此时触发自定义事件，引起重启一个session问题。
    if(data_type === 'e') {
        //其它渠道
        if(!this._check_referer()) {
            this['cookie'].register({
                sessionReferrer: decodeURIComponent(location.href)
            });
        }
    }
    if(!this.get_config('is_single_page')) {
        if( _.include(['da_activate','da_session_close'], event_name) ) {
            this['cookie'].register({
                sessionReferrer: decodeURIComponent(location.href)
            });
        }
    }


    //启动单页面
    //解决单页面切换时无 referrer 问题
    if(this.get_config('is_single_page')) {
        if(properties['sessionReferrer'] != properties['referrer']) {
            properties['referrer'] = properties['sessionReferrer'];
            properties['referring_domain'] = _.info.referringDomain(properties['sessionReferrer']);
        }
    }
    //时间
    var time = new Date().getTime();
    //事件为 da_session_close
    if(event_name == 'da_session_close') {
        time = properties.sessionCloseTime;
    }
    //事件为 da_session_start
    if(event_name == 'da_session_start') {
        time = properties.sessionStartTime;
    }

    this.register_once({'persistedTime': time}, '');

    var data = {
        'dataType': data_type,
        'sessionUuid': this.cookie.props.sessionUuid,
        'userId': this.persistence.props.user_id,
        'currentUrl': properties.current_url,
        'referrer': properties.referrer,
        'referrerDomain': properties.referring_domain,
        'sdkVersion': properties.lib_version,
        'sdkType': SDKTYPE,
        'deviceOs': properties.deviceOs,
        'deviceOsVersion': properties.deviceOsVersion,
        'devicePlatform': properties.hb_lib,
        'browser': properties.browser,
        'browserVersion': properties.browser_version,
        'screenWidth': properties.screen_width,
        'screenHeight': properties.screen_height,
        'sessionTotalLength': properties.sessionTotalLength,
        'eventId': event_name,
        'appKey': this.get_config('token'),
        'time': time,
        'persistedTime': this.cookie.props.persistedTime,
        'deviceUdid': this.get_distinct_id(),
        'deviceModel':  _.trim(properties.deviceModel),
        'pageTitle': properties.title,
        'urlPath': properties.url_path,
        'currentDomain': properties.currentDomain,
        'pageOpenScene': this['pageOpenScene']
    };

    var utm  = campaign.getParams();
    var secondLevelSource = source.getParams();
    data = _.extend(data, utm);
    data = _.extend(data, secondLevelSource);

    //this.cookie.props['superProperties'] 为用户设置的通用事件属性
    //当事件类型为 自定义事件，才会发送通用事件属性?。
    //if(data_type === 'e') {
    userSetProperties = _.extend({}, this.cookie.props['superProperties'] || {}, userSetProperties);
    //}
    //触发pageview时，外部设置了该pv的自定义事件属性，这里发送该自定义事件属性
    if(data_type === 'pv') {
        if(typeof this.pageview_attributes === 'object') {
            userSetProperties = _.extend({}, this.pageview_attributes || {}, userSetProperties);
        }
    }
    if (this.get_config('commonCookie')) {
        userSetProperties = _.extend({}, userSetProperties, commonCookie.getCookie() || {});
    }


    data['attributes'] = userSetProperties;

    //字段数据为空时，不必要上传
    // if(!_.size(data['attributes'])) {
    //     delete data['attributes'];
    // }
    if(!data['referrer']) {
        delete data['referrer'];
    }
    if(!data['referrerDomain']) {
        delete data['referrerDomain'];
    }
    if(!data['pageTitle']) {
        delete data['pageTitle'];
    }
    if(!data['urlPath']) {
        delete data['urlPath'];
    }
    if(!data['userId']) {
        delete data['userId'];
    }
    if(properties[EVENT_TIMERS_KEY]) {
        data[EVENT_TIMERS_KEY] = properties[EVENT_TIMERS_KEY];
        delete properties[EVENT_TIMERS_KEY];
    }

    // 在hubble平台内跳转到第三方网页，启动渲染模式不发数据
    if(this.get_config('hubble_render_mode')){
        DATrackerABtest.debugTrack(data);
        return false;
    }

    // 这里切口，加埋点数据到oxpecker，且只需要用户埋点
    try {
        if (data.dataType === 'e') {
            oxpeckerSDK.addBuffer(data);

            // 向hubble补充数据
            if (!data.attributes) {
                data.attributes = {};
            }

            const key = data.userId ?? data.deviceUdid;
            if (key) {
                const isNew = oxpeckerSDK.getIsNewInfo(key);
                data.attributes['$_isNewUser'] = isNew; 
            }

            const productProfile = oxpeckerSDK.getProductProfile() || {};
            data.attributes = {
                ...productProfile,
                ...data.attributes
            }


            if (oxpeckerSDK.disableHubbleSend()) {
                return;
            }

            if (oxpeckerSDK.isDebugMode()) {
                return;
            }
        }
    } catch(error) {
        console.error('oxpecker-sdk error: ---', error);
        oxpeckerSDK._sendErrorInfo(error);
    }

    var truncateLength = this.get_config('truncateLength');
    var truncated_data = data;
    if (Object.prototype.toString.call(truncateLength) === '[object Number]' && truncateLength> 0) {
        truncated_data = _.truncate(data, truncateLength);
    }
    var json_data      = _.JSONEncode(truncated_data);
    var encoded_data   = _.base64Encode(json_data);
    var appkey_data    = _.sha1(this.get_config('token'));
    console.log(PRIMARY_INSTANCE_NAME+' REQUEST:');
    console.log(truncated_data);

    var self = this;


    var otherFn = function() {
        var sendNumClass = self.cookie.props.sendNumClass;
        // 重新开启会话后，记录数清零
        if (event_name === 'da_session_start') {
            sendNumClass.allNum = 0;
            sendNumClass.errSendNum = 0;
        }
        if (event_name !== 'da_send_error' && event_name !== 'da_activate') {
            sendNumClass.allNum += 1;
        }
        // 保存
        self['cookie'].register({
            sendNumClass: sendNumClass
        });
    };
    // 发送数据失败时
    var errorFn = function(errObj) {
        if (event_name !== 'da_send_error' && event_name !== 'da_activate') {
            var errSendNum = self.cookie.props.sendNumClass.errSendNum;
            var allNum = self.cookie.props.sendNumClass.allNum;
            if (event_name === 'da_session_start') {
                errSendNum = 0;
            }
            errSendNum += 1;
            // 启动发送数据上报异常日志开关
            if (self.get_config('send_error')) {
                errObj = _.extend(
                    {
                        eventId: event_name,
                        time: time,
                        allNum: self.cookie.props.sendNumClass.allNum,
                        errSendNum: errSendNum
                    }, errObj);
                self.track('da_send_error', errObj);
            }
            // 保存
            self['cookie'].register({
                sendNumClass: {
                    allNum: self.cookie.props.sendNumClass.allNum,
                    errSendNum: errSendNum
                }
            });
        }
    };


    var jsTrack = function() {
        var ajaxurl = self.get_config('api_host') + self.get_config('get_path');
        if (nowMethod === 'post') {
            ajaxurl = self.get_config('api_host') + self.get_config('post_path');
        }
        self._send_request(
            ajaxurl,
            { 'data': encoded_data, 'appKey':appkey_data },
            self._prepare_callback(callback, truncated_data),
            errorFn,
            otherFn,
            nowMethod
        );
    };
    if(this.get_config('use_app_track')) {
        this._sendNativeCall(json_data, event_name, callback, jsTrack);
    } else {
        jsTrack();
    }

    //调试函数
    if(this.get_config('debug')) {
        if(_.isFunction(this.debug)) {
            if(this.get_config('use_app_track')) {
                if( !_.include(['da_session_close','da_session_start','da_activate','da_u_login','da_u_logout','da_u_signup'], event_name) ) {
                    this.debug({data: encoded_data});
                }
            } else {
                this.debug({data: encoded_data});
            }
        }
    }

    //最后一次触发的事件，解决
    //session_close 事件的时间计算
    if( !_.include(['da_session_close','da_session_start'], event_name) ) {
        this['cookie'].register({
            LASTEVENT: {
                eventId: event_name,
                time: time
            }
        });
    }

    return truncated_data;
};

/**
 * Track a page view event, which is currently ignored by the server.
 * This function is called by default on page load unless the
 * track_pageview configuration variable is false.
 *
 * @param {String} [page] The url of the page to record. If you don't include this, it defaults to the current url.
 * @api private
 */
DATrackerLib.prototype.track_pageview = function(attributes, page, call) {
    if (_.isUndefined(page)) {
        page = decodeURIComponent(document.location.href);
    }
    var self = this;
    var callback = function() {
        var data = self.track('da_screen', _.extend({}, attributes));
        if(typeof call === 'function') {
            call(data);
        }
    };
    this._session(callback);
};

/**
 * 判断是否要发送 da_activate事件
 */
DATrackerLib.prototype._send_da_activate = function() {
    var data = {};
    if(!this.get_distinct_id()) {
        this.register_once({'deviceUdid': _.UUID()}, '');
        data = this.track('da_activate');
    }
    return data;
};

/**
 * 设置事件自定义通用属性
 * 成功设置事件通用属性后，再通过 trackEvent: 追踪事件时，事件通用属性会被添加进每个事件中。
 * 重复调用 register_attributes: 会覆盖之前已设置的通用属性。
 */
DATrackerLib.prototype.register_attributes = function(attributes) {
    if(typeof attributes === 'object') {
        var superProperties = this.cookie.props['superProperties'] || {};
        superProperties = _.extend({}, superProperties, attributes);
        this.register({'superProperties': superProperties});
    }
};
/**
 * 设置事件自定义通用属性
 * 成功设置事件通用属性后，再通过 trackEvent: 追踪事件时，事件通用属性会被添加进每个事件中。
 * 不覆盖之前已经设定的通用属性。
 */
DATrackerLib.prototype.register_attributes_once = function(attributes) {
    if(typeof attributes === 'object') {
        var superProperties = this.cookie.props['superProperties'] || {};
        superProperties = _.extend({}, attributes, superProperties);
        this.register({'superProperties': superProperties});
    }
};
/**
 * 查看当前已设置的通用属性
 */
DATrackerLib.prototype.current_attributes = function(callback) {
    if(typeof callback === 'function') {
        callback(this.cookie.props['superProperties'] || {});
    }
};
/**
 * 删除一个通用属性
 */
DATrackerLib.prototype.unregister_attributes = function(propertyName) {
    if(typeof propertyName === 'string') {
        var superProperties = this.cookie.props['superProperties'] || {};
        delete superProperties[propertyName];
        this.register({'superProperties': superProperties});
    }
};
/**
 * 删除所有已设置的事件通用属性
 */
DATrackerLib.prototype.clear_attributes = function() {
    this.register({'superProperties': {}});
};

/**
 * @method single_pageview
 * 单页面的 pageview
 * 待移除
 */
DATrackerLib.prototype.single_pageview = function() {
};
/**
 * @method _single_pageview
 * 单页面的 pageview
 */
DATrackerLib.prototype._single_pageview = function() {
    var current_page_url = decodeURIComponent(location.href);
    var currentReferrer = this.cookie.props.currentReferrer || decodeURIComponent(location.href);
    if(this.get_config('is_single_page')) {
        if(this.get_config('single_page_config').mode === 'hash'
            || this.get_config('single_page_config').mode === 'history'
            || this.get_config('single_page_config').mode === 'memoryhistory'
        ) {
            this['cookie'].register({
                sessionReferrer: currentReferrer,
                currentReferrer: current_page_url
            });
        }
        this.track_pageview({},current_page_url);
    }
};

/**
 * Track clicks on a set of document elements. Selector must be a
 * valid query. Elements must exist on the page at the time track_links is called.
 *
 * ### Usage:
 *
 *     // track click for link id #nav
 *     DATracker.track_links('#nav', 'Clicked Nav Link');
 *
 * ### Notes:
 *
 * This function will wait up to 300 ms for the DATracker
 * servers to respond. If they have not responded by that time
 * it will head to the link without ensuring that your event
 * has been tracked.  To configure this timeout please see the
 * set_config() documentation below.
 *
 * If you pass a function in as the properties argument, the
 * function will receive the DOMElement that triggered the
 * event as an argument.  You are expected to return an object
 * from the function; any properties defined on this object
 * will be sent to DATracker as event properties.
 *
 * @type {Function}
 * @param {Object|String} query A valid DOM query, element or jQuery-esque list
 * @param {String} event_name The name of the event to track
 * @param {Object|Function} [properties] A properties object or function that returns a dictionary of properties when passed a DOMElement
 */
DATrackerLib.prototype.track_links = function() {
    return this._track_dom.call(this, LinkTracker, arguments);
};


/**
 * Time an event by including the time between this call and a
 * later 'track' call for the same event in the properties sent
 * with the event.
 *
 * ### Usage:
 *
 *     // time an event named 'Registered'
 *     DATracker.time_event('Registered');
 *     DATracker.track('Registered', {'Gender': 'Male', 'Age': 21});
 *
 * When called for a particular event name, the next track call for that event
 * name will include the elapsed time between the 'time_event' and 'track'
 * calls. This value is stored as seconds in the '$duration' property.
 *
 * @param {String} event_name The name of the event.
 */
DATrackerLib.prototype.time_event = function(event_name) {
    if (_.isUndefined(event_name)) {
        console.error('No event name provided to DATracker.time_event');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        return;
    }

    this['persistence'].set_event_timer(event_name,  new Date().getTime());
};

/**
 * Register a set of super properties, which are included with all
 * events. This will overwrite previous super property values.
 *
 * ### Usage:
 *
 *     // register 'Gender' as a super property
 *     DATracker.register({'Gender': 'Female'});
 *
 *     // register several super properties when a user signs up
 *     DATracker.register({
 *         'Email': 'jdoe@example.com',
 *         'Account Type': 'Free'
 *     });
 *
 * @param {Object} properties An associative array of properties to store about the user
 * @param {Number} [days] How many days since the user's last visit to store the super properties
 */
DATrackerLib.prototype.register = function(props, days) {
    this['persistence'].register(props, days);
};

/**
 * Register a set of super properties only once. This will not
 * overwrite previous super property values, unlike register().
 *
 * ### Usage:
 *
 *     // register a super property for the first time only
 *     DATracker.register_once({
 *         'First Login Date': new Date().toISOString()
 *     });
 *
 * ### Notes:
 *
 * If default_value is specified, current super properties
 * with that value will be overwritten.
 *
 * @param {Object} properties An associative array of properties to store about the user
 * @param {*} [default_value] Value to override if already set in super properties (ex: 'False') Default: 'None'
 * @param {Number} [days] How many days since the users last visit to store the super properties
 */
DATrackerLib.prototype.register_once = function(props, default_value, days) {
    this['persistence'].register_once(props, default_value, days);
};

/**
 * Delete a super property stored with the current user.
 *
 * @param {String} property The name of the super property to remove
 */
DATrackerLib.prototype.unregister = function(property) {
    this['persistence'].unregister(property);
};

DATrackerLib.prototype._register_single = function(prop, value) {
    var props = {};
    props[prop] = value;
    this.register(props);
};

/*
 * 用户注册
 */
DATrackerLib.prototype.signup = function(user_id) {
    var oldUserId = this.get_user_id();
    var data = {};
    oldUserId = oldUserId==undefined? '':oldUserId;

    if(oldUserId == user_id){
        return;
    }else{
        this._register_single('user_id', user_id);
        data =  this.track('da_u_signup',{
            "oldUserId": oldUserId,
            "newUserId": user_id
        });
    }

    return data;
};
/*
 * 用户登录记住用户名
 *
 * @param {String|Number} 用户唯一标识
 */
DATrackerLib.prototype.login = function(user_id) {
    _.innerEvent.trigger('userId:change', {type: 'login', userId: user_id});
    var data_signup = this.signup(user_id);
    var data_login = this.track('da_u_login');
    this._register_single('user_id', user_id);

    return {
        data_signup: data_signup,
        data_login: data_login
    };
};
/*
 * 用户退出，清除用户名
 */
DATrackerLib.prototype.logout = function(callback) {
    _.innerEvent.trigger('userId:change', {type: 'logout', userId: this.get_distinct_id()});
    this.unregister('user_id');
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
    var data = this.track('da_u_logout', {}, track_callback);
    return data;
};
/**
 * 设置用户 user_id
 */
DATrackerLib.prototype.set_userId = function(user_id) {
    this._register_single('user_id', user_id);
};

/**
 * Clears super properties and generates a new random distinct_id for this instance.
 * Useful for clearing data when a user logs out.
 */
DATrackerLib.prototype.reset = function() {
    this['persistence'].clear();
    this.register_once({'deviceUdid': _.UUID()}, '');
};

/**
 * Returns the current distinct id of the user. This is either the id automatically
 * generated by the library or the id that has been passed by a call to identify().
 *
 * ### Notes:
 *
 * get_distinct_id() can only be called after the DATracker library has finished loading.
 * init() has a loaded function available to handle this automatically. For example:
 *
 *     // set distinct_id after the DATracker library has loaded
 *     DATracker.init('YOUR PROJECT TOKEN', {
 *         loaded: function(DATracker) {
 *             distinct_id = DATracker.get_distinct_id();
 *         }
 *     });
 */
DATrackerLib.prototype.get_distinct_id = function() {
    return this.get_property('deviceUdid');
};
/**
 * 获取用户名
 *
 */
DATrackerLib.prototype.get_user_id = function() {
    return this.get_property('user_id');
};

/**
 * Update the configuration of a DATracker library instance.
 *
 * The default config is:
 *
 *     {
 *       // super properties cookie expiration (in days)
 *       cookie_expiration:          365
 *
 *       // super properties span subdomains
 *       cross_subdomain_cookie:     true
 *
 *       // if this is true, the DATracker cookie or localStorage entry
 *       // will be deleted, and no user persistence will take place
 *       disable_persistence:        false
 *
 *       // type of persistent store for super properties (cookie/
 *       // localStorage) if set to 'localStorage', any existing
 *       // DATracker cookie value with the same persistence_name
 *       // will be transferred to localStorage and deleted
 *       persistence:                'cookie'
 *
 *       // name for super properties persistent store
 *       persistence_name:           ''
 *
 *       // names of properties/superproperties which should never
 *       // be sent with track() calls
 *       property_blacklist:         []
 *
 *       // if this is true, DATracker cookies will be marked as
 *       // secure, meaning they will only be transmitted over https
 *       secure_cookie:              false
 *
 *       // the amount of time track_links will
 *       // wait for DATracker's servers to respond
 *       track_links_timeout:        300
 *
 *       // should we track a page view on page load
 *       track_pageview:             true
 *
 *       // if you set upgrade to be true, the library will check for
 *       // a cookie from our old js library and import super
 *       // properties from it, then the old cookie is deleted
 *       // The upgrade config option only works in the initialization,
 *       // so make sure you set it when you create the library.
 *       upgrade:                    false
 *     }
 *
 *
 * @param {Object} config A dictionary of new configuration values to update
 */
DATrackerLib.prototype.set_config = function(config) {
    if (_.isObject(config)) {
        _.extend(this['config'], config);

        if (!this.get_config('persistence_name')) {
            this['config']['persistence_name'] = this['config']['cookie_name'];
        }
        if (!this.get_config('disable_persistence')) {
            this['config']['disable_persistence'] = this['config']['disable_cookie'];
        }

        if (this['persistence']) {
            this['persistence'].update_config(this['config']);
        }
        Config.DEBUG = Config.DEBUG || this.get_config('debug');
    }
};

/**
 * returns the current config object for the library.
 */
DATrackerLib.prototype.get_config = function(prop_name) {
    return this['config'][prop_name];
};

/**
 * Returns the value of the super property named property_name. If no such
 * property is set, get_property() will return the undefined value.
 *
 * ### Notes:
 *
 * get_property() can only be called after the DATracker library has finished loading.
 * init() has a loaded function available to handle this automatically. For example:
 *
 *     // grab value for 'user_id' after the DATracker library has loaded
 *     DATracker.init('YOUR PROJECT TOKEN', {
 *         loaded: function(DATracker) {
 *             user_id = DATracker.get_property('user_id');
 *         }
 *     });
 *
 * @param {String} property_name The name of the super property you want to retrieve
 */
DATrackerLib.prototype.get_property = function(property_name) {
    return this['persistence']['props'][property_name];
};

DATrackerLib.prototype.toString = function() {
    var name = this.get_config('name');
    if (name !== PRIMARY_INSTANCE_NAME) {
        name = PRIMARY_INSTANCE_NAME + '.' + name;
    }
    return name;
};

DATrackerLib.prototype._event_is_disabled = function(event_name) {
    return _.isBlockedUA(userAgent) ||
        this._flags.disable_all_events ||
        _.include(this.__disabled_events, event_name);
};

DATrackerPeople.prototype._init = function(mixpanel_instance) {
    this._DATracker = mixpanel_instance;
};
/*
 * Set properties on a user record.
 *
 * ### Usage:
 *
 *     DATracker.people.set('gender', 'm');
 *
 *     // or set multiple properties at once
 *     DATracker.people.set({
 *         'Company': 'Acme',
 *         'Plan': 'Premium',
 *         'Upgrade date': new Date()
 *     });
 *     // properties can be strings, integers, dates, or lists
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
DATrackerPeople.prototype.set = function(prop, to, callback) {
    var data = {};
    var $set = {};
    if (_.isObject(prop)) {
        _.each(prop, function(v, k) {
            if (!this._is_reserved_property(k)) {
                $set[k] = v;
            }
        }, this);
        callback = to;
    } else {
        $set[prop] = to;
    }


    // update $set object with default people properties
    if($set['$userProfile'] === undefined){
        $set['$type'] = 'profile_set';
        $set = {'$userProfile': $set};
    }
    data[SET_ACTION] = $set;
    return this._send_request(data, callback);
};

/*
 * Set properties on a user record, only if they do not yet exist.
 * This will not overwrite previous people property values, unlike
 * people.set().
 *
 * ### Usage:
 *
 *     DATracker.people.set_once('First Login Date', new Date());
 *
 *     // or set multiple properties at once
 *     DATracker.people.set_once({
 *         'First Login Date': new Date(),
 *         'Starting Plan': 'Premium'
 *     });
 *
 *     // properties can be strings, integers or dates
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
DATrackerPeople.prototype.set_once = function(prop, to, callback) {
    var data = {};
    var $set_once = {};
    if (_.isObject(prop)) {
        _.each(prop, function(v, k) {
            if (!this._is_reserved_property(k)) {
                $set_once[k] = v;
            }
        }, this);
        callback = to;
    } else {
        $set_once[prop] = to;
    }

    if($set_once['$userProfile'] === undefined){
        $set_once['$type'] = 'profile_set_once';
        $set_once = {'$userProfile': $set_once};
    }
    data[SET_ONCE_ACTION] = $set_once;

    return this._send_request(data, callback);
};

DATrackerPeople.prototype.set_realname = function(realname) {
    this.set({"$realName" : realname});
};

DATrackerPeople.prototype.set_country = function(country) {
    this.set({"$country" : country});
};

DATrackerPeople.prototype.set_province = function(region) {
    this.set({"$region" : region});
};

DATrackerPeople.prototype.set_region = function(region) {
    this.set({"$region" : region});
};

DATrackerPeople.prototype.set_city = function(city) {
    this.set({"$city" : city});
};

DATrackerPeople.prototype.set_age = function(age) {
    this.set({"$age" : age});
};

DATrackerPeople.prototype.set_gender = function(gender) {
    if (gender == 0 || gender == 1 || gender == 2) {
        this.set({"$gender" : gender});
    }
};

DATrackerPeople.prototype.set_birthday = function(birthday) {
    if(!_.checkTime(birthday)) return;
    this.set({"$birthday" : birthday});
};

DATrackerPeople.prototype.set_account = function(account) {
    this.set({"$account" : account});
};

DATrackerPeople.prototype.set_populationWithAccount = function(account, realname, birthday, gender) {
    if(!account || !realname || !birthday || !gender) return;
    if(!_.checkTime(birthday)) return;
    //生日合法检测，yy-MM-dd
    this.set({'$account': account, "$realName" : realname, "$birthday": birthday, "$gender": gender});
};

DATrackerPeople.prototype.set_location = function(country, region, city) {
    if(!country || !region || !city) return;
    this.set({"$country" : country, "$region": region, "$city": city});
};

/*
 * Append a value to a list-valued people analytics property.
 *
 * ### Usage:
 *
 *     // append a value to a list, creating it if needed
 *     DATracker.people.append('pages_visited', 'homepage');
 *
 *     // like DATracker.people.set(), you can append multiple
 *     // properties at once:
 *     DATracker.people.append({
 *         list1: 'bob',
 *         list2: 123
 *     });
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [value] An item to append to the list
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
DATrackerPeople.prototype.append = function(list_name, value, callback) {
    var data = {};
    var $append = {};
    if (_.isObject(list_name)) {
        _.each(list_name, function(v, k) {
            if (!this._is_reserved_property(k)) {
                $append[k] = v;
            }
        }, this);
        callback = value;
    } else {
        $append[list_name] = value;
    }

    if($append['$userProfile'] === undefined){
        $append['$type'] = 'profile_append';
        $append = {'$userProfile': $append};
    }
    data[SET_ONCE_ACTION] = $append;

    return this._send_request(data, callback);
};



DATrackerPeople.prototype.toString = function() {
    return this._DATracker.toString() + '.people';
};

DATrackerPeople.prototype._send_request = function(data, callback) {
    // 点击图渲染模式不发数据
    if(this._DATracker.cookie.props.hubble_render_mode){
        return false;
    }
    data['dataType'] = 'ie';
    data['appKey'] = this._get_config('token');
    data['deviceUdid'] = this._DATracker.get_distinct_id();
    data['userId'] = this._DATracker.get_user_id();
    data['time'] = new Date().getTime();
    data['sdkType'] = SDKTYPE;
    data['eventId'] = 'da_user_profile';
    data['persistedTime'] = this._DATracker.cookie.props.persistedTime;
    data['pageOpenScene'] = 'Browser';

    var utm  = campaign.getParams();
    var secondLevelSource = source.getParams();
    data = _.extend(data, utm);
    data = _.extend(data, secondLevelSource);

    var date_encoded_data = _.encodeDates(data);
    var truncateLength = this._DATracker.get_config('truncateLength');
    var truncated_data = date_encoded_data;
    if (Object.prototype.toString.call(truncateLength) === '[object Number]' && truncateLength> 0) {
        truncated_data = _.truncate(date_encoded_data, truncateLength);
    }
    var json_data         = _.JSONEncode(date_encoded_data);
    var encoded_data      = _.base64Encode(json_data);

    if (!true) {
        this._enqueue(data);
        if (!_.isUndefined(callback)) {
            if (this._get_config('verbose')) {
                callback({status: -1, error: null});
            } else {
                callback(-1);
            }
        }
        return truncated_data;
    }

    console.log('打印数据:');
    console.log(truncated_data);
    var appkey_data    = _.sha1(this._DATracker.get_config('token'));

    var self = this;
    var jsTrack = function() {
        var url = self._DATracker.get_config('api_host') + self._DATracker.get_config('get_path');
        if (self._DATracker.get_config('method') === 'post') {
            url = self._DATracker.get_config('api_host') + self._DATracker.get_config('post_path');
        }
        self._DATracker._send_request(
            url,
            {'data': encoded_data, 'appKey':appkey_data},
            self._DATracker._prepare_callback(callback, truncated_data)
        );
    };

    if(this._DATracker.get_config('use_app_track')) {
        this._DATracker._sendNativeCall(json_data, '$da_user_profile' ,callback, jsTrack);
    } else {
        jsTrack();
    }
    //调试函数
    if(this._DATracker.get_config('debug')) {
        if(_.isFunction(this._DATracker.debug)) {
            this._DATracker.debug({data: encoded_data});
        }
    }

    return truncated_data;
};

DATrackerPeople.prototype._get_config = function(conf_var) {
    return this._DATracker.get_config(conf_var);
};

DATrackerPeople.prototype._user_logined = function() {
    var user_id = this._DATracker.get_user_id();
    return user_id !== undefined;
};
// Queue up engage operations if identify hasn't been called yet.
DATrackerPeople.prototype._enqueue = function(data) {
    if (SET_ACTION in data) {
        this._DATracker['persistence']._add_to_people_queue(SET_ACTION, data);
    } else if (SET_ONCE_ACTION in data) {
        this._DATracker['persistence']._add_to_people_queue(SET_ONCE_ACTION, data);
    } else if (ADD_ACTION in data) {
        this._DATracker['persistence']._add_to_people_queue(ADD_ACTION, data);
    } else if (APPEND_ACTION in data) {
        this._DATracker['persistence']._add_to_people_queue(APPEND_ACTION, data);
    } else if (UNION_ACTION in data) {
        this._DATracker['persistence']._add_to_people_queue(UNION_ACTION, data);
    } else {
        console.error('Invalid call to _enqueue():', data);
    }
};


DATrackerPeople.prototype._is_reserved_property = function(prop) {
    return prop === '$deviceUdid' || prop === '$token';
};


// EXPORTS (for closure compiler)

// DATrackerLib Exports
DATrackerLib.prototype['init']                            = DATrackerLib.prototype.init;
DATrackerLib.prototype['reset']                           = DATrackerLib.prototype.reset;
DATrackerLib.prototype['disable']                         = DATrackerLib.prototype.disable;
DATrackerLib.prototype['time_event']                      = DATrackerLib.prototype.time_event;
DATrackerLib.prototype['track']                           = DATrackerLib.prototype.track;
DATrackerLib.prototype['track_links']                     = DATrackerLib.prototype.track_links;
DATrackerLib.prototype['track_pageview']                  = DATrackerLib.prototype.track_pageview;
DATrackerLib.prototype['register']                        = DATrackerLib.prototype.register;
DATrackerLib.prototype['register_once']                   = DATrackerLib.prototype.register_once;
DATrackerLib.prototype['unregister']                      = DATrackerLib.prototype.unregister;
DATrackerLib.prototype['alias']                           = DATrackerLib.prototype.alias;
DATrackerLib.prototype['set_config']                      = DATrackerLib.prototype.set_config;
DATrackerLib.prototype['get_config']                      = DATrackerLib.prototype.get_config;
DATrackerLib.prototype['get_property']                    = DATrackerLib.prototype.get_property;
DATrackerLib.prototype['get_distinct_id']                 = DATrackerLib.prototype.get_distinct_id;
DATrackerLib.prototype['toString']                        = DATrackerLib.prototype.toString;
DATrackerLib.prototype['login']                           = DATrackerLib.prototype.login;
DATrackerLib.prototype['logout']                          = DATrackerLib.prototype.logout;
DATrackerLib.prototype['get_user_id']                     = DATrackerLib.prototype.get_user_id;
DATrackerLib.prototype['register_attributes']             = DATrackerLib.prototype.register_attributes;
DATrackerLib.prototype['register_attributes_once']        = DATrackerLib.prototype.register_attributes_once;
DATrackerLib.prototype['clear_attributes']                = DATrackerLib.prototype.clear_attributes;
DATrackerLib.prototype['unregister_attributes']           = DATrackerLib.prototype.unregister_attributes;
DATrackerLib.prototype['current_attributes']              = DATrackerLib.prototype.current_attributes;
DATrackerLib.prototype['oxpecker_init']                   = DATrackerLib.prototype.oxpecker_init;
DATrackerLib.prototype['oxpecker_set_url']                = DATrackerLib.prototype.oxpecker_set_url;
DATrackerLib.prototype['oxpecker_update_config']          = DATrackerLib.prototype.oxpecker_update_config;
DATrackerLib.prototype['oxpecker_remove_config']          = DATrackerLib.prototype.oxpecker_remove_config;
DATrackerLib.prototype['oxpecker_set_token']              = DATrackerLib.prototype.oxpecker_set_token;
DATrackerLib.prototype['oxpecker_flush']                  = DATrackerLib.prototype.oxpecker_flush;
DATrackerLib.prototype['oxpecker_set_product_profile']    = DATrackerLib.prototype.oxpecker_set_product_profile;
DATrackerLib.prototype['oxpecker_send_by_beacon']         = DATrackerLib.prototype.oxpecker_send_by_beacon;
DATrackerLib.prototype['oxpecker_set_base_attributes']    = DATrackerLib.prototype.oxpecker_set_base_attributes;
DATrackerLib.prototype['oxpecker_config_sdk']             = DATrackerLib.prototype.oxpecker_config_sdk;
DATrackerLib.prototype['oxpecker_set_host']               = DATrackerLib.prototype.oxpecker_set_host;



// DATrackerPersistence Exports
DATrackerPersistence.prototype['properties']            = DATrackerPersistence.prototype.properties;
DATrackerPersistence.prototype['get_cross_subdomain']   = DATrackerPersistence.prototype.get_cross_subdomain;
DATrackerPersistence.prototype['clear']                 = DATrackerPersistence.prototype.clear;

// DATrackerPeople Exports
DATrackerPeople.prototype['set']           = DATrackerPeople.prototype.set;
DATrackerPeople.prototype['set_once']      = DATrackerPeople.prototype.set_once;
DATrackerPeople.prototype['append']        = DATrackerPeople.prototype.append;
DATrackerPeople.prototype['toString']      = DATrackerPeople.prototype.toString;


var instances = {};
var extend_mp = function() {
    // add all the sub DATracker instances
    _.each(instances, function(instance, name) {
        if (name !== PRIMARY_INSTANCE_NAME) { DATracker_master[name] = instance; }
    });

    // add private functions as _
    DATracker_master['_'] = _;
};

var override_mp_init_func = function() {
    // we override the snippets init function to handle the case where a
    // user initializes the DATracker library after the script loads & runs
    DATracker_master['init'] = function(token, config, name) {
        if (name) {
            // initialize a sub library
            if (!DATracker_master[name]) {
                DATracker_master[name] = instances[name] = create_DAlib(token, config, name);
                //DATracker_master[name]._loaded();
            }
            return DATracker_master[name];
        } else {
            var instance = DATracker_master;

            if (instances[PRIMARY_INSTANCE_NAME]) {
                // main DATracker lib already initialized
                instance = instances[PRIMARY_INSTANCE_NAME];
            } else if (token) {
                // intialize the main DATracker lib
                instance = create_DAlib(token, config, PRIMARY_INSTANCE_NAME);
                //instance._loaded();
                instances[PRIMARY_INSTANCE_NAME] = instance;
            }

            DATracker_master = instance;
            if (init_type === INIT_SNIPPET || init_type === INIT_SYNC) {
                window[PRIMARY_INSTANCE_NAME] = DATracker_master;
            }
            extend_mp();
        }
    };
};

var add_dom_loaded_handler = function() {
    // Cross browser DOM Loaded support
    function dom_loaded_handler() {
        // function flag since we only want to execute this once
        if (dom_loaded_handler.done) { return; }
        dom_loaded_handler.done = true;

        DOM_LOADED = true;
        ENQUEUE_REQUESTS = false;

        _.each(instances, function(inst) {
            inst._dom_loaded();
        });
    }

    function do_scroll_check() {
        try {
            document.documentElement.doScroll('left');
        } catch(e) {
            setTimeout(do_scroll_check, 1);
            return;
        }

        dom_loaded_handler();
    }

    if (document.addEventListener) {
        if (document.readyState === 'complete') {
            // safari 4 can fire the DOMContentLoaded event before loading all
            // external JS (including this file). you will see some copypasta
            // on the internet that checks for 'complete' and 'loaded', but
            // 'loaded' is an IE thing
            dom_loaded_handler();
        } else {
            document.addEventListener('DOMContentLoaded', dom_loaded_handler, false);
        }
    } else if (document.attachEvent) {
        // IE
        document.attachEvent('onreadystatechange', dom_loaded_handler);

        // check to make sure we arn't in a frame
        var toplevel = false;
        try {
            toplevel = window.frameElement === null;
        } catch(e) {
            // noop
        }

        if (document.documentElement.doScroll && toplevel) {
            do_scroll_check();
        }
    }

    // fallback handler, always will work
    _.register_event(window, 'load', dom_loaded_handler, true);
};

var add_dom_event_counting_handlers = function(instance) {
    var name = instance.get_config('name');

    instance.mp_counts = instance.mp_counts || {};
    instance.mp_counts['$__c'] = parseInt(_.cookie.get('mp_' + name + '__c')) || 0;

    var increment_count = function() {
        instance.mp_counts['$__c'] = (instance.mp_counts['$__c'] || 0) + 1;
        _.cookie.set('mp_' + name + '__c', instance.mp_counts['$__c'], 1, true);
    };

    var evtCallback = function() {
        try {
            instance.mp_counts = instance.mp_counts || {};
            increment_count();
        } catch (e) {
            console.error(e);
        }
    };
    _.register_event(document, 'submit', evtCallback);
    _.register_event(document, 'change', evtCallback);
    var mousedownTarget = null;
    _.register_event(document, 'mousedown', function(e) {
        mousedownTarget = e.target;
    });
    _.register_event(document, 'mouseup', function(e) {
        if (e.target === mousedownTarget) {
            evtCallback(e);
        }
    });
};

export function init_from_snippet() {
    init_type = INIT_SNIPPET;
    DATracker_master = window[PRIMARY_INSTANCE_NAME];

    // Initialization
    if (_.isUndefined(DATracker_master)) {
        // DATracker wasn't initialized properly, report error and quit
        console.critical('"DATracker" object not initialized. Ensure you are using the latest version of the DATracker JS Library along with the snippet we provide.');
        return;
    }
    if (DATracker_master['__loaded'] || (DATracker_master['config'] && DATracker_master['persistence'])) {
        // lib has already been loaded at least once; we don't want to override the global object this time so bomb early
        console.error('DATracker library has already been downloaded at least once.');
        return;
    }
    var snippet_version = DATracker_master['__SV'] || 0;
    if (snippet_version < 1.1) {
        // DATracker wasn't initialized properly, report error and quit
        console.critical('Version mismatch; please ensure you\'re using the latest version of the DATracker code snippet.');
        return;
    }

    // Load instances of the DATracker Library
    _.each(DATracker_master['_i'], function(item) {
        if (item && _.isArray(item)) {
            instances[item[item.length-1]] = create_DAlib.apply(this, item);
        }
    });

    override_mp_init_func();
    DATracker_master['init']();

    // Fire loaded events after updating the window's DATracker object
    _.each(instances, function(instance) {
        //instance._loaded();
    });

    add_dom_loaded_handler();
}

export function init_as_module() {
    init_type = INIT_MODULE;
    DATracker_master = new DATrackerLib();

    override_mp_init_func();
    DATracker_master['init']();
    add_dom_loaded_handler();

    return DATracker_master;
}

export function init_sync() {
    init_type = INIT_SYNC;
    DATracker_master = new DATrackerLib();

    override_mp_init_func();
    DATracker_master['init']();
    add_dom_loaded_handler();

    return DATracker_master;
}
