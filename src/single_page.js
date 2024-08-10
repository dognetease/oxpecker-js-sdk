/**
 * 单页面模块
 */
import {_} from './utils';

function on(obj, event, callFn) {
    if(obj[event]) {
        var fn = obj[event];
        obj[event] = function() {
            var args = Array.prototype.slice.call(arguments);
            callFn.apply(this, args);
            fn.apply(this, args);
        };
    } else {
        obj[event] = function() {
            var args = Array.prototype.slice.call(arguments);
            callFn.apply(this, args);
        };
    }
}

function getPath() {
    return location.pathname + location.search;
}

var single_page = {
    config: {
        mode: 'hash',
        track_replace_state: false,
        callback_fn: function() {}
    },
    init: function(config) {
        this.config = _.extend(this.config, config || {});
        this.path = getPath();
        this.event();
    },
    event: function() {
        var self = this;
        if(this.config.mode === 'history') {
            if(!history.pushState || !window.addEventListener) return;
            on(history, 'pushState', _.bind(this.pushStateOverride, this) );
            on(history, 'replaceState', _.bind(this.replaceStateOverride, this) );
            window.addEventListener('popstate', _.bind(this.handlePopState, this));
        } else if(this.config.mode === 'hash') {
            _.register_hash_event( _.bind(this.handleHashState, this) );
        }
    },
    pushStateOverride: function() {
        this.handleUrlChange(true);
    },
    replaceStateOverride: function() {
        this.handleUrlChange(false);
    },
    handlePopState: function() {
        this.handleUrlChange(true);
    },
    handleHashState: function() {
        this.handleUrlChange(true);
    },
    handleUrlChange: function(historyDidUpdate) {
        var self = this;
        setTimeout(function() {
            if(self.config.mode === 'hash') {
                if(typeof self.config.callback_fn === 'function') {
                    self.config.callback_fn.call();
                }
            } else if( self.config.mode === 'history' ) {
                var oldPath = self.path;
                var newPath = getPath();
                if(oldPath != newPath && self.shouldTrackUrlChange(newPath, oldPath)) {
                    self.path = newPath;
                    if(historyDidUpdate || self.config.track_replace_state) {
                        if(typeof self.config.callback_fn === 'function') {
                            self.config.callback_fn.call();
                        }
                    }
                }
            }
        }, 0);
    },
    shouldTrackUrlChange: function(newPath, oldPath) {
        return !!(newPath && oldPath);
    }
};

export default single_page;
