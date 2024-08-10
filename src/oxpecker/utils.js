/* global window */
const STORAGE_PREFIX = '__OXPECKER';

import { Request } from './fetch';
const HttpClient = new Request();

function getKey(key) {
    return STORAGE_PREFIX + '_' + key;
}
const tokenKey = getKey('token');
export function setSessionToken(token) {
    window.sessionStorage.setItem(tokenKey, token);
}

export function getSessionToken() {
    return window.sessionStorage.getItem(tokenKey);
}

export function filterNullKey(data = {}) {
    let newData = {};
    for (const key of Object.keys(data)) {
        if (data[key] !== null || data[key] !== undefined) {
            newData[key] = data[key];
        }
    }
    return newData;
}

export function sendRuntimeError(url = '', data = {}) {
    HttpClient.post(url, data);
}

export function getRunTimeErrorParam(hubble, type, error) {
    let data = {};
    if (hubble && Object.keys(hubble).length > 0) {
        data.hubbleParam = hubble;
    }
    if (type) {
        data.customType = type;
    }
    if (error && error instanceof Error) {
        data.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    } else if (typeof error === 'string') {
        data.error = {
            message: error,
        };
    }
    return data;
}

export const retry = (fn, times = 3, delay = 20) => {
    let retryTimes = 0;
    const call = (...args) => {
        return new Promise((resolve, reject) => {
            fn(...args)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    if (retryTimes < times) {
                        retryTimes++;
                        return new Promise(r => {
                            setTimeout(r, retryTimes * delay * 1000);
                        }).then(call);
                    } else {
                        reject(err);
                    }
                });
        });
    };

    return call;
};

export const getLocalStorage = key => {
    key = getKey(key);
    const item = window.localStorage.getItem(key);
    return JSON.parse(item);
};

export const setLocalStorage = (key, item) => {
    if (item === undefined) {
        return;
    }
    return window.localStorage.setItem(getKey(key), JSON.stringify(item));
};

export const removeLocalStorage = key => {
    if (!key) {
        return;
    }
    key = getKey(key);
    window.localStorage.removeItem(key);
};

export const countKey = (list = []) => {
    if (Array.isArray(list)) {
        const mp = {};
        for (const each of list) {
            if (mp[each]) {
                mp[each] = mp[each] + 1;
            } else {
                mp[each] = 1;
            }
        }
        return mp;
    }
};

// 是ie或者在没有sendBeacon方法
export function isIE() {
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        return true;
    }
    return false;
}

export function detectSendBeacon() {
    return (
        navigator &&
        navigator.sendBeacon &&
        typeof navigator.sendBeacon === 'function'
    );
}
