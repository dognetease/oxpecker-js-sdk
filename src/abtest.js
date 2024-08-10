/* eslint-disable */
/**
 * abtest 模块，实验类型支持编程模式、多链接模式
 * 支持调试模式
 */
import { _, console} from './utils';
//md5
import jsMd5 from './md5';

// 计算完md5值后，取 8-24位数据
var get8To24Md5 = function(str) {
    str = str.substring(8, 24);
    return str;
};

//调试模块
var debug = {
    // 未上报数据列表
    _queue: [],
    // 加载 control.js后，未执行的回调
    _callbackList: [],
    // 加载 control.js 成功标志，默认false
    _loadControlComplete: false,
    init: function(instance) {
        if(!instance) return;
        var that = this;
        that.DATracker = instance;
        var abtest = that.DATracker.get_config('abtest') || {};
        // 上报数据对象
        that._control = null;
        if (that._isTestDebug()) {
            // 如果是调试模式，重新拉取配置
            abtest.interval_mins_abtest = 0;
            that.DATracker.set_config({abtest: abtest});
            // 调试下，拉取 control.js
            that._loadControlJs();
            // 启动abtest后，才能进入调试模式
            if (abtest.enable_abtest) {
                that._prepare(function() {
                    if(typeof hubbleData_render_mode_fn === 'function'){
                        that._control =  new hubbleData_render_mode_fn(that.DATracker,
                            {type: 'abtest_debug', data: {hubble_abtest_debug_key: that.getDebugKeyData()}}).control;
                        _.each(that._queue, function(data) {
                            that.debugTrack(data);
                        });
                        that._queue = [];
                    }
               });
            } else {
                // 没有开启abtest
                that._prepare(function() {
                    if(typeof hubbleData_render_mode_fn === 'function'){
                        new hubbleData_render_mode_fn(that.DATracker, {type: 'abtest_debug_but_abtest_disable'});
                    }
                });
            }
        }
    },
    // 检测是否处于abtest调试模式下
    _isTestDebug: function() {
        var match = location.href.match(/hubble_abtest_debug_key=([^&#]+)/);
        var bool = false;
        if(match && match[0] && match[1]) {
            bool = true;
            if(_.sessionStorage.isSupport()){
                sessionStorage.setItem('hubble_abtest_debug_key',match[1]);        
            }
        } else if(_.sessionStorage.isSupport() && typeof sessionStorage.getItem('hubble_abtest_debug_key') === 'string') {
            if(sessionStorage.getItem('hubble_abtest_debug_key')) {
                bool = true;
            }
        }
        return bool;
    },
    _loadControlJs: function() {
        var that = this;
        var control_js_url = that.DATracker.config.control_js_url;
        if(control_js_url){
            _.loadScript({
              success:function(){
                that._loadControlComplete = true;
                _.each(that._callbackList, function(callback) {
                    callback.call(that);
                });
                that._callbackList = [];
              },
              error:function(){},
              type:'js',
              url: control_js_url + '?_=' + Math.random()
            });
          }else{
            console.error('没有指定control_js_url的路径');
        }
    },
    _prepare: function(callback) {
        if (!this._loadControlComplete) {
            if (callback) {
                this._callbackList.push(callback);
            }
        }
        if (callback) {
            callback.call(this);
        }
    },
    getDebugKeyData: function() {
        var match = location.href.match(/hubble_abtest_debug_key=([^&#]+)/);
        var keyData = '';
        if (match && match[0] && match[1]) {
            keyData = match[1];
        } else if (_.sessionStorage.isSupport() && typeof sessionStorage.getItem('hubble_abtest_debug_key') === 'string') {
            keyData = sessionStorage.getItem('hubble_abtest_debug_key');
        }
        return keyData;
    },
    // 调试模式下，上报数据给hubbleData_render_mode_fn方法
    debugTrack: function(data) {
        try {
            if (this._control) {
                this._control.addEvent(data);
            } else {
                this._queue.push(data);
            }
        } catch (error) {
            console.error(error)
        }
    },
    // 调试模式下，若拉取配置为空，或者失败，提示,abtest模块调用该方法
    debugNoData: function() {
        var that = this;
        if (that._isTestDebug()) {
            that._prepare(function() {
                if(typeof hubbleData_render_mode_fn === 'function'){
                    new hubbleData_render_mode_fn(that.DATracker, {type: 'abtest_debug_abtest_no_data'});
                }
            });
        }
    }
};

// 多链接模块
var multilinkAbest = {
    multilinkArr: [],
    // 检测是否处于abtest调试模式下，该方法不仅仅在内部引入，sdk初始化时也引用
    isTestDebug: debug._isTestDebug,
    setMultilinkArr: function(multilinkArr) {
        this.multilinkArr = multilinkArr || [];
    },
    // 跳转到目标页
    // variableObj: {variable: '当前使用的实验变量', url: '变量值', type: '全匹配(0)||模糊匹配(1)'}
    // 调试模式：若目标地址跟当前打开的url域名不一致，在目标地址添加`hubble_abtest_debug_key`，保证目标地址也处于调试模式下。
    jump: function(variableObj, callback) {
       variableObj = variableObj || this.getVariable();
       var nowUrl = this.getNowUrl();
       var fuzzyBoolCanJump = true;
       var nowUrlPath = this.getNowProtocolDommainAndPath();

       if (variableObj) {
           // 模糊匹配, 此时拿当前页面的path跟目标url比较
           if (variableObj.type == 1) {
              if (nowUrlPath === variableObj.url || (nowUrlPath + '/' ) === variableObj.url) {
                fuzzyBoolCanJump = false;
              } 
           }
           if (
               variableObj.url !== nowUrl && variableObj.url !== (nowUrl + '/')  && fuzzyBoolCanJump
            ) {
              if (this.isTestDebug()) {
                variableObj.url += variableObj.url.indexOf('?')>-1? '&':'?';
                variableObj.url = variableObj.url + 'hubble_abtest_debug_key=' + debug.getDebugKeyData();
              } 
              window.location.href = variableObj.url;
           } else {
             callback && callback();
           }
       } else {
         callback && callback();
       }
    },
    // 获取当前页的url
    getNowUrl: function() {
        // 若是调试模式下，去除 'hubble_abtest_debug_key'信息
        var url = window.location.href;
        var match;
        if (this.isTestDebug()) {
            // 若原网页的网址并不包含 ?，此时如下结构:https://xx.com?hubble_abtest_debug_key=xxx， 清除 ?hubble_abtest_debug_key=xxx
            // 若原网页的网址包括 ?，此时如下结构:https://xx.com?eee=222&hubble_abtest_debug_key=xxx， 清除 ?hubble_abtest_debug_key=xxx
            if (url.indexOf('?hubble_abtest_debug_key=') > -1) {
                match = url.match(/\?hubble_abtest_debug_key=([^&#]+)/);
            } else if (url.indexOf('&hubble_abtest_debug_key=') > -1) {
                match = url.match(/\&hubble_abtest_debug_key=([^&#]+)/);
            }
            if (match && match[0]) {
                url = url.replace(match[0], '');
            }
        }
        return url;
    },
    getNowProtocolDommainAndPath: function() {
        var _protocol = (("https:" == document.location.protocol) ? "https://" : "http://");
        var protocolDommainAndPath = _protocol + _.info.referringDomain(window.location.href) + window.location.pathname;
        return protocolDommainAndPath;
    },
    // 获取需要使用哪个多链接变量
    // 多链接分为：全匹配和模糊匹配
    // key带有参数的为全匹配，优先执行
    // key不带有参数的为模糊匹配
    // 返回: {variable: '当前使用的实验变量', url: '变量值', type: '全匹配(0)||模糊匹配(1)'}
    getVariable: function() {
        var nowUrlPath = this.getNowProtocolDommainAndPath();
        var nowHref = this.getNowUrl();
        var nowVariableObj = {
            variable: '',
            url: '',
            type: ''
        };
        var jsMd5NowUrlPath =  get8To24Md5(jsMd5(nowUrlPath));
        var jsMd5NowUrlPath_ = get8To24Md5(jsMd5(nowUrlPath+ '/'));
        var jsMd5NowHref = get8To24Md5(jsMd5(nowHref));
        var jsMd5NowHref_ = get8To24Md5(jsMd5(nowHref+ '/'));
        // 全匹配
        var perfectMatchingArr = [];
        // 模糊匹配
        var fuzzyMatchingArr = [];
        for (var i=0; i< this.multilinkArr.length; i++) {
            // 去掉原key的 $符号：'$xxxxx' ==> 'xxxxx'
            var key = this.multilinkArr[i][0].replace(new RegExp('^\\$', 'g'), '');
            // 当前用户访问的页面带参数
            if (nowHref !== nowUrlPath) {
                // 此时说明当前为全匹配
                if (key === jsMd5NowHref || key === jsMd5NowHref_) {
                    perfectMatchingArr.push({
                        variable: this.multilinkArr[i][0],
                        url: this.multilinkArr[i][1],
                        type: 0,
                        key: (key === jsMd5NowHref) ? nowHref : (nowHref + '/')
                    });
                } else
                // key 跟当前path相同，说明为模糊匹配
                if (key === jsMd5NowUrlPath || key === jsMd5NowUrlPath_) {
                    fuzzyMatchingArr.push({
                        variable: this.multilinkArr[i][0],
                        url: this.multilinkArr[i][1],
                        type: 1,
                        key: (key === jsMd5NowUrlPath) ? nowUrlPath : (nowUrlPath + '/')
                    });
                }
            } else {
                // 当前用户访问的页面不带参数
                // 只有模糊匹配选项了
                // key 跟当前path相同，说明为模糊匹配
                if (key === jsMd5NowUrlPath || key === jsMd5NowUrlPath_) {
                    fuzzyMatchingArr.push({
                        variable: this.multilinkArr[i][0],
                        url: this.multilinkArr[i][1],
                        type: 1,
                        key: (key === jsMd5NowUrlPath) ? nowUrlPath : (nowUrlPath + '/')
                    });
                }
            }
        }
        // 执行顺序：拉取的多链接实验配置中，优先执行全匹配
        if (perfectMatchingArr.length) {
            // 取全匹配实验的第一个
            nowVariableObj = perfectMatchingArr[0];
        } else if (fuzzyMatchingArr.length){
            // 取模糊匹配的第一个
            nowVariableObj = fuzzyMatchingArr[0];
        } else {
            // 当前页没有参与多链接实验
            nowVariableObj = null;
        }
        return nowVariableObj;
    }
};

// 可视化实验
var visualizationAbest = {
    _visualizationArr: [],
    // 定时器
    _settimeNum: 0,
    _loadControlJs: function(callback) {
        var that = this;
        var control_js_url = that.DATracker.config.control_js_url;
        if(control_js_url){
            _.loadScript({
              success:function(){
                if (typeof callback === 'function') {
                    callback();
                }
              },
              error:function(){},
              type:'js',
              url: control_js_url + '?_=' + Math.random()
            });
          }else{
            console.error('没有指定control_js_url的路径');
        }
    },
    // 返回是否处于可视化编辑模式下，返回 true 表示在编辑模式下
    isEditor: function() {
        var match = location.href.match(/hubble_abtest_editor_key=([^&#]+)/);
        var bool = false;
        if(match && match[0] && match[1]) {
            bool = true;
        }
        return bool;
    },
    _querySelector: function(selector, parentEl) {
		try {
			return (parentEl || document).querySelector(selector);
		} catch (e) {
			return null
		}
    },
    // 获取当前页的url
    _getNowUrl: function() {
        // 若是调试模式下，去除 'hubble_abtest_debug_key'信息
        var url = window.location.href;
        var match;
        if (this.isTestDebug()) {
            // 若原网页的网址并不包含 ?，此时如下结构:https://xx.com?hubble_abtest_debug_key=xxx， 清除 ?hubble_abtest_debug_key=xxx
            // 若原网页的网址包括 ?，此时如下结构:https://xx.com?eee=222&hubble_abtest_debug_key=xxx， 清除 ?hubble_abtest_debug_key=xxx
            if (url.indexOf('?hubble_abtest_debug_key=') > -1) {
                match = url.match(/\?hubble_abtest_debug_key=([^&#]+)/);
            } else if (url.indexOf('&hubble_abtest_debug_key=') > -1) {
                match = url.match(/\&hubble_abtest_debug_key=([^&#]+)/);
            }
            if (match && match[0]) {
                url = url.replace(match[0], '');
            }
        }
        return url;
    },
    // 可视化实验类型判断：单页面和页面组 ，带有 pattern为页面组  0 页面组，1 单页面
    _setType: function() {
        console.log(this._visualizationArr)
        try {
            for (var i = 0; i < this._visualizationArr.length; i += 1) {
               if (this._visualizationArr[i][1]) {
                 this._visualizationArr[i][1] = _.JSONDecode(this._visualizationArr[i][1]);
                 if (this._visualizationArr[i][1].pattern) {
                    try {
                        this._visualizationArr[i][1].pattern = _.JSONDecode(this._visualizationArr[i][1].pattern);
                    } catch (error) {
                         console.error(error);
                    }
                    this._visualizationArr[i][2] = 0; 
                 } else {
                    this._visualizationArr[i][2] = 1;  
                 }
               } else {
                  this._visualizationArr[i][2] = 1;
               }
            }
        } catch (error) {
            console.error(error);
        }
    },
    // 判断要渲染的元素跟页面上已找到的元素nodeName是否相同,保证渲染的元素是正确的
    _filtrateElementItem: function(itemConfig, $element) {
        var bool = true;
        var nodeName = itemConfig.nodeName;
        if (nodeName !== $element.nodeName.toLocaleUpperCase()) {
            bool = false;
        }
        return bool;
    },
    _resetConfig: function(variationsList) {
        var variations = [];
        _.each(variationsList, function(item, j) {
            var itemArr = item['variations'];
            _.each(itemArr, function(itemConfig, k) {
                variations.push(itemConfig);
            });
        });
        return variations;
    },
    init: function(instance, ABTEST) {
        if(!instance) return;
        var that = this;
        that.DATracker = instance;
        that.ABTEST = ABTEST;
        // 处于编辑状态下，拉取编辑模块
        if (this.isEditor()) {
            var abtest = that.DATracker.get_config('abtest') || {};
            var callback = function() {
                if(typeof hubbleData_render_mode_fn === 'function') {
                    // 启动abtest后，才能进入可视化配置模式
                    if (abtest.enable_abtest) {
                        new hubbleData_render_mode_fn(that.DATracker, {type: 'abtest_editor'});
                    } else {
                        // 没有开启abtest
                        new hubbleData_render_mode_fn(that.DATracker, {type: 'abtest_editor_but_abtest_disable'});
                    }
                    try {
                        that.ABTEST._showPage();
                    } catch (error) {}
                }
            };
            // 调试下，拉取 control.js
            that._loadControlJs(callback);
        }
    },
    isTestDebug: debug._isTestDebug,
    setVisualizationArr: function(visualizationArr) {
        this._visualizationArr = visualizationArr || [];
        this._setType();
    },
    // 动态元素：render时未找到的元素隐藏
    _hidePathStyleSet: function(configArr) {
        var styleCss = '{opacity:0 !important;}';
        var styleText = '';
        _.each(configArr, function(item) {
            styleText += item.selector + styleCss;
        });
        var $styleNode = document.getElementById('_hb_abtesting_path_hides');
        if ($styleNode) {
            if ($styleNode.styleSheet) {
                $styleNode.styleSheet.cssText = styleText;
              } else {
                $styleNode.innerText = '';
                $styleNode.appendChild(document.createTextNode(styleText));
              }
        } else {
            var styleNode = document.createElement('style');
            var head = document.getElementsByTagName('head')[0];
            styleNode.setAttribute('id', '_hb_abtesting_path_hides');
            styleNode.setAttribute('type', 'text/css');
            if (styleNode.styleSheet) {
              styleNode.styleSheet.cssText = styleText;
            } else {
              styleNode.innerText = '';
              styleNode.appendChild(document.createTextNode(styleText));
            }
            head.appendChild(styleNode);
        }
    },
    // 配置渲染
    // 参数 variationsList 表示：多个可视化实验的配置信息 ,格式见 this.getVariables 方法返回的值
    render: function(variationsList) {
        if (!variationsList) return;
        var self = this;
        // 定时检查未渲染的元素
        clearTimeout(self._settimeNum);
        var variationsArr = this._resetConfig(variationsList);
        var notRenderArr = [];
        var callback = function($element, config) {
            _.each(config.css, function(data, key) {
                $element.style[key] = data;
            });
            _.each(config.attributes, function(data, key) {
                $element.setAttribute(key, data);
            });
            _.each(config, function(data, key) {
                if ( !_.include(['css', 'attributes', 'nodeName', 'selector'], key) ) {
                    $element[key] = data;
                }
            });
        };
        try {
            for (var k = 0; k < variationsArr.length; k += 1) {
                if (variationsArr[k].selector) {
                    var $element = this._querySelector(variationsArr[k].selector);
                    var config = variationsArr[k]; 
                    if ($element) {
                        if (this._filtrateElementItem(config, $element)) {
                            callback($element, config);
                        }
                    } else {
                        notRenderArr.push(variationsArr[k]);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
        var tt = function() {
            var notRender = 0;
            var ttnotRenderArr = [];
            self._hidePathStyleSet(notRenderArr);
            for (var k = 0; k < notRenderArr.length; k += 1) {
                if (notRenderArr[k].selector) {
                    var $element = self._querySelector(notRenderArr[k].selector);
                    var config = notRenderArr[k];
                    if ($element) {
                        if (self._filtrateElementItem(config, $element)) {
                            callback($element, config);
                        }
                    } else {
                        ttnotRenderArr.push(notRenderArr[k]);
                    }
                }
                notRender ++;
            }
            notRenderArr = ttnotRenderArr;
            if (notRender > 0) {
                self._settimeNum = setTimeout(function() {
                   tt();
                }, 0);
            } else {
                clearTimeout(self._settimeNum); 
            }
            self._hidePathStyleSet(notRenderArr);
        };
        tt();
    },
    // 获取需要使用哪些可视化实验变量， 单页面可视化实验根据 url 精准判断，页面组根据 pattern 条件组合判断
    getVariables: function() {
        var that = this;
        var nowVisualizationVariableArr = [];
        // 检测该单页面实验是否参与, 跟当前url精准匹配  singPageTest : ['%xxx', {}, 1]
        var checkSingPagePartIn = function(singPageTest) {
            var bool = false;
            if (!singPageTest) return bool;
            var nowHref = that._getNowUrl();
            var jsMd5NowHref_ = get8To24Md5(jsMd5(nowHref+ '/'));
            var jsMd5NowHref = get8To24Md5(jsMd5(nowHref));
            // 去掉原key的 %符号：'%xxxxx' ==> 'xxxxx'
            var key = singPageTest[0].replace(new RegExp('^\\%', 'g'), '');
            if (key === jsMd5NowHref || key === jsMd5NowHref_) {
                bool = true;
            }
            return bool;
        };
        // 检测该页面组实验是否参与   notSingPageTest : ['%xxx', {pattern: {}}, 0]
        var checkNotSingPagePartIn = function(notSingPageTest) {
            var bool = false;
            if (!notSingPageTest) return bool;
            var pattern = notSingPageTest[1].pattern;
            if (pattern) {
                var conditions = pattern.conditions;
                if (pattern.relation === 'OR' || pattern.relation === '') {
                    for (var i = 0; i < conditions.length; i += 1) {
                        var condition = conditions[i] || {};
                        var field = condition.field;
                        var func = condition.func;
                        var params = condition.params;
                        var nowUrl = that._getNowUrl();
                        if (field === 'URL') {
                            // 等于
                            if (func === 'EQUAL') {
                               // 值精准匹配 
                               if (_.include(params, nowUrl) ||  _.include(params, nowUrl+'/')) {
                                 bool = true;
                                 break;
                               }
                            }
                            // 包含,params 长度只能等于1
                            if (func === 'CONTAIN') {
                                if ( nowUrl.indexOf(params[0]) > -1 || (nowUrl + '/').indexOf(params[0]) > -1) {
                                    bool = true;
                                    break;
                                }
                            }
                            // 正则，params长度只能等于1
                            if (func === 'REG_MATCH') {
                                try {
                                    // 字符串转成正则表达式
                                    var eval2 = eval;
                                    var reg = eval2(params[0]);
                                    if ( reg.test(nowUrl) || reg.test(nowUrl + '/') ) {
                                        bool = true;
                                        break;
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        }
                    }
                }
            }
            return bool;
        };
        for (var k = 0; k < that._visualizationArr.length; k += 1) {
            var type = that._visualizationArr[k][2];
            var bool = false;
            if (type === 1) {
                bool = checkSingPagePartIn(that._visualizationArr[k]);
            } else if (type === 0){
                bool = checkNotSingPagePartIn(that._visualizationArr[k]);
            }
            if (bool) {
                nowVisualizationVariableArr.push({
                    variations: that._visualizationArr[k][1].variations || [],
                    type: 2,
                    variable: that._visualizationArr[k][0]
                });
            }
        }
        return nowVisualizationVariableArr;
    }
};

// abtest模块,包含编程实验API，同时引入了 多链接实验模块和debug模块
var abtest = {
    data: {
        experiments: [],
        variables: {}
    },
    abtest_config: {
        // 从服务器上AB测试拉取配置
        // enable_abtest默认为false，默认不拉取
        // interval_mins_abtest 拉取实验配置频率，默认0分钟
        enable_abtest: false,
        interval_mins_abtest: 0,
        //编程模式：设置实验变量默认值（获取试验变量失败时使用）
        default_variables: {},
        url: '',
        // 多链接跳转超时时间设置，默认 300ms
        // 为了保证abtest事件顺利发送，延迟一段时间再执行重定向
        multilinkTimeOutMs: 300,
        // 异步拉取配置信息超时设置，默认 500ms
        timeoutMs: 500,
        // 当本地有abtest配置信息了，才触发渲染，默认不启动
        hasCacheRender: false
    },
    _default_variables: {},
    // 获取配置是否完成的标志
    _getVariableInfoComplete: false,
    _queue: [],
    // 显示页面
    _showPage: function() {
        if (typeof DATrackerABTestingLeadCode !== 'undefined') {
            if (DATrackerABTestingLeadCode && DATrackerABTestingLeadCode.showPage) {
                DATrackerABTestingLeadCode.showPage();
            }
        }
    },
    init: function(instance) {
        if(!instance) return null;
        this.DATracker = instance;
        debug.init(this.DATracker);
        visualizationAbest.init(this.DATracker, this);
        this.localStorageName = 'hb_' + this.DATracker.get_config('token') + '_abtest';
        var visualizationEditBool = visualizationAbest.isEditor();
        var self = this;
        var callback = function() {
            try {
                var abtest = self.DATracker.get_config('abtest') || {};
                // 保存用户在sdk中配置的变量
                self._default_variables = abtest.default_variables || {};
                self.abtest_config = _.deepMerge(self.abtest_config, abtest);
                //判断是否启动ab测试
                if(self.abtest_config.enable_abtest) {
                    // 从预配置中获取默认变量
                    self.data.variables = self.abtest_config.default_variables;
                    // 不在可视化编辑模式下，拉取配置
                    if (!visualizationEditBool) {
                        // 到期了重新拉取配置
                        if (self._checkUpdateTime()) {
                            self.async_get_variable();
                        } else {
                            var localObj = self._getLocalStorageData();
                            self.data = localObj.data;
                            // 此时数据使用本地缓存，数据加载完成标志设置为true
                            self._getVariableInfoComplete = true;
                            self._dataClass();
                        }
                    } else {
                        self._getVariableInfoComplete = true;
                    }
                }
            } catch (error) {
                if (!visualizationEditBool) {
                    self.async_get_variable();
                } else {
                    self._getVariableInfoComplete = true;
                    self._showPage();
                }
            }
        };
        callback();
        // 单页面：切换时触发
        _.innerEvent.on('singlePage:change', function() {
            callback();
        });
        // 调用 login 和 logout ,事件监听
        // 若变动，删除本地实验缓存，重新触发获取配置
        if(self.abtest_config.enable_abtest) {
            if (!self.isTestDebug()) {
                _.innerEvent.on('userId:change', function(eventName, param) {
                    if (param.type === 'login') {
                        var isSame = true;
                        if (param.userId !== self._getUserId()) {
                            self._clearLocalData();
                            self.data.variables = self.abtest_config.default_variables;
                            isSame = false;
                        }
                        self.async_get_variable(param.userId, isSame);
                    } else
                    if (param.type === 'logout') {
                        self._clearLocalData();
                        self.data.variables = self.abtest_config.default_variables;
                        self.async_get_variable(param.userId);
                    }
                });
            }
        }
    },
    // 调试模式下上报数据
    debugTrack: function(data) {
       debug.debugTrack(data);
    },
    // 变量分类：编程实验、可视化实验、多链接实验 type  1,2,3  ，此时必须保证已拉到配置
    // 分类规则查看有道云协作：abtest调试模式设计流程 
    // https://note.youdao.com/group/#/32411902/(folder/185474129//full:md/187837442)?gid=32411902
    // 实验执行顺序：多链接实验、可视化实验、编程实验，其中编程实验运行是用户方调用API
    _dataClass: function() {
        // 若正在获取本地数据，不能执行
       if (!this._getVariableInfoComplete) {
           return false;
       }
       var that = this; 
       var variables = that.data.variables;
       // 多链接实验列表
       var multilinkArr = [];
       // 可视化实验列表
       var visualizationArr = [];
       for(var key in variables) {
           if (variables.hasOwnProperty(key)) {
                if (that._getExperimentType(key) === 3) {
                    multilinkArr.push([key, variables[key]]);
                }
                if (that._getExperimentType(key) === 2) {
                    visualizationArr.push([key, variables[key]]);
                }
           }
       }
       multilinkAbest.setMultilinkArr(multilinkArr);
       visualizationAbest.setVisualizationArr(visualizationArr);
       // 参与多链接实验，nowMultilinkVariableObj 存在
       var nowMultilinkVariableObj = multilinkAbest.getVariable();
       // 参与可视化实验， nowVisualizationVariableArr 存在
       var nowVisualizationVariableArr = visualizationAbest.getVariables();
       if (nowMultilinkVariableObj) {
          var multilinkAbestExecute = function() {
            that.get_variation(function(abtest) {
                try {
                    var jump = function() {
                        multilinkAbest.jump(nowMultilinkVariableObj, that._showPage);
                    };
                    //如果没有回调成功，设置超时回调
                    setTimeout(jump, abtest.abtest_config.multilinkTimeOutMs);
                    // 使用该多链接实验变量，触发da_abtest事件
                    // 由于是跳转，为了保证事件顺利发送，延迟一段时间再执行重定向。 
                    abtest.get(nowMultilinkVariableObj.variable, window.location.href, jump, {variableObj: nowMultilinkVariableObj});
                } catch (error) {
                    that._showPage();
                    console.error(error);
                }
            });
          };
          // 内部调用 ：执行多链接实验
          multilinkAbestExecute();
       } else {
         if(nowVisualizationVariableArr.length) {
            var visualizationAbestExecute = function() {
             that.get_variation(function(abtest) {
                 try {
                     visualizationAbest.render(nowVisualizationVariableArr);
                     for (var j = 0; j < nowVisualizationVariableArr.length; j += 1) {
                         var item = nowVisualizationVariableArr[j];
                         abtest.get(item.variable, {}, function() {}, {variableObj: item});
                     }
                 } catch (error) {
                     console.error(error);
                 }
             });
            };
            // 内部调用 ：执行可视化实验
            visualizationAbestExecute();
         }
         that._showPage();
       }
    },
    // 检测是否处于abtest调试模式下，该方法不仅仅在内部引入，sdk初始化时也引用
    isTestDebug: function() {
        return debug._isTestDebug();
    },
    // 检测是否处于abtest可视化实验编辑模式下，不允许上报数据
    isEditor: function() {
        return visualizationAbest.isEditor();
    },
    getDebugKeyData: function() {
        return debug.getDebugKeyData();
    },
    // 保存实验配置数据
    _saveLocal: function() {
        var obj = {
            data: this.data
        };
        try {
            _.localStorage.set(this.localStorageName, JSON.stringify(obj));   
        } catch (error) {}
    },
    // 清除本地实验配置数据
    _clearLocalData: function() {
        this.data = {
            experiments: [],
            variables: {},
            updatedTime: 0
        };
        this._saveLocal();
    },
    // 获取本地缓存数据
    _getLocalStorageData: function() {
        var localObj;
        try {
            localObj = JSON.parse(_.localStorage.get(this.localStorageName));
        } catch (error) {
            localObj = null;
        }
        return localObj;
    },
    // 判断是否要去拉取配置,初始化时候调用
    // 返回 true 表示缓存结束，要重新拉取配置
    _checkUpdateTime: function()  {
        var bool = true;
        try {
            var interval_mins_abtest = this.abtest_config.interval_mins_abtest;
            var localObj = this._getLocalStorageData();
            var updatedTime = localObj.data.updatedTime / 1000;
            var nowDateTime = 1 * (new Date().getTime()) / 1000;
            if ( nowDateTime <= updatedTime + 60 * interval_mins_abtest ) {
                bool = false;
            }
        } catch (error) {
            bool = true;
        }
        return bool;
    },
    // 获取使用的实验变量所属的实验类型，编程实验、可视化实验、多链接实验 type  1,2,3
    _getExperimentType: function(variable) {
        var type = 1;
        try {
            if(variable.indexOf('$') === 0) {
                type = 3;
            }
            if(variable.indexOf('%') === 0) {
                type = 2;
            }
        } catch (error) {
           console.error(error); 
        }
        return type;
    },
    //interval_abtest
    // 指定变量，所属实验，返回所属实验信息
    _variableToFindExperiment: function(variable) {
        var dataObj = {
            $experimentId: [],
            $versionId: [],
            $experimentType: this._getExperimentType(variable)
        };
        var multilinkAbestObj;
        for(var i=0; i< this.data.experiments.length; i++) {
            var experimentId = this.data.experiments[i]['experimentId'];
            var versionId = this.data.experiments[i]['versionId'];
            var variables = this.data.experiments[i]['variables'];
            if(_.include(variables, variable)) {
               if(!_.include(dataObj.$experimentId, experimentId)) {
                   dataObj.$experimentId.push(experimentId);
               }
               if(!_.include(dataObj.$versionId, versionId)) {
                   dataObj.$versionId.push(versionId);
               }
            }
        }
        dataObj.$experimentId = dataObj.$experimentId.join(',');
        dataObj.$versionId = dataObj.$versionId.join(',');
        // 是多链接实验
        if (dataObj.$experimentType === 3) {
            multilinkAbestObj = multilinkAbest.getVariable();
            if (multilinkAbestObj) {
                dataObj.$source = multilinkAbestObj.key;
                dataObj.$target = multilinkAbestObj.url;
            }
        } else
        // 可视化实验，不传变量以及变量值
        if (dataObj.$experimentType === 2){
        } else {
            dataObj[variable] = this.data.variables[variable];
        }
        return dataObj;
    },
    //发送da_abtest事件数据
    //规则，用户调用 get方法时，当一个实验中，使用的变量使用一次，触发一次；
    //当前平台不支持多变量
    _track_abtest: function(attributes, callback) {
        if(!attributes) return;
        this.DATracker.track('da_abtest', attributes, callback || function() {});
    },
    // 获取 userId
    _getUserId: function() {
        var userId = this.DATracker.get_user_id() || this.DATracker.get_distinct_id();
        // 如果在调试模式下，userId 替换为 hubble_abtest_debug_key
        if (this.isTestDebug()) {
            userId = this.getDebugKeyData();
        }
        return userId;
    },
    // 外部回调函数中调用：编程实验
    // typeObj   {type: 3, variableObj: nowVariableObj}
    // type  1,2,3 --编程实验、可视化实验、多链接实验
    get: function(variable, defalut, _callback, _typeObj) {
        try {
            if(typeof this.data.variables[variable] !== 'undefined') {
                //TODO: 多变量如何处理，对应的实验问题
                var attributes = this._variableToFindExperiment(variable) || {};
                // 如果该变量有 $experimentId 和 $versionId，执行上报 abtest 事件数据
                if (attributes.$experimentId && attributes.$versionId && attributes.$experimentType) {
                    this._track_abtest(attributes, _callback);
                } else {
                    if (typeof _callback === 'function') {
                        _callback();
                    }
                }
                return this.data.variables[variable];
            } else {
                return defalut;
            }
        } catch (error) {
            return defalut;
        }
    },
    // 外部写编程实验业务代码：编程实验
    get_variation: function(callback) {
        if(!this._getVariableInfoComplete) {
            return (this._queue.push(arguments), !1);
        }
        if(typeof callback === 'function') {
            callback(this);
        }
    },
    // 重新从服务器拉取最新实验数据
    // userId 非必填，拉取实验配置参数  isSame 非必填，拉取配置的userid跟上次是否一样，若不一样的话，失败后清除本地缓存
    async_get_variable: function(userId, isSame) {
        // 可视化实验编辑阶段，不再从服务器拉取配置
        if (this.isEditor()) {
            this._getVariableInfoComplete = true;
            return;
        }
        try {
            var abtest_config = this.abtest_config;
            var enable_abtest = abtest_config.enable_abtest;
            //判断是否启动ab测试
            if(enable_abtest) {
                var that = this;
                var nowUserId = userId || that._getUserId();
                var appKey = that.DATracker.get_config('token');

                var callback = function(params) {
                    this._getVariableInfoComplete = true;
                    if( !params.error ) {
                        if(params.code === 200) {
                            var _default_variables = _.JSONDecode(_.JSONEncode( this._default_variables ));
                            this.data.experiments = params.data.experiments;
                            this.data.variables = _.deepMerge(_default_variables, params.data.variables);
                            this.data.updatedTime = new Date().getTime();
                            this._saveLocal();
                            this._dataClass();
                            // 调试下：若拉取配置为空，执行debug的方法(页面上提示信息)
                            if (this.isTestDebug()) {
                                if (!params.data.experiments.length) {
                                    debug.debugNoData();
                                }
                            }
                        } else {
                            if (!isSame) {
                                // 拉取实验配置失败，清除本地缓存, 使用默认缓存
                                this._clearLocalData();
                                this.data.variables = this.abtest_config.default_variables;
                            }
                            this._dataClass();
                        }
                    } else {
                        // 调试下：若拉取配置失败，执行debug的方法(页面上提示信息)
                        if (this.isTestDebug()) {
                            debug.debugNoData();
                        } else {
                            if (!isSame) {
                                // 拉取实验配置失败，清除本地缓存, 使用默认缓存
                                this._clearLocalData();
                                this.data.variables = this.abtest_config.default_variables;
                            }
                            this._dataClass();
                        }
                    }
                    // 这里无论获取配置成功或失败，都要执行下队列里的方法
                    if(this._queue.length) {
                        _.each(that._queue, function(t) {
                            that.get_variation.apply(that, Array.prototype.slice.call(t));
                        });
                        that._queue = [];
                    }
                };
                that._getVariableInfoComplete = false;
                var url = that.DATracker.get_config('api_host') + '/cc/a_exp';
                var timeout = 500;
                try {
                    timeout = that.abtest_config.timeoutMs;
                } catch (error) {
                    timeout = 500;
                }
                if(abtest_config.url) {
                    url = abtest_config.url;
                }
                var properties = _.extend(
                    {},
                    _.info.properties(),
                    that.DATracker['persistence'].properties()
                );
                _.ajax.post( 
                    url,
                    {
                        userId: nowUserId,
                        appKey: appKey,
                        property: {
                            deviceOs: properties.deviceOs,
                            deviceOsVersion: properties.deviceOsVersion,
                            screenWidth: properties.screen_width,
                            screenHeight: properties.screen_height,
                            devicePlatform: properties.hb_lib,
                            pageOpenScene: that.DATracker['pageOpenScene']
                        }
                    },
                    _.bind(callback, that),
                    timeout
                );
            }
        } catch (error) {
            
        }
    },
    //编码模式下，外部调用，是否在abtest调试模式下
    is_abtest_debug: debug._isTestDebug,
    //编码模式下，外部调用，获取调试模式的标记str 
    get_hubble_abtest_debug_key_str: function() {
        var str = '';
        if (debug._isTestDebug()) {
            str = 'hubble_abtest_debug_key=' + debug.getDebugKeyData();
        }
        return str;
    },
    // 返回本地是否有缓存
    // 通过判断本地缓存是否到期判断，若到期（_checkUpdateTime 此时返回true），说明本地无可用缓存，此时返回false
    // 该方法本地必须启用缓存机制，即 interval_mins_abtest 值不能为0
    hasLocalCache: function() {
        return !this._checkUpdateTime();
    }
};

export default abtest;