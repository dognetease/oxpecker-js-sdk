    (function(document, datracker, root){
        //帮助类
        var help = {};
        help.cookie = {
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
                    secure = '; secure';
                }

                var new_cookie_val = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
                document.cookie = new_cookie_val;
                return new_cookie_val;
            },

            remove: function(name, cross_subdomain) {
                _.cookie.set(name, '', -1, cross_subdomain);
            }
        };

        //JSONP回调
        root.getHubbleJSSDKVersions = function(version) {
            //临时cookie方式 -- 版本管理
            help.cookie.set('mp_versions_hubble_jsSDK', version, false, true);
            //加载jsSdk
            loadJsSDK();
        };
        
        function removeElement(_element){
            var _parentElement = _element.parentNode;
            if(_parentElement){
                _parentElement.removeChild(_element);  
            }
        }

        function addScriptTag(src) {
            var loaded;
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement("script");
            var localVersion = help.cookie.get('mp_versions_hubble_jsSDK');
            script.setAttribute("type", "text/javascript");
            script.src = src;
            script.onload = script.onreadystatechange = function(){
                if(!loaded && (!script.readyState || /loaded|complete/.test(script.readyState))){
                    script.onload = script.onreadystatechange = null;
                    loaded = true;
                    removeElement(script);
                }
            };
            head.appendChild(script);
        }

        function addScriptTagTwo(url, fn) {
            var isFirst = true;  
            var iframe;
            try{
                iframe = document.createElement('iframe');  
                iframe.style.display = 'none';  
            }catch(e) {
                iframe = document.createElement('iframe');
                iframe.setAttribute('src',url); 
            }

            var loadfn = function(){  
                if(isFirst){  
                    iframe.contentWindow.location = 'about:blank';  
                    isFirst = false;  
                } else {  
                    fn(iframe.contentWindow.name);  
                    iframe.contentWindow.document.write('');  
                    iframe.contentWindow.close();  
                    document.body.removeChild(iframe);  
                    iframe.src = '';  
                    iframe = null;  
                }  
            };  
            iframe.src = url;  
            if(iframe.attachEvent){  
                iframe.attachEvent('onload', loadfn);  
            } else {  
                iframe.onload = loadfn;  
            }
            if(iframe) {
                document.body.appendChild(iframe);
            }  
        }

        function loadJsSDK() {
            var localVersion = help.cookie.get('mp_versions_hubble_jsSDK');
            var HUBBLE_LIB_URL = 'https://hubble.netease.com/track/w/DATracker.globals.js';
            var script, first_script;
            script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            if(localVersion) {
                HUBBLE_LIB_URL = 'https://hubble-js-bucket.nosdn.127.net/' + localVersion + '.js';
            }
            script.src = HUBBLE_LIB_URL;

            first_script = document.getElementsByTagName("script")[0];
            first_script.parentNode.insertBefore(script, first_script);
        };
        
        
        if (!datracker['__SV']) {
            var win = window;

            try {
                var getHashParam, matches, state, loc = win.location, hash = loc.hash;
                getHashParam = function(hash, param) {
                    matches = hash.match(new RegExp(param + '=([^&]*)'));
                    return matches ? matches[1] : null;
                };
                if (hash && getHashParam(hash, 'state')) {
                    state = JSON.parse(decodeURIComponent(getHashParam(hash, 'state')));
                    if (state['action'] === 'mpeditor') {
                        win.sessionStorage.setItem('_mpcehash', hash);
                        history.replaceState(state['desiredHash'] || '', document.title, loc.pathname + loc.search); 
                    }
                }
            } catch (e) {}

            var gen_fn, functions, i, lib_name = "DATracker";
            window[lib_name] = datracker;

            datracker['_i'] = [];

            datracker['init'] = function (token, config, name) {
                var target = datracker;
                if (typeof(name) !== 'undefined') {
                    target = datracker[name] = [];
                } else {
                    name = lib_name;
                }

                target['people'] = target['people'] || [];
                target['abtest'] = target['abtest'] || [];
                target['toString'] = function(no_stub) {
                    var str = lib_name;
                    if (name !== lib_name) {
                        str += "." + name;
                    }
                    if (!no_stub) {
                        str += " (stub)";
                    }
                    return str;
                };
                target['people']['toString'] = function() {
                    return target.toString(1) + ".people (stub)";
                };

                function _set_and_defer(target, fn) {
                    var split = fn.split(".");
                    if (split.length == 2) {
                        target = target[split[0]];
                        fn = split[1];
                    }
                    target[fn] = function(){
                        target.push([fn].concat(Array.prototype.slice.call(arguments, 0)));
                    };
                }
                //每次新增对外API，在这边添加下
                functions = "track_heatmap register_attributes register_attributes_once clear_attributes unregister_attributes current_attributes single_pageview disable time_event get_appStatus track set_userId track_pageview track_links track_forms register register_once alias unregister identify login logout signup name_tag set_config reset people.set people.set_once people.set_realname people.set_country people.set_province people.set_city people.set_age people.set_gender people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.set_populationWithAccount  people.set_location people.set_birthday people.set_region people.set_account abtest.get_variation abtest.async_get_variable".split(' ');
                for (i = 0; i < functions.length; i++) {
                    _set_and_defer(target, functions[i]);
                }

                datracker['_i'].push([token, config, name]);
            };

            datracker['__SV'] = 1.6;
        }
        if(!help.cookie.get('mp_versions_hubble_jsSDK')) {
           addScriptTag('https://hubble.netease.com/track/w/version.js?random'+ Math.random());
        } else {
            loadJsSDK();
        }
        
    })(document, window['DATracker'] || [], window);