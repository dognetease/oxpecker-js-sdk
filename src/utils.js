
/* eslint-disable */
/* eslint camelcase: "off", eqeqeq: "off" */
import Config from './config';
import Device from './device';



// since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
var win;
if (typeof(window) === 'undefined') {
    win = {
        navigator: {}
    };
} else {
    win = window;
}




/*
 * Saved references to long variable names, so that closure compiler can
 * minimize file size.
 */

var ArrayProto = Array.prototype,
    FuncProto = Function.prototype,
    ObjProto = Object.prototype,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty,
    windowConsole = win.console,
    navigator = win.navigator,
    document = win.document,
    userAgent = navigator.userAgent;

var nativeBind = FuncProto.bind,
    nativeForEach = ArrayProto.forEach,
    nativeIndexOf = ArrayProto.indexOf,
    nativeIsArray = Array.isArray,
    breaker = {};

var _ = {
    trim: function(str) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
};


// Console override
var console = {
    /** @type {function(...[*])} */
    log: function() {
        if (Config.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            try {
                windowConsole.log.apply(windowConsole, arguments);
            } catch (err) {
                _.each(arguments, function(arg) {
                    windowConsole.log(arg);
                });
            }
        }
    },
    /** @type {function(...[*])} */
    error: function() {
        if (Config.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            var args = ['DATracker error:'].concat(_.toArray(arguments));
            try {
                windowConsole.error.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function(arg) {
                    windowConsole.error(arg);
                });
            }
        }
    },
    /** @type {function(...[*])} */
    critical: function() {
        if (!_.isUndefined(windowConsole) && windowConsole) {
            var args = ['DATracker error:'].concat(_.toArray(arguments));
            try {
                windowConsole.error.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function(arg) {
                    windowConsole.error(arg);
                });
            }
        }
    }
};

var NA_VERSION = "-1";
var external = win.external;
var userAgent = win.navigator.userAgent || "";
var appVersion = win.navigator.appVersion || "";
var vendor = win.navigator.vendor || "";
var detector = {};

var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
var re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/;
var re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/;
var re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/;

// function toString(object) {
//     return Object.prototype.toString.call(object);
// }

function isObject(object) {
    return toString(object) === "[object Object]";
}

function isFunction(object) {
    return toString(object) === "[object Function]";
}

function each(object, factory) {
    for (var i = 0, l = object.length; i < l; i++) {
        if (factory.call(object, object[i], i) === false) {
            break;
        }
    }
}

// http://zakwu.me/2015/12/15/an-zhuo-shou-ji-uashou-ji/ 参考
// 硬件设备信息识别表达式。
// 使用数组可以按优先级排序。
var DEVICES = [
    ["nokia", function(ua) {
        // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
        // 这种情况下会优先识别出 nokia/-1
        if (ua.indexOf("nokia ") !== -1) {
            return /\bnokia ([0-9]+)?/;
        } else {
            return /\bnokia([a-z0-9]+)?/;
        }
    }],
    // 三星有 Android 和 WP 设备。
    ["samsung", function(ua) {
        if (ua.indexOf("samsung") !== -1) {
            return /\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/;
        } else {
            return /\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/;
        }
    }],
    ["wp", function(ua) {
        return ua.indexOf("windows phone ") !== -1 ||
        ua.indexOf("xblwp") !== -1 ||
        ua.indexOf("zunewp") !== -1 ||
        ua.indexOf("windows ce") !== -1;
    }],
    ["pc", "windows"],
    ["ipad", "ipad"],
    // ipod 规则应置于 iphone 之前。
    ["ipod", "ipod"],
    ["iphone", /\biphone\b|\biph(\d)/],
    ["mac", "macintosh"],
    // 小米
    ["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
    // 红米
    ["hongmi", /\bhm\b|redmi[ \-]?([a-z0-9]+)/],
    ["aliyun", /\baliyunos\b(?:[\-](\d+))?/],
    ["meizu", function(ua) {
        return ua.indexOf("meizu") >= 0 ?
        /\bmeizu[\/ ]([a-z0-9]+)\b/
        :
        /\bm([0-9cx]{1,4})\b/;
    }],
    ["nexus", /\bnexus ([0-9s.]+)/],
    ["huawei", function(ua) {
        var re_mediapad = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
        if (ua.indexOf("huawei-huawei") !== -1) {
            return /\bhuawei\-huawei\-([a-z0-9\-]+)/;
        } else if (re_mediapad.test(ua)) {
            return re_mediapad;
        } else {
            return /\bhuawei[ _\-]?([a-z0-9]+)/;
        }
    }],
    ["lenovo", function(ua) {
        if (ua.indexOf("lenovo-lenovo") !== -1) {
            return /\blenovo\-lenovo[ \-]([a-z0-9]+)/;
        } else {
            return /\blenovo[ \-]?([a-z0-9]+)/;
        }
    }],
    // 中兴
    ["zte", function(ua) {
        if (/\bzte\-[tu]/.test(ua)) {
            return /\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/;
        } else {
            return /\bzte[ _\-]?([a-su-z0-9\+]+)/;
        }
    }],
    // 步步高
    ["vivo", /\bvivo(?: ([a-z0-9]+))?/],
    ["htc", function(ua) {
        if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
            return /\bhtc[ _\-]?([a-z0-9 ]+(?= build))/;
        } else {
            return /\bhtc[ _\-]?([a-z0-9 ]+)/;
        }
    }],
    ["oppo", /\boppo[_]([a-z0-9]+)/],
    ["konka", /\bkonka[_\-]([a-z0-9]+)/],
    ["sonyericsson", /\bmt([a-z0-9]+)/],
    ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/],
    ["lg", /\blg[\-]([a-z0-9]+)/],
    ["android", /\bandroid\b|\badr\b/],
    ["blackberry", function(ua) {
        if (ua.indexOf("blackberry") >= 0) {
            return /\bblackberry\s?(\d+)/;
        }
        return "bb10";
    }]
];
// 操作系统信息识别表达式
var OS = [
    ["wp", function(ua) {
        if (ua.indexOf("windows phone ") !== -1) {
            return /\bwindows phone (?:os )?([0-9.]+)/;
        } else if (ua.indexOf("xblwp") !== -1) {
            return /\bxblwp([0-9.]+)/;
        } else if (ua.indexOf("zunewp") !== -1) {
            return /\bzunewp([0-9.]+)/;
        }
        return "windows phone";
    }],
    ["windows", /\bwindows nt ([0-9.]+)/],
    ["macosx", /\bmac os x ([0-9._]+)/],
    ["iOS", function(ua) {
        if (/\bcpu(?: iphone)? os /.test(ua)) {
            return /\bcpu(?: iphone)? os ([0-9._]+)/;
        } else if (ua.indexOf("iph os ") !== -1) {
            return /\biph os ([0-9_]+)/;
        } else {
            return /\bios\b/;
        }
    }],
    ["yunos", /\baliyunos ([0-9.]+)/],
    ["Android", function(ua) {
        if (ua.indexOf("android") >= 0) {
            return /\bandroid[ \/-]?([0-9.x]+)?/;
        } else if (ua.indexOf("adr") >= 0) {
            if (ua.indexOf("mqqbrowser") >= 0) {
                return /\badr[ ]\(linux; u; ([0-9.]+)?/;
            } else {
                return /\badr(?:[ ]([0-9.]+))?/;
            }
        }
        return "android";
        //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
    }],
    ["chromeos", /\bcros i686 ([0-9.]+)/],
    ["linux", "linux"],
    ["windowsce", /\bwindows ce(?: ([0-9.]+))?/],
    ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/],
    ["blackberry", function(ua) {
        var m = ua.match(re_blackberry_10) ||
        ua.match(re_blackberry_6_7) ||
        ua.match(re_blackberry_4_5);
        return m ? {version: m[1]} : "blackberry";
    }]
];
//浏览器内核
var ENGINE = [
    ["edgehtml", /edge\/([0-9.]+)/],
    ["trident", re_msie],
    ["blink", function() {
        return "chrome" in win && "CSS" in win && /\bapplewebkit[\/]?([0-9.+]+)/;
    }],
    ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/],
    ["gecko", function(ua) {
        var match;
        if ((match = ua.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/))) {
            return {
                version: match[1] + "." + match[2]
            };
        }
    }],
    ["presto", /\bpresto\/([0-9.]+)/],
    ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/],
    ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/],
    ["u2", /\bu2\/([0-9.]+)/],
    ["u3", /\bu3\/([0-9.]+)/]
];
var BROWSER = [
    // Microsoft Edge Browser, Default browser in Windows 10.
    ["edge", /edge\/([0-9.]+)/],
    // Sogou.
    ["sogou", function(ua) {
        if (ua.indexOf("sogoumobilebrowser") >= 0) {
            return /sogoumobilebrowser\/([0-9.]+)/;
        } else if (ua.indexOf("sogoumse") >= 0) {
            return true;
        }
        return / se ([0-9.x]+)/;
    }],
    // TheWorld (世界之窗)
    // 由于裙带关系，TheWorld API 与 360 高度重合。
    // 只能通过 UA 和程序安装路径中的应用程序名来区分。
    // TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
    ["theworld", function() {
        var x = checkTW360External("theworld");
        if (typeof x !== "undefined") {
            return x;
        }
        return "theworld";
    }],
    // 360SE, 360EE.
    ["360", function(ua) {
        var x = checkTW360External("360se");
        if (typeof x !== "undefined") {
            return x;
        }
        if (ua.indexOf("360 aphone browser") !== -1) {
            return /\b360 aphone browser \(([^\)]+)\)/;
        }
        return /\b360(?:se|ee|chrome|browser)\b/;
    }],
    // Maxthon
    ["maxthon", function() {
        try {
            if (external && (external.mxVersion || external.max_version)) {
                return {
                    version: external.mxVersion || external.max_version
                };
            }
        } catch (ex) { /* */
        }
        return /\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/;
    }],
    ["micromessenger", /\bmicromessenger\/([\d.]+)/],
    ["qq", /\bm?qqbrowser\/([0-9.]+)/],
    ["green", "greenbrowser"],
    ["tt", /\btencenttraveler ([0-9.]+)/],
    ["liebao", function(ua) {
        if (ua.indexOf("liebaofast") >= 0) {
            return /\bliebaofast\/([0-9.]+)/;
        }
        if (ua.indexOf("lbbrowser") === -1) {
            return false;
        }
        var version;
        try {
            if (external && external.LiebaoGetVersion) {
                version = external.LiebaoGetVersion();
            }
        } catch (ex) { /* */
        }
        return {
            version: version || NA_VERSION
        };
    }],
    ["tao", /\btaobrowser\/([0-9.]+)/],
    ["coolnovo", /\bcoolnovo\/([0-9.]+)/],
    ["saayaa", "saayaa"],
    // 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
    ["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
    // 后面会做修复版本号，这里只要能识别是 IE 即可。
    ["ie", re_msie],
    ["mi", /\bmiuibrowser\/([0-9.]+)/],
    // Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
    ["opera", function(ua) {
        var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
        var re_opera_new = /\bopr\/([0-9.]+)/;
        return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
    }],
    ["oupeng", /\boupeng\/([0-9.]+)/],
    ["yandex", /yabrowser\/([0-9.]+)/],
    // 支付宝手机客户端
    ["ali-ap", function(ua) {
        if (ua.indexOf("aliapp") > 0) {
            return /\baliapp\(ap\/([0-9.]+)\)/;
        } else {
            return /\balipayclient\/([0-9.]+)\b/;
        }
    }],
    // 支付宝平板客户端
    ["ali-ap-pd", /\baliapp\(ap-pd\/([0-9.]+)\)/],
    // 支付宝商户客户端
    ["ali-am", /\baliapp\(am\/([0-9.]+)\)/],
    // 淘宝手机客户端
    ["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
    // 淘宝平板客户端
    ["ali-tb-pd", /\baliapp\(tb-pd\/([0-9.]+)\)/],
    // 天猫手机客户端
    ["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
    // 天猫平板客户端
    ["ali-tm-pd", /\baliapp\(tm-pd\/([0-9.]+)\)/],
    // UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
    // UC 桌面版浏览器携带 Chrome 信息，需要放在 Chrome 之前。
    ["uc", function(ua) {
        if (ua.indexOf("ucbrowser/") >= 0) {
            return /\bucbrowser\/([0-9.]+)/;
        } else if (ua.indexOf("ubrowser/") >= 0) {
            return /\bubrowser\/([0-9.]+)/;
        } else if (/\buc\/[0-9]/.test(ua)) {
            return /\buc\/([0-9.]+)/;
        } else if (ua.indexOf("ucweb") >= 0) {
        // `ucweb/2.0` is compony info.
        // `UCWEB8.7.2.214/145/800` is browser info.
            return /\bucweb([0-9.]+)?/;
        } else {
            return /\b(?:ucbrowser|uc)\b/;
        }
    }],
    ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
    // Android 默认浏览器。该规则需要在 safari 之前。
    ["android", function(ua) {
        if (ua.indexOf("android") === -1) {
            return;
        }
        return /\bversion\/([0-9.]+(?: beta)?)/;
    }],
    ["blackberry", function(ua) {
        var m = ua.match(re_blackberry_10) ||
        ua.match(re_blackberry_6_7) ||
        ua.match(re_blackberry_4_5);
        return m ? {version: m[1]} : "blackberry";
    }],
    ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
    // 如果不能被识别为 Safari，则猜测是 WebView。
    ["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
    ["firefox", /\bfirefox\/([0-9.ab]+)/],
    ["nokia", /\bnokiabrowser\/([0-9.]+)/]
];
// 针对同源的 TheWorld 和 360 的 external 对象进行检测。
// @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
// @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
function checkTW360External(key) {
    if (!external) {
        return;
    } // return undefined.
    try {
        //        360安装路径：
        //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
        var runpath = external.twGetRunPath.toLowerCase();
        // 360SE 3.x ~ 5.x support.
        // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
        // 因此只能用 try/catch 而无法使用特性判断。
        var security = external.twGetSecurityID(win);
        var version = external.twGetVersion(security);

        if (runpath && runpath.indexOf(key) === -1) {
            return false;
        }
        if (version) {
            return {version: version};
        }
    } catch (ex) { /* */
    }
}
// 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
// @param {String} ua, userAgent string.
// @return {Object}
function IEMode(ua) {
    if (!re_msie.test(ua)) {
        return null;
    }

    var m,
        engineMode, engineVersion,
        browserMode, browserVersion;

    // IE8 及其以上提供有 Trident 信息，
    // 默认的兼容模式，UA 中 Trident 版本不发生变化。
    if (ua.indexOf("trident/") !== -1) {
        m = /\btrident\/([0-9.]+)/.exec(ua);
        if (m && m.length >= 2) {
        // 真实引擎版本。
            engineVersion = m[1];
            var v_version = m[1].split(".");
            v_version[0] = parseInt(v_version[0], 10) + 4;
            browserVersion = v_version.join(".");
        }
    }

    m = re_msie.exec(ua);
    browserMode = m[1];
    var v_mode = m[1].split(".");
    if (typeof browserVersion === "undefined") {
        browserVersion = browserMode;
    }
    v_mode[0] = parseInt(v_mode[0], 10) - 4;
    engineMode = v_mode.join(".");
    if (typeof engineVersion === "undefined") {
        engineVersion = engineMode;
    }

    return {
        browserVersion: browserVersion,
        browserMode: browserMode,
        engineVersion: engineVersion,
        engineMode: engineMode,
        compatible: engineVersion !== engineMode
    };
}
// UserAgent Detector.
// @param {String} ua, userAgent.
// @param {Object} expression
// @return {Object}
//    返回 null 表示当前表达式未匹配成功。
function detect(name, expression, ua) {
    var expr = isFunction(expression) ? expression.call(null, ua) : expression;
    if (!expr) {
        return null;
    }
    var info = {
        name: name,
        version: NA_VERSION,
        codename: ""
    };
    var t = toString(expr);
    if (expr === true) {
        return info;
    } else if (t === "[object String]") {
        if (ua.indexOf(expr) !== -1) {
            return info;
        }
    } else if (isObject(expr)) { // Object
        if (expr.hasOwnProperty("version")) {
            info.version = expr.version;
        }
        return info;
    } else if (expr.exec) { // RegExp
        var m = expr.exec(ua);
        if (m) {
            if (m.length >= 2 && m[1]) {
                info.version = m[1].replace(/_/g, ".");
            } else {
                info.version = NA_VERSION;
            }
            return info;
        }
    }
}

var na = {name: "", version: ""};
// 初始化识别。
function init(ua, patterns, factory, detector) {
    var detected = na;
    each(patterns, function(pattern) {
        var d = detect(pattern[0], pattern[1], ua);
        if (d) {
            detected = d;
            return false;
        }
    });
    factory.call(detector, detected.name, detected.version);
}
// 解析 UserAgent 字符串
// @param {String} ua, userAgent string.
// @return {Object}
var parse = function(ua) {
    ua = (ua || "").toLowerCase();
    var d = {};

    init(ua, DEVICES, function(name, version) {
        var v = parseFloat(version);
        d.device = {
            name: name,
            version: v,
            fullVersion: version
        };
        d.device[name] = v;
    }, d);

    init(ua, OS, function(name, version) {
        var v = parseFloat(version);
        d.os = {
            name: name,
            version: v,
            fullVersion: version
        };
        d.os[name] = v;
    }, d);

    var ieCore = IEMode(ua);

    init(ua, ENGINE, function(name, version) {
        var mode = version;
        // IE 内核的浏览器，修复版本号及兼容模式。
        if (ieCore) {
            version = ieCore.engineVersion || ieCore.engineMode;
            mode = ieCore.engineMode;
        }
        var v = parseFloat(version);
        d.engine = {
            name: name,
            version: v,
            fullVersion: version,
            mode: parseFloat(mode),
            fullMode: mode,
            compatible: ieCore ? ieCore.compatible : false
        };
        d.engine[name] = v;
    }, d);

    init(ua, BROWSER, function(name, version) {
        var mode = version;
        // IE 内核的浏览器，修复浏览器版本及兼容模式。
        if (ieCore) {
        // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
            if (name === "ie") {
                version = ieCore.browserVersion;
            }
            mode = ieCore.browserMode;
        }
        var v = parseFloat(version);
        d.browser = {
            name: name,
            version: v,
            fullVersion: version,
            mode: parseFloat(mode),
            fullMode: mode,
            compatible: ieCore ? ieCore.compatible : false
        };
        d.browser[name] = v;
    }, d);
    return d;
};

detector = parse(userAgent + " " + appVersion + " " + vendor);

//删除左右两端的空格
_.trim = function(str){
    if(!str) return; 
　                                                                                                                                                                                                                                                                          return str.replace(/(^\s*)|(\s*$)/g, "");
};

//验证yyyy-MM-dd日期格式
_.checkTime = function(timeString) {
    var date = timeString + '';
    var reg = /^(\d{4})-(\d{2})-(\d{2})$/; 
    if(timeString) {
        if (!reg.test(timeString)){
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
};

function RQcheck(RQ) {
    var date = RQ;
    var result = date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

    if (result == null)
        return false;
    var d = new Date(result[1], result[3] - 1, result[4]);
    return (d.getFullYear() == result[1] && (d.getMonth() + 1) == result[3] && d.getDate() == result[4]);

}

// UNDERSCORE
// Embed part of the Underscore Library
_.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) {
        return nativeBind.apply(func, slice.call(arguments, 1));
    }
    if (!_.isFunction(func)) {
        throw new TypeError();
    }
    args = slice.call(arguments, 2);
    bound = function() {
        if (!(this instanceof bound)) {
            return func.apply(context, args.concat(slice.call(arguments)));
        }
        var ctor = {};
        ctor.prototype = func.prototype;
        var self = new ctor();
        ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) {
            return result;
        }
        return self;
    };
    return bound;
};

_.bind_instance_methods = function(obj) {
    for (var func in obj) {
        if (typeof(obj[func]) === 'function') {
            obj[func] = _.bind(obj[func], obj);
        }
    }
};

/**
 * @param {*=} obj
 * @param {function(...[*])=} iterator
 * @param {Object=} context
 */
_.each = function(obj, iterator, context) {
    if (obj === null || obj === undefined) {
        return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                return;
            }
        }
    } else {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
};

_.escapeHTML = function(s) {
    var escaped = s;
    if (escaped && _.isString(escaped)) {
        escaped = escaped
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    return escaped;
};

_.extend = function(obj) {
    _.each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
            if (source[prop] !== void 0) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

_.deepMerge = function(obj1, obj2) {
    var key;
    for(key in obj2) {
        // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
        obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ?
        _.deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key];
    }
    return obj1;
};

_.isArray = nativeIsArray || function(obj) {
    return Object.prototype.toString.apply(obj) === '[object Array]';
};

// from a comment on http://dbj.org/dbj/?p=286
// fails on only one very rare and deliberate custom object:
// var bomb = { toString : undefined, valueOf: function(o) { return "function BOMBA!"; }};
_.isFunction = function(f) {
    try {
        return /^\s*\bfunction\b/.test(f);
    } catch (x) {
        return false;
    }
};

_.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
};

_.toArray = function(iterable) {
    if (!iterable) {
        return [];
    }
    if (iterable.toArray) {
        return iterable.toArray();
    }
    if (_.isArray(iterable)) {
        return slice.call(iterable);
    }
    if (_.isArguments(iterable)) {
        return slice.call(iterable);
    }
    return _.values(iterable);
};

_.values = function(obj) {
    var results = [];
    if (obj === null) {
        return results;
    }
    _.each(obj, function(value) {
        results[results.length] = value;
    });
    return results;
};

_.identity = function(value) {
    return value;
};

_.include = function(obj, target) {
    var found = false;
    if (obj === null) {
        return found;
    }
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
        return obj.indexOf(target) != -1;
    }
    _.each(obj, function(value) {
        if (found || (found = (value === target))) {
            return breaker;
        }
    });
    return found;
};

_.includes = function(str, needle) {
    return str.indexOf(needle) !== -1;
};

// Underscore Addons
_.inherit = function(subclass, superclass) {
    subclass.prototype = new superclass();
    subclass.prototype.constructor = subclass;
    subclass.superclass = superclass.prototype;
    return subclass;
};

_.isObject = function(obj) {
    return (obj === Object(obj) && !_.isArray(obj));
};

_.isEmptyObject = function(obj) {
    if (_.isObject(obj)) {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    return false;
};

_.isUndefined = function(obj) {
    return obj === void 0;
};

_.isString = function(obj) {
    return Object.prototype.toString.call(obj) == '[object String]';
};

_.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
};

_.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
};

_.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
};

_.encodeDates = function(obj) {
    _.each(obj, function(v, k) {
        if (_.isDate(v)) {
            obj[k] = _.formatDate(v);
        } else if (_.isObject(v)) {
            obj[k] = _.encodeDates(v); // recurse
        }
    });
    return obj;
};

_.timestamp = function() {
    Date.now = Date.now || function() {
        return +new Date;
    };
    return Date.now();
};

_.formatDate = function(d) {
    // YYYY-MM-DDTHH:MM:SS in UTC
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear() + '-' +
        pad(d.getUTCMonth() + 1) + '-' +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds());
};

_.safewrap = function(f) {
    return function() {
        try {
            return f.apply(this, arguments);
        } catch (e) {
            console.critical('Implementation error. Please contact support@DATracker.com.');
        }
    };
};

_.safewrap_class = function(klass, functions) {
    for (var i = 0; i < functions.length; i++) {
        klass.prototype[functions[i]] = _.safewrap(klass.prototype[functions[i]]);
    }
};

_.safewrap_instance_methods = function(obj) {
    for (var func in obj) {
        if (typeof(obj[func]) === 'function') {
            obj[func] = _.safewrap(obj[func]);
        }
    }
};

// 去掉undefined和null
_.strip_empty_properties = function(p) {
    var ret = {};
    _.each(p, function(v, k) {
        if (_.isString(v) && v.length > 0) {
            ret[k] = v;
        }
    });
    return ret;
};

/*
 * this function returns a copy of object after truncating it.  If
 * passed an Array or Object it will iterate through obj and
 * truncate all the values recursively.
 */
_.truncate = function(obj, length) {
    var ret;

    if (typeof(obj) === 'string') {
        ret = obj.slice(0, length);
    } else if (_.isArray(obj)) {
        ret = [];
        _.each(obj, function(val) {
            ret.push(_.truncate(val, length));
        });
    } else if (_.isObject(obj)) {
        ret = {};
        _.each(obj, function(val, key) {
            ret[key] = _.truncate(val, length);
        });
    } else {
        ret = obj;
    }

    return ret;
};

_.JSONEncode = (function() {
    return function(mixed_val) {
        var value = mixed_val;
        var quote = function(string) {
            var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; // eslint-disable-line no-control-regex
            var meta = { // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };

            escapable.lastIndex = 0;
            return escapable.test(string) ?
                '"' + string.replace(escapable, function(a) {
                    var c = meta[a];
                    return typeof c === 'string' ? c :
                        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        };

        var str = function(key, holder) {
            var gap = '';
            var indent = '    ';
            var i = 0; // The loop counter.
            var k = ''; // The member key.
            var v = ''; // The member value.
            var length = 0;
            var mind = gap;
            var partial = [];
            var value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.
            if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // What happens next depends on the value's type.
            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':
                    // JSON numbers must be finite. Encode non-finite numbers as null.
                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':
                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                case 'object':
                    // If the type is 'object', we might be dealing with an object or an array or
                    // null.
                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.
                    if (!value) {
                        return 'null';
                    }

                    // Make an array to hold the partial results of stringifying this object value.
                    gap += indent;
                    partial = [];

                    // Is the value an array?
                    if (toString.apply(value) === '[object Array]') {
                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.
                        v = partial.length === 0 ? '[]' :
                            gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                            '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

                    // Iterate through all of the keys in the object.
                    for (k in value) {
                        if (hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.
                    v = partial.length === 0 ? '{}' :
                        gap ? '{' + partial.join(',') + '' +
                        mind + '}' : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        };

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.
        return str('', {
            '': value
        });
    };
})();

_.JSONDecode = (function() { // https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js
    var at, // The index of the current character
        ch, // The current character
        escapee = {
            '"': '"',
            '\\': '\\',
            '/': '/',
            'b': '\b',
            'f': '\f',
            'n': '\n',
            'r': '\r',
            't': '\t'
        },
        text,
        error = function(m) {
            throw {
                name: 'SyntaxError',
                message: m,
                at: at,
                text: text
            };
        },
        next = function(c) {
            // If a c parameter is provided, verify that it matches the current character.
            if (c && c !== ch) {
                error('Expected \'' + c + '\' instead of \'' + ch + '\'');
            }
            // Get the next character. When there are no more characters,
            // return the empty string.
            ch = text.charAt(at);
            at += 1;
            return ch;
        },
        number = function() {
            // Parse a number value.
            var number,
                string = '';

            if (ch === '-') {
                string = '-';
                next('-');
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
            if (ch === '.') {
                string += '.';
                while (next() && ch >= '0' && ch <= '9') {
                    string += ch;
                }
            }
            if (ch === 'e' || ch === 'E') {
                string += ch;
                next();
                if (ch === '-' || ch === '+') {
                    string += ch;
                    next();
                }
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
            }
            number = +string;
            if (!isFinite(number)) {
                error('Bad number');
            } else {
                return number;
            }
        },

        string = function() {
            // Parse a string value.
            var hex,
                i,
                string = '',
                uffff;
            // When parsing for string values, we must look for " and \ characters.
            if (ch === '"') {
                while (next()) {
                    if (ch === '"') {
                        next();
                        return string;
                    }
                    if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else {
                        string += ch;
                    }
                }
            }
            error('Bad string');
        },
        white = function() {
            // Skip whitespace.
            while (ch && ch <= ' ') {
                next();
            }
        },
        word = function() {
            // true, false, or null.
            switch (ch) {
                case 't':
                    next('t');
                    next('r');
                    next('u');
                    next('e');
                    return true;
                case 'f':
                    next('f');
                    next('a');
                    next('l');
                    next('s');
                    next('e');
                    return false;
                case 'n':
                    next('n');
                    next('u');
                    next('l');
                    next('l');
                    return null;
            }
            error('Unexpected "' + ch + '"');
        },
        value, // Placeholder for the value function.
        array = function() {
            // Parse an array value.
            var array = [];

            if (ch === '[') {
                next('[');
                white();
                if (ch === ']') {
                    next(']');
                    return array; // empty array
                }
                while (ch) {
                    array.push(value());
                    white();
                    if (ch === ']') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error('Bad array');
        },
        object = function() {
            // Parse an object value.
            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                if (ch === '}') {
                    next('}');
                    return object; // empty object
                }
                while (ch) {
                    key = string();
                    white();
                    next(':');
                    if (Object.hasOwnProperty.call(object, key)) {
                        error('Duplicate key "' + key + '"');
                    }
                    object[key] = value();
                    white();
                    if (ch === '}') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error('Bad object');
        };

    value = function() {
        // Parse a JSON value. It could be an object, an array, a string,
        // a number, or a word.
        white();
        switch (ch) {
            case '{':
                return object();
            case '[':
                return array();
            case '"':
                return string();
            case '-':
                return number();
            default:
                return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

    // Return the json_parse function. It will have access to all of the
    // above functions and variables.
    return function(source) {
        var result;

        text = source;
        at = 0;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error('Syntax error');
        }

        return result;
    };
})();

_.base64Encode = function(data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data = _.utf8Encode(data);

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }

    return enc;
};

_.utf8Encode = function(string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    var utftext = '',
        start,
        end;
    var stringl = 0,
        n;

    start = end = 0;
    stringl = string.length;

    for (n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if ((c1 > 127) && (c1 < 2048)) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.substring(start, string.length);
    }

    return utftext;
};

_.sha1 = function(str){
    
   /*
     * A Javascript implementation of the Secure Hash Algorithm, SHA-1, as defined
     * in FIPS PUB 180-1
     * Version 2.1-BETA Copyright Paul Johnston 2000 - 2002.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    /*
     * Configurable variables. You may need to tweak these to be compatible with
     * the server-side, but the defaults work in most cases.
     */
    var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase     */
    var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance  */
    var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode    */
    /*
     * These are the functions you'll usually want to call
     * They take string arguments and return either hex or base-64 encoded strings
     */
    function hex_sha1(s) {
        return binb2hex(core_sha1(str2binb(s), s.length * chrsz));
    }
    function b64_sha1(s) {
        return binb2b64(core_sha1(str2binb(s), s.length * chrsz));
    }
    function str_sha1(s) {
        return binb2str(core_sha1(str2binb(s), s.length * chrsz));
    }
    function hex_hmac_sha1(key, data) {
        return binb2hex(core_hmac_sha1(key, data));
    }
    function b64_hmac_sha1(key, data) {
        return binb2b64(core_hmac_sha1(key, data));
    }
    function str_hmac_sha1(key, data) {
        return binb2str(core_hmac_sha1(key, data));
    }
    /*
     * Perform a simple self-test to see if the VM is working
     */
    function sha1_vm_test() {
        return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
    }
    /*
     * Calculate the SHA-1 of an array of big-endian words, and a bit length
     */
    function core_sha1(x, len) {
     /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;
        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var j = 0; j < 80; j++) {
                if (j < 16) w[j] = x[i + j];
                else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = rol(b, 30);
                b = a;
                a = t;
            }
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);
    }
    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    function sha1_ft(t, b, c, d) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }
    /*
     * Determine the appropriate additive constant for the current iteration
     */
    function sha1_kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
    }
    /*
     * Calculate the HMAC-SHA1 of a key and some data
     */
    function core_hmac_sha1(key, data) {
        var bkey = str2binb(key);
        if (bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);
        var ipad = Array(16),
            opad = Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
        return core_sha1(opad.concat(hash), 512 + 160);
    }
    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    /*
     * Convert an 8-bit or 16-bit string to an array of big-endian words
     * In 8-bit function, characters >255 have their hi-byte silently ignored.
     */
    function str2binb(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz)
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        return bin;
    }
    /*
     * Convert an array of big-endian words to a string
     */
    function binb2str(bin) {
        var str = "";
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < bin.length * 32; i += chrsz)
            str += String.fromCharCode((bin[i >> 5] >>> (24 - i % 32)) & mask);
        return str;
    }
    /*
     * Convert an array of big-endian words to a hex string.
     */
    function binb2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    }
    /*
     * Convert an array of big-endian words to a base-64 string
     */
    function binb2b64(binarray) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i += 3) {
            var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
            for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
                else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
            }
        }
        return str;
    }

    return hex_sha1(str);
};

// v8，循环周期长度是 2^60 或 2^128-1, 下面是 2^140 == 2^(4*35) ，无法满足需求，故需重新定义实现。
// 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.length = 36; 16 = 2^4;
// 最主要原因：生成的随机：https://www.w3cplus.com/javascript/tifu-by-using-math-random.html
// 下面只使用了16位，导致循环周期长度变的更短，容易碰撞重复
_.UUID2 = (function() {
    var callback = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };
    return callback;
})();

// https://www.w3cplus.com/javascript/tifu-by-using-math-random.html v8实现的 Math.random 有问题，不能纯粹使用该方法随机
_.UUID = (function() {
    var T = function() {
        var d = 1 * new Date(), i = 0;
        while (d == 1 * new Date()) {
            i++;
        }
        return d.toString(16) + i.toString(16);
    };
    var R = function() {
        return Math.random().toString(16).replace('.', '');
    };
    var UA = function(n) {
        var ua = navigator.userAgent, i, ch, buffer = [], ret = 0;
  
        function xor(result, byte_array) {
            var j, tmp = 0;
            for (j = 0; j < byte_array.length; j++) {
                tmp |= (buffer[j] << j * 8);
            }
            return result ^ tmp;
        }
  
        for (i = 0; i < ua.length; i++) {
            ch = ua.charCodeAt(i);
            buffer.unshift(ch & 0xFF);
            if (buffer.length >= 4) {
                ret = xor(ret, buffer);
                buffer = [];
            }
        }
  
        if (buffer.length > 0) {
            ret = xor(ret, buffer);
        }
  
        return ret.toString(16);
    };
  
    return function() {
      // 有些浏览器取个屏幕宽度都异常...
        var se = String(screen.height * screen.width);
        if (se && /\d{5,}/.test(se)) {
            se = se.toString(16);
        } else {
            se = String(Math.random() * 31242).replace('.', '').slice(0, 8);
        }
        var val = (T() + '-' + R() + '-' + UA() + '-' + se + '-' + T());
        if(val){
            return _.sha1(val); 
        }else{
            return _.sha1((String(Math.random()) + String(Math.random()) + String(Math.random())).slice(2, 15));
        }
    };
})();


// _.isBlockedUA()
// 阻止以下web爬虫执行我们的JS
_.isBlockedUA = function(ua) {
    if (/(google web preview|baiduspider|yandexbot|bingbot|googlebot|yahoo! slurp)/i.test(ua)) {
        return true;
    }
    return false;
};

/**
 * @param {Object=} formdata
 * @param {string=} arg_separator
 */
_.HTTPBuildQuery = function(formdata, arg_separator) {
    var use_val, use_key, tmp_arr = [];

    if (_.isUndefined(arg_separator)) {
        arg_separator = '&';
    }

    _.each(formdata, function(val, key) {
        use_val = encodeURIComponent(val.toString());
        use_key = encodeURIComponent(key);
        tmp_arr[tmp_arr.length] = use_key + '=' + use_val;
    });

    return tmp_arr.join(arg_separator);
};

_.getQueryParam = function(url, param) {
    // Expects a raw URL

    param = param.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regexS = '[\\?&]' + param + '=([^&#]*)',
        regex = new RegExp(regexS),
        results = regex.exec(url);
    if (results === null || (results && typeof(results[1]) !== 'string' && results[1].length)) {
        return '';
    } else {
        return decodeURIComponent(results[1]).replace(/\+/g, ' ');
    }
};

_.getHashParam = function(hash, param) {
    var matches = hash.match(new RegExp(param + '=([^&]*)'));
    return matches ? matches[1] : null;
};

// _.cookie
// Methods partially borrowed from quirksmode.org/js/cookies.html
_.cookie = {
    get: function(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    },

    parse: function(name) {
        var cookie;
        try {
            cookie = _.JSONDecode(_.cookie.get(name)) || {};
        } catch (err) {
            // noop
        }
        return cookie;
    },

    set_seconds: function(name, value, seconds, cross_subdomain, is_secure) {
        var cdomain = '',
            expires = '',
            secure = '';

        if (cross_subdomain) {
            var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                domain = matches ? matches[0] : '';

            cdomain = ((domain) ? '; domain=.' + domain : '');
        }

        if (seconds) {
            var date = new Date();
            date.setTime(date.getTime() + (seconds * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        if (is_secure) {
            secure = ';SameSite=None; secure';
        }

        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
    },

    set: function(name, value, days, cross_subdomain, is_secure) {
        var cdomain = '', expires = '', secure = '';

        if (cross_subdomain) {
            var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                domain = matches ? matches[0] : '';

            cdomain   = ((domain) ? '; domain=.' + domain : '');
        }

        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        if (is_secure) {
            secure = ';SameSite=None; secure';
        }

        var new_cookie_val = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
        document.cookie = new_cookie_val;
        return new_cookie_val;
    },

    setUseHour: function(name, value, hour, cross_subdomain, is_secure) {
        var cdomain = '', expires = '', secure = '';

        if (cross_subdomain) {
            var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                domain = matches ? matches[0] : '';

            cdomain   = ((domain) ? '; domain=.' + domain : '');
        }

        if (hour) {
            var date = new Date();
            date.setTime(date.getTime() + (hour * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        if (is_secure) {
            secure = ';SameSite=None; secure';
        }

        var new_cookie_val = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
        document.cookie = new_cookie_val;
        return new_cookie_val;
    },

    remove: function(name, cross_subdomain) {
        _.cookie.set(name, '', -1, cross_subdomain);
    }
};

// _.localStorage
_.localStorage = {
    error: function(msg) {
        console.error('localStorage error: ' + msg);
    },

    get: function(name) {
        try {
            return window.localStorage.getItem(name);
        } catch (err) {
            _.localStorage.error(err);
        }
        return null;
    },

    parse: function(name) {
        try {
            return _.JSONDecode(_.localStorage.get(name)) || {};
        } catch (err) {
            // noop
        }
        return null;
    },

    set: function(name, value) {
        try {
            window.localStorage.setItem(name, value);
        } catch (err) {
            _.localStorage.error(err);
        }
    },

    remove: function(name) {
        try {
            window.localStorage.removeItem(name);
        } catch (err) {
            _.localStorage.error(err);
        }
    }
};

_.register_event = (function() {
    // written by Dean Edwards, 2005
    // with input from Tino Zijdel - crisp@xs4all.nl
    // with input from Carl Sverre - mail@carlsverre.com
    // with input from DATracker
    // http://dean.edwards.name/weblog/2005/10/add-event/
    // https://gist.github.com/1930440

    /**
     * @param {Object} element
     * @param {string} type
     * @param {function(...[*])} handler
     * @param {boolean=} oldSchool
     * @param {boolean=} useCapture
     */
    var register_event = function(element, type, handler, oldSchool, useCapture) {
        if (!element) {
            console.error('No valid element provided to register_event');
            return;
        }

        if (element.addEventListener && !oldSchool) {
            element.addEventListener(type, handler, !!useCapture);
        } else {
            var ontype = 'on' + type;
            var old_handler = element[ontype]; // can be undefined
            element[ontype] = makeHandler(element, handler, old_handler);
        }
    };

    function makeHandler(element, new_handler, old_handlers) {
        var handler = function(event) {
            event = event || fixEvent(window.event);

            // this basically happens in firefox whenever another script
            // overwrites the onload callback and doesn't pass the event
            // object to previously defined callbacks.  All the browsers
            // that don't define window.event implement addEventListener
            // so the dom_loaded handler will still be fired as usual.
            if (!event) {
                return undefined;
            }

            var ret = true;
            var old_result, new_result;

            if (_.isFunction(old_handlers)) {
                old_result = old_handlers(event);
            }
            new_result = new_handler.call(element, event);

            if ((false === old_result) || (false === new_result)) {
                ret = false;
            }

            return ret;
        };

        return handler;
    }

    function fixEvent(event) {
        if (event) {
            event.preventDefault = fixEvent.preventDefault;
            event.stopPropagation = fixEvent.stopPropagation;
        }
        return event;
    }
    fixEvent.preventDefault = function() {
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function() {
        this.cancelBubble = true;
    };

    return register_event;
})();

_.register_hash_event = function(callback) {
    _.register_event(window,'hashchange',callback);
};

_.dom_query = (function() {
    /* document.getElementsBySelector(selector)
    - returns an array of element objects from the current document
    matching the CSS selector. Selectors can contain element names,
    class names and ids and can be nested. For example:

    elements = document.getElementsBySelector('div#main p a.external')

    Will return an array of all 'a' elements with 'external' in their
    class attribute that are contained inside 'p' elements that are
    contained inside the 'div' element which has id="main"

    New in version 0.4: Support for CSS2 and CSS3 attribute selectors:
    See http://www.w3.org/TR/css3-selectors/#attribute-selectors

    Version 0.4 - Simon Willison, March 25th 2003
    -- Works in Phoenix 0.5, Mozilla 1.3, Opera 7, Internet Explorer 6, Internet Explorer 5 on Windows
    -- Opera 7 fails

    Version 0.5 - Carl Sverre, Jan 7th 2013
    -- Now uses jQuery-esque `hasClass` for testing class name
    equality.  This fixes a bug related to '-' characters being
    considered not part of a 'word' in regex.
    */

    function getAllChildren(e) {
        // Returns all children of element. Workaround required for IE5/Windows. Ugh.
        return e.all ? e.all : e.getElementsByTagName('*');
    }

    var bad_whitespace = /[\t\r\n]/g;

    function hasClass(elem, selector) {
        var className = ' ' + selector + ' ';
        return ((' ' + elem.className + ' ').replace(bad_whitespace, ' ').indexOf(className) >= 0);
    }

    function getElementsBySelector(selector) {
        // Attempt to fail gracefully in lesser browsers
        if (!document.getElementsByTagName) {
            return [];
        }
        // Split selector in to tokens
        var tokens = selector.split(' ');
        var token, bits, tagName, found, foundCount, i, j, k, elements, currentContextIndex;
        var currentContext = [document];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i].replace(/^\s+/, '').replace(/\s+$/, '');
            if (token.indexOf('#') > -1) {
                // Token is an ID selector
                bits = token.split('#');
                tagName = bits[0];
                var id = bits[1];
                var element = document.getElementById(id);
                if (!element || (tagName && element.nodeName.toLowerCase() != tagName)) {
                    // element not found or tag with that ID not found, return false
                    return [];
                }
                // Set currentContext to contain just this element
                currentContext = [element];
                continue; // Skip to next token
            }
            if (token.indexOf('.') > -1) {
                // Token contains a class selector
                bits = token.split('.');
                tagName = bits[0];
                var className = bits[1];
                if (!tagName) {
                    tagName = '*';
                }
                // Get elements matching tag, filter them for class selector
                found = [];
                foundCount = 0;
                for (j = 0; j < currentContext.length; j++) {
                    if (tagName == '*') {
                        elements = getAllChildren(currentContext[j]);
                    } else {
                        elements = currentContext[j].getElementsByTagName(tagName);
                    }
                    for (k = 0; k < elements.length; k++) {
                        found[foundCount++] = elements[k];
                    }
                }
                currentContext = [];
                currentContextIndex = 0;
                for (j = 0; j < found.length; j++) {
                    if (found[j].className &&
                        _.isString(found[j].className) && // some SVG elements have classNames which are not strings
                        hasClass(found[j], className)
                    ) {
                        currentContext[currentContextIndex++] = found[j];
                    }
                }
                continue; // Skip to next token
            }
            // Code to deal with attribute selectors
            var token_match = token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/);
            if (token_match) {
                tagName = token_match[1];
                var attrName = token_match[2];
                var attrOperator = token_match[3];
                var attrValue = token_match[4];
                if (!tagName) {
                    tagName = '*';
                }
                // Grab all of the tagName elements within current context
                found = [];
                foundCount = 0;
                for (j = 0; j < currentContext.length; j++) {
                    if (tagName == '*') {
                        elements = getAllChildren(currentContext[j]);
                    } else {
                        elements = currentContext[j].getElementsByTagName(tagName);
                    }
                    for (k = 0; k < elements.length; k++) {
                        found[foundCount++] = elements[k];
                    }
                }
                currentContext = [];
                currentContextIndex = 0;
                var checkFunction; // This function will be used to filter the elements
                switch (attrOperator) {
                    case '=': // Equality
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName) == attrValue);
                        };
                        break;
                    case '~': // Match one of space seperated words
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).match(new RegExp('\\b' + attrValue + '\\b')));
                        };
                        break;
                    case '|': // Match start with value followed by optional hyphen
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')));
                        };
                        break;
                    case '^': // Match starts with value
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).indexOf(attrValue) === 0);
                        };
                        break;
                    case '$': // Match ends with value - fails with "Warning" in Opera 7
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length);
                        };
                        break;
                    case '*': // Match ends with value
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).indexOf(attrValue) > -1);
                        };
                        break;
                    default:
                        // Just test for existence of attribute
                        checkFunction = function(e) {
                            return e.getAttribute(attrName);
                        };
                }
                currentContext = [];
                currentContextIndex = 0;
                for (j = 0; j < found.length; j++) {
                    if (checkFunction(found[j])) {
                        currentContext[currentContextIndex++] = found[j];
                    }
                }
                // alert('Attribute Selector: '+tagName+' '+attrName+' '+attrOperator+' '+attrValue);
                continue; // Skip to next token
            }
            // If we get here, token is JUST an element (not a class or ID selector)
            tagName = token;
            found = [];
            foundCount = 0;
            for (j = 0; j < currentContext.length; j++) {
                elements = currentContext[j].getElementsByTagName(tagName);
                for (k = 0; k < elements.length; k++) {
                    found[foundCount++] = elements[k];
                }
            }
            currentContext = found;
        }
        return currentContext;
    }

    return function(query) {
        if (_.isElement(query)) {
            return [query];
        } else if (_.isObject(query) && !_.isUndefined(query.length)) {
            return query;
        } else {
            return getElementsBySelector.call(this, query);
        }
    };
})();

_.info = {
    referringDomain: function(referrer) {
        if (referrer && referrer.split) {
            var split = referrer.split('/');
            if (split.length >= 3) {
                return split[2];
            }
        }
        return '';
    },

    properties: function() {
        var windowsOs = {
            '5.0': 'Win2000',
            '5.1': 'WinXP',
            '5.2': 'Win2003',
            '6.0': 'WindowsVista',
            '6.1': 'Win7',
            '6.2': 'Win8',
            '6.3': 'Win8.1',
            '10.0': 'Win10'
        };
        var devicePlatform = Device.devicePlatform() || 'web';
        var deviceModel = Device.deviceModel();
        var isWindows = Device.windows();
        var deviceOsVersion = detector.os.name + ' ' +detector.os.fullVersion;
        if(isWindows) {
            if(windowsOs[detector.os.fullVersion]) {
                deviceOsVersion = windowsOs[detector.os.fullVersion];
            }
        }
        return _.extend(_.strip_empty_properties({
            'deviceModel': deviceModel,
            'deviceOs': detector.os.name,
            'deviceOsVersion': deviceOsVersion,
            'browser': detector.browser.name,
            'referrer': decodeURIComponent(document.referrer), // 说明：如果url上带有 @ 空格之类的，浏览器会做编码，这样子采集的url 不利于后面数据分析，故需要解析下
            'referring_domain': _.info.referringDomain(document.referrer),
            'devicePlatform': devicePlatform,
            'currentDomain': _.info.referringDomain(window.location.href)
        }), {
            'current_url': decodeURIComponent(window.location.href), // 说明：如果url上带有 @ 空格之类的，浏览器会做编码，这样子采集的url 不利于后面数据分析，故需要解析下
            'title': document.title || '',
            'url_path': window.location.pathname || '',
            'browser_version': detector.browser.fullVersion,
            'screen_height': screen.height,
            'screen_width': screen.width,
            'hb_lib': devicePlatform,
            'lib_version': Config.LIB_VERSION
        });
    }
};

//判断一个对象的长度
_.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

_.isJSONString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

//通过一个url获取到域名
_.get_host = function(url) {
    var host = '';
    if(typeof url === 'undefined' || url === null) {
        url = window.location.href;
    }
    var regex = /.*\:\/\/([^\/]*).*/;
    var match = url.match(regex);
    if(typeof match !== 'undefined' && match !== null) {
        host = match[1];
    }
    return host;
};

// 获取网站的二级域名
_.get_second_domain = function(host) {
    var str = '';
    try {
        if (host) {
            var arr = host.split('.');
            if (arr.length === 2) {
                str = '.' +host;
            } else 
            if (arr.length === 3) {
                str = '.' +arr[1] + '.' + arr[2];
            } else {
                str = host.substring(host.indexOf('.'));
            }
        }   
    } catch (error) {
        str = host;
    }
    return str;
};

_.sessionStorage = {
    isSupport:function(){
        var supported = true;
  
        var key = '__hubbledatasupport__';
        var val = 'testIsSupportStorage';
        try{
            if(sessionStorage && sessionStorage.setItem){
                sessionStorage.setItem(key,val);
                sessionStorage.removeItem(key,val);
                supported = true;
            }else{
                supported = false;          
            }
        }catch(e){
            supported = false;
        }
        return supported;
    }
};

_.loadScript = function(para) {
    para = _.extend({
        success: function() {},
        error: function() {},
        appendCall: function(g) {
            document.getElementsByTagName('head')[0].appendChild(g);
        }
    }, para);
    
    var g = null;
    if (para.type === 'css') {
        g = document.createElement('link');
        g.rel = 'stylesheet';
        g.href = para.url;
    }
    if (para.type === 'js') {
        g = document.createElement('script');
        g.async = 'async';
        g.setAttribute('charset','UTF-8');
        g.src = para.url;
        g.type = 'text/javascript';
    }
    g.onload = g.onreadystatechange = function() {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            para.success();
            g.onload = g.onreadystatechange = null;
        }
    };
    g.onerror = function() {
        para.error();
        g.onerror = null;
    };
      // if iframe
    para.appendCall(g);  
};

_.ry = function(dom){  
    return new _.ry.init(dom);
};
_.ry.init = function(dom){
    this.ele = dom;
};
_.ry.init.prototype = {
    addClass: function(para){
        var classes = ' ' + this.ele.className + ' ';
        if(classes.indexOf(' ' + para + ' ') === -1){
            this.ele.className = this.ele.className + (this.ele.className === '' ? '' : ' ') + para;
        }
        return this;
    },
    removeClass: function(para){
        var classes = ' ' + this.ele.className + ' ';
        if(classes.indexOf(' ' + para + ' ') !== -1){
            this.ele.className = classes.replace(' ' + para + ' ', ' ').slice(1,-1);
        }
        return this;
    },
    hasClass: function(para){
        var classes = ' ' + this.ele.className + ' ';    
        if(classes.indexOf(' ' + para + ' ') !== -1){
            return true;
        }else{
            return false;
        }
    },
    attr: function(key,value){
        if(typeof key === 'string' && _.isUndefined(value)){
            return this.ele.getAttribute(key);
        }
        if(typeof key === 'string'){
            value = String(value);
            this.ele.setAttribute(key,value);
        }
        return this;
    },
    offset: function(){
        var rect = this.ele.getBoundingClientRect();
        if ( rect.width || rect.height ) {
            var doc = this.ele.ownerDocument;
            var docElem = doc.documentElement;
  
            return {
                top: rect.top + window.pageYOffset - docElem.clientTop,
                left: rect.left + window.pageXOffset - docElem.clientLeft
            };
        }else{
            return {
                top: 0,
                left: 0
            }
        }
  
    },
    getSize: function(){
        if (!window.getComputedStyle) {
            return {width: this.ele.offsetWidth, height: this.ele.offsetHeight};
        }
        try {
            var bounds = this.ele.getBoundingClientRect();
            return {width: bounds.width, height: bounds.height};
        } catch (e){
            return {width: 0, height: 0};
        }
    },
    getStyle: function(value){
        if(this.ele.currentStyle){
            return this.ele.currentStyle[value];
        }else{
            return this.ele.ownerDocument.defaultView.getComputedStyle(this.ele, null).getPropertyValue(value);
        }
    },
    wrap: function(elementTagName){
        var ele = document.createElement(elementTagName);
        this.ele.parentNode.insertBefore(ele, this.ele);
        ele.appendChild(this.ele);
        return _.ry(ele);
    },
    getCssStyle: function(prop){
        var result = this.ele.style.getPropertyValue(prop);
        if (result) {
            return result;
        }
        var rules = null;
        if(typeof window.getMatchedCSSRules === 'function'){
            rules = getMatchedCSSRules(this.ele);
        }
        if(!rules || !_.isArray(rules)){
            return null;
        }
        for (var i = rules.length - 1; i >= 0; i--) {
            var r = rules[i];
            result = r.style.getPropertyValue(prop);
            if (result) {
                return result;
            }
        }
    },
    sibling:function(cur, dir ){
        while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
        return cur;
    },
    next: function() {
        return this.sibling( this.ele, "nextSibling" );
    },
    prev: function( elem ) {
        return this.sibling( this.ele, "previousSibling" );
    },
    siblings: function( elem ) {
        return this.siblings( ( this.ele.parentNode || {} ).firstChild, this.ele);
    },
    children: function( elem ) {
        return this.siblings( this.ele.firstChild );
    },
    parent: function(){
        var parent = this.ele.parentNode;
        parent = parent && parent.nodeType !== 11 ? parent : null;
        return _.ry(parent);
    }
};

_.addEvent = function() {
    function fixEvent(event) {
        if (event) {
            event.preventDefault = fixEvent.preventDefault;
            event.stopPropagation = fixEvent.stopPropagation;
            event._getPath = fixEvent._getPath;
        }
        return event;
    }
    fixEvent._getPath = function(){
        var ev = this;
        var polyfill = function () {
            try{
                var element = ev.target;
                var pathArr = [element];
                if (element === null || element.parentElement === null) {
                    return [];
                }
                while (element.parentElement !== null) {
                    element = element.parentElement;
                    pathArr.unshift(element); 
                }
                return pathArr;
            }catch(err){
                return [];
            }

        };
        return this.path || (this.composedPath && this.composedPath()) || polyfill();
    };
    fixEvent.preventDefault = function() {
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function() {
        this.cancelBubble = true;
    };


    var register_event = function(element, type, handler) {
        if (element && element.addEventListener) {
            element.addEventListener(type, function(e){
                e._getPath = fixEvent._getPath;
                handler.call(this,e);
            }, false);
        } else {
            var ontype = 'on' + type;
            var old_handler = element[ontype];
            element[ontype] = makeHandler(element, handler, old_handler);
        }
    };
    function makeHandler(element, new_handler, old_handlers) {
        var handler = function(event) {
            event = event || fixEvent(window.event);
            if (!event) {
                return undefined;
            }
            event.target = event.srcElement;

            var ret = true;
            var old_result, new_result;
            if (typeof old_handlers === 'function') {
                old_result = old_handlers(event);
            }
            new_result = new_handler.call(element, event);
            if ((false === old_result) || (false === new_result)) {
                ret = false;
            }
            return ret;
        };
        return handler;
    }

    register_event.apply(null,arguments);
};

// 获取元素的一些信息
_.getEleInfo = function(obj, heatmapConfig, context){
    if(!obj.target || !heatmapConfig){
        return false;
    }
  
    var target = obj.target;
    var tagName = target.tagName.toLowerCase();
  
  
    var props = {};
  
    props.type = tagName;
    //props.name = target.getAttribute('name');
    //props.id = target.getAttribute('id');
    //props.className = typeof target.className === 'string' ? target.className : null;
  
    // 获取内容
    
    var textContent = '';
    if (target.textContent) {
        textContent = _.trim(target.textContent);
    }else if(target.innerText){
        textContent = _.trim(target.innerText);
    }
    if (textContent) {
        textContent = textContent.replace(/[\r\n]/g, ' ').replace(/[ ]+/g, ' ').substring(0, 255);
    }
    props.text = textContent || '';
  
    // 针对inut默认只采集button和submit非名感的词汇。可以自定义
    if(tagName === 'input'){
        if(target.type === 'button' || target.type === 'submit'){
            props.text = target.value || '';
        } else if (heatmapConfig && (typeof heatmapConfig.collect_input === 'function') && heatmapConfig.collect_input(target, context)){
            props.text = target.value || '';
        }
    }
  
    props = _.strip_empty_properties(props);
  
    //props.$url = location.href;
    //props.path = location.pathname;
    //props.$title = document.title;
  
    return props;
  
};

_.ajax = {
    post: function(url, options, callback, timeout) {
        var that = this;  
        that.callback = callback || function(params) {};  
        try {
            var req = new XMLHttpRequest();
            req.open('POST', url, true);
            req.setRequestHeader("Content-type","application/json");
            req.withCredentials = true;
            req.ontimeout = function() {
                that.callback({status: 0, error: true, message: 'request ' +url + ' time out'});
            };
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        that.callback(_.JSONDecode(req.responseText));
                    } else {
                        var message = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                        that.callback({status: 0, error: true, message: message});
                    }
                }
            };
            req.timeout = timeout || 5000;
            req.send(_.JSONEncode(options));
        } catch (e) {}
    },
    get: function(url, callback) {
        try {
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
        // req.setRequestHeader("Content-type","application/json");
            req.withCredentials = true;
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        if (callback) {
                            callback(_.JSONDecode(req.responseText));
                        }
                    } else {
                        if (callback) {
                            var message = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                            callback({status: 0, error: true, message: message});
                        }
                    }
                }
            };
            req.send(null);
        } catch (e) {}
    }
};
// 消息订阅/推送
_.innerEvent = {
    /**
     * 订阅
     *  */ 
    on: function(key, fn) {
        if(!this._list) {
            this._list = {};
        }
        if (!this._list[key]) {
            this._list[key] = [];
        }
        this._list[key].push(fn);
    },
    off: function(key) {
        if(!this._list) {
            this._list = {};
        }
        if (!this._list[key]) {
            return;
        }else{
            delete this._list[key];
        }
    },
    /**
     * 推送
     */
    trigger: function() {
        var args = Array.prototype.slice.call(arguments);
        var key = args[0];
        var arrFn = this._list && this._list[key];
        if (!arrFn || arrFn.length === 0) {
            return;
        }
        for (var i = 0; i < arrFn.length; i++) {
            if( typeof arrFn[i] == 'function') {
                arrFn[i].apply(this, args);
            }
        }
    }
};


// EXPORTS (for closure compiler)
_['toArray']            = _.toArray;
_['isObject']           = _.isObject;
_['JSONEncode']         = _.JSONEncode;
_['JSONDecode']         = _.JSONDecode;
_['isBlockedUA']        = _.isBlockedUA;
_['isEmptyObject']      = _.isEmptyObject;
_['info']               = _.info;
_['info']['properties'] = _.info.properties;
_['sessionStorage'] = _.sessionStorage;
_['sessionStorage']['isSupport'] = _.sessionStorage.isSupport;
_['loadScript'] = _.loadScript;
_['ry'] = _.ry;
_['addEvent'] = _.addEvent;
_['getEleInfo'] = _.getEleInfo;
_['ajax'] = _.ajax;

export { _, userAgent, console };
