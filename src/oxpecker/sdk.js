/* global window */
import { Request } from './fetch';
import {
    setSessionToken,
    getSessionToken,
    filterNullKey,
    getLocalStorage,
    setLocalStorage,
    sendRuntimeError,
    getRunTimeErrorParam,
    retry,
    removeLocalStorage,
    countKey,
    detectSendBeacon
} from './utils';

export class OxpeckerSDK {
    constructor() {
        this._missSendBeacon = !detectSendBeacon();

        this._bufferSizeThreshold = 40 * 1024; // 40KB

        this._url = 'https://oxpecker.lx.netease.com/api/pub/event/tracking';
        this._beaconUrl =
            'https://oxpecker.lx.netease.com/api/pub/event/send-beacon/tracking';
        this._isNewUrl = 'https://oxpecker.lx.netease.com/api/pub/user-active';
        this._logUrl =
            'https://oxpecker.lx.netease.com/api/pub/event/client-error/tracking';

        this._commonConfig = {};

        this._token = '';
        this._appKey = '';
        this._send2Hubble = true;

        this._version = '1.0.10';

        this._isNewUserMapKey = 'new_user_map_v1';
        this._isNewUserMap = {};

        this._failSendDataKey = 'fail_send_data_v2';
        this._failSendData = [];

        this._baseAttributes = {};
        this._productProfile = {};
        this._userId = '';

        // qps相关
        this._qpsMap = {};
        this._qpsHighMap = {};

        // 可能和ie兼容性有关的
        this._request = null;
        this._textEncode = null;

        // ie专用的
        this._isNewUser = undefined;
        this._timestamp = undefined;
        this._init();
    }

    setProductProfile(profile = {}) {
        this._productProfile = profile;
    }

    setUrl(urls = {}) {
        const { baseUrl = '', beaconUrl = '', isNewUrl = '', logUrl = '' } = urls;
        if (baseUrl.length > 0) {
            this._url = baseUrl;
        }
        if (beaconUrl.length > 0) {
            this._beaconUrl = beaconUrl;
        }
        if (isNewUrl.length > 0) {
            this._isNewUrl = isNewUrl;
        }
        if (logUrl.length > 0) {
            this._logUrl = logUrl;
        }
    }

    setHost(host = '') {
        if (host && host.length > 0) {
            this._url = host + '/api/pub/event/tracking';
            this._beaconUrl = host + '/api/pub/event/send-beacon/tracking';
            this._isNewUrl = host + '/api/pub/user-active';
            this._logUrl = host + '/api/pub/event/client-error/tracking';
        }
    }

    flush() {}

    _getFormData(data) {
        const param = this._assembleData(data);
        const form = new FormData();
        form.append('data', JSON.stringify(param));
        return form;
    }

    _assembleData(data = []) {
        const zipData = {
            data: [],
            appKey: this._appKey || 'unknown',
            baseAttributes: this._baseAttributes,
            sdkVersion: this._version,
        };

        // 调试用token
        if (this._token) {
            zipData.token = this._token;
        }
        // 公共参数productProfile
        if (Object.keys(this._productProfile).length > 0) {
            zipData.productProfile = this._productProfile;
        }

        const last = data[data.length - 1];
        if (last.eventType) {
            zipData.eventType = last.eventType;
        }

        for (const each of data) {
            each.attributes = each.attributes || {};
            each.attributes = {
                ...this._commonConfig,
                ...each.attributes,
            };
            zipData.data.push(each);
        }

        return zipData;
    }

    disableHubbleSend() {
        return this._send2Hubble === false;
    }

    updateConfig(config) {
        this._commonConfig = {
            ...this._commonConfig,
            ...config,
        };
    }

    removeConfigByKey(key) {
        const isDelete = Reflect.deleteProperty(this._commonConfig, key);
        return isDelete;
    }

    setToken(token) {
        this._token = token;
        setSessionToken(this._token);
    }

    // 正常发送
    _sendLog(query) {
        // qps过高了，直接返回
        if (this._isQPSHighLog(query)) {
            return;
        }

        const jsonObj = JSON.stringify(query);
        const size8KB = 8 * 1024;
        const logSize = this._textEncode.encode(jsonObj).length;
        if (logSize >= size8KB) {
            sendRuntimeError(
                this._logUrl,
                getRunTimeErrorParam(
                    {
                        userId: query.userId,
                        appKey: this._appKey,
                        appVersion: this._baseAttributes._version,
                        event: query.eventId,
                    },
                    'data-too-large-v4'
                )
            );
            return;
        }

        const param = JSON.parse(jsonObj);
        this._setIsNewUser(param.userId, param.deviceUdid);
        if (param.userId) {
            this._userId = param.userId;
        }
        this._updateBaseAttribute(param);
        const data = this._mapData(param);
        if (!this._requestByBeacon([data])) {
            data._querySize = logSize;
            this._failSendData.push(data);
        }
    }

    _sendXhrLog(query) {
        const jsonObj = JSON.stringify(query);
        const param = JSON.parse(jsonObj);
        if (param.userId) {
            this._userId = param.userId;
        }
        const id = param.userId || param.deviceUdid;
        if (id && this._isNewUser === undefined) {
            let successCb = function (resp) {
                const data = resp.data;
                const code = resp.code;
                if (code === 0) {
                    this._isNewUser = data.newUser;
                    this._timestamp = data.timestamp;
                }
            };
            successCb = successCb.bind(this);
            let errorCb = function () {
                this._isNewUser = false;
                this._timestamp = Date.now();
            };
            errorCb = errorCb.bind(this);
            const query = {
                appKey: this._appKey,
            }
            if (param.userId) {
                query.userId = param.userId
            } else {
                query.deviceId = param.deviceUdid
            }
            this._sendInXhr({
                url: this._isNewUrl,
                query,
                method: 'get',
                successCb,
                errorCb,
            });
        }
        this._updateBaseAttribute(param);
        const data = this._mapData(param);
        if (this._isNewUser === undefined) {
            data.isNewUser = false;
        } else {
            const now = Date.now();
            if (now >= this._timestamp) {
                data.isNewUser = false;
            } else {
                data.isNewUser = this._isNewUser;
            }
        }
        this._sendInXhr({
            url: this._url,
            query: {
                v: this._version,
                t: Date.now(),
            },
            body: this._assembleData([data]),
            method: 'post',
        });
    }

    addBuffer(query) {
        if (this._missSendBeacon) {
            this._sendXhrLog(query);
        } else {
            this._sendLog(query);
        }
    }

    setAppKey(appKey = '') {
        this._appKey = appKey;
    }

    isDebugMode() {
        return typeof this._token === 'string' && this._token.length > 0;
    }

    getIsNewInfo(key) {
        return this._getIsNew(key);
    }

    getProductProfile() {
        return {
            ...this._productProfile,
        };
    }

    _getIsNew(key) {
        if (!key) {
            return false;
        }
        const item = this._isNewUserMap[key];
        if (item) {
            const { isNew, timestamp } = item;
            if (isNew) {
                return Date.now() < timestamp;
            } else {
                return false;
            }
        }

        return false;
    }

    configSDK(option = {}) {
        if (option.send2Hubble === false) {
            this._send2Hubble = false;
        }
    }

    configBaseAttributes(config = {}) {
        this._baseAttributes = {
            ...this._baseAttributes,
            ...config,
        };
    }

    _init() {
        if (!this._missSendBeacon) {
            this._request = new Request();
            this._textEncode = new TextEncoder();

            this._registerUnload();
            this._getToken();
            this._initIsNewUserMap();
            this._initFailDataList();
            this._sendFailData();
            this._clearQPSMap();
            this._loopSendQPSHighData();
        }
    }

    _clearQPSMap() {
        const oneDay = 24 * 60 * 60 * 1000; // 24h
        setTimeout(() => {
            this._qpsMap = {};
        }, oneDay);
    }

    _sendQPSHighData() {
        if (Object.keys(this._qpsHighMap).length > 0) {
            const data = this._qpsHighMap;
            this._qpsHighMap = {};
            sendRuntimeError(
                this._logUrl,
                getRunTimeErrorParam(
                    {
                        userId: this._userId,
                        events: data,
                        appKey: this._appKey,
                    },
                    'qps-high-v4'
                )
            );
        }
    }

    _isQPSHighLog(data) {
        const { eventId } = data;
        if (!eventId) {
            return true;
        }
        const time = Math.floor(Date.now() / 1000); // to seconds
        const bucketSize = 5;
        const lastSend = this._qpsMap[eventId];

        // 无缓存、超过1s的时间、时间戳变小的情况
        if (
            lastSend === undefined ||
            time - lastSend[0] > 0 ||
            time - lastSend[0] < 0
        ) {
            this._qpsMap[eventId] = [time, bucketSize - 1];
            return false;
        } else {
            // 1s内的情况
            const remainSize = lastSend[1];
            if (remainSize > 0) {
                lastSend[1] = lastSend[1] - 1;
                return false;
            }
            this._appendQPSHighQueue(eventId);
            return true;
        }
    }

    _appendQPSHighQueue(eventId) {
        this._qpsHighMap[eventId] = (this._qpsHighMap[eventId] || 0) + 1;
    }

    _loopSendQPSHighData() {
        const qpsHighInterval = 10 * 1000; // 10s
        setTimeout(() => {
            this._sendQPSHighData();
        }, qpsHighInterval);
    }

    _initIsNewUserMap() {
        const map = getLocalStorage(this._isNewUserMapKey);
        if (map) {
            this._isNewUserMap = map;
        }
    }

    _getToken() {
        const searchObj = new URLSearchParams(window.location.search);
        const key = 'oxpecker_js_token';
        const token = searchObj.get(key);
        if (token !== null) {
            this._token = token;
            setSessionToken(this._token);
        } else {
            const token = getSessionToken();
            if (token) {
                this._token = token;
            }
        }
    }

    _registerUnload() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this._sendQPSHighData();
                this._saveUnSendData();
                this._failSendData = [];
            } else {
                this._initFailDataList();
            }
        });
    }

    _initFailDataList() {
        const local = getLocalStorage(this._failSendDataKey);
        if (Array.isArray(local)) {
            this._failSendData.push(...local);
        }
        removeLocalStorage(this._failSendDataKey);
    }

    _saveUnSendData() {
        const list = this._failSendData;
        if (list.length === 0) {
            return;
        }
        const cache = [];
        let cacheSize = 0;
        let index = 0;
        const size5MB = 5 * 1024 * 1024;
        while (index < list.length) {
            const item = list[index];
            cacheSize += item._querySize;
            cache.push(item);
            if (cacheSize >= size5MB) {
                cache.pop();
                break;
            }
            index++;
        }
        setLocalStorage(this._failSendDataKey, cache);
        const drop = list.slice(index);

        const info = {
            version: this._version,
            appVersion: this._baseAttributes._version,
            appKey: this._appKey,
            userId: this._userId,
        };
        // 发送本地缓存数据的
        if (cache.length > 0) {
            const cacheEvents = countKey(cache.map(each => each.eventId));
            sendRuntimeError(
                this._logUrl,
                getRunTimeErrorParam(
                    {
                        ...info,
                        total: cache.length,
                        events: cacheEvents,
                    },
                    'cache-data-v4'
                )
            );
        }
        // 发送丢弃的数据
        if (drop.length > 0) {
            const dropEvents = countKey(drop.map(each => each.eventId));
            sendRuntimeError(
                this._logUrl,
                getRunTimeErrorParam(
                    {
                        ...info,
                        total: drop.length,
                        events: dropEvents,
                    },
                    'drop-data-v4'
                )
            );
        }
    }

    _requestByBeacon(bodyList) {
        const url =
            this._beaconUrl + `?v=${this._version}` + '&' + `t=${Date.now()}`;
        const body = this._getFormData(bodyList);
        return navigator.sendBeacon(url, body);
    }

    _sendInXhr(option) {
        let url = option.url;
        const query = option.query;
        const body = option.body;
        const method = option.method;
        const successCb = option.successCb;
        const errorCb = option.errorCb;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    successCb && successCb(JSON.parse(xhr.responseText));
                } else {
                    errorCb && errorCb(xhr.status, xhr.responseText);
                }
            }
        };
        // xhr.timeout = 60 * 1000;
        if (query && Object.keys(query).length > 0) {
            const keys = Object.keys(query);
            const params = [];
            for (const key of keys) {
                params.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        query[key]
                    )}`
                );
            }
            if (params.length > 0) {
                url = url + '?';
                url = url + params.join('&');
            }
        }
        xhr.open(method, url, true);
        if (method === 'get') {
            xhr.send();
        } else if (method === 'post') {
            xhr.send(JSON.stringify(body));
        }
    }

    _sendFailData() {
        const taskDelay = 3 * 1000; // 3s
        setTimeout(() => {
            this._sendFailData();
        }, taskDelay);
        if (this._failSendData.length === 0) {
            return;
        }

        let index = 0;
        let countSize = 0;
        const list = this._failSendData;
        const waiting = [];
        while (index < list.length) {
            const item = list[index];
            const itemSize = item._querySize;
            countSize += itemSize;
            index++;
            waiting.push(item);
            if (countSize >= this._bufferSizeThreshold) {
                break;
            }
        }
        this._failSendData = this._failSendData.slice(index);

        if (
            !this._requestByBeacon(
                waiting.map(each => {
                    const item = {
                        ...each,
                    };
                    Reflect.deleteProperty(item, '_querySize');
                    return item;
                })
            )
        ) {
            this._failSendData.push(...waiting);
        }
    }

    _mapData(data = {}) {
        const mapped = {
            eventId: data.eventId,
            eventType: data.attributes
                ? data.attributes.eventType ?? 'biz'
                : 'biz',
            occurTime: data.time,
            attributes: data.attributes,
            isNewUser: false,
            domain: data.currentDomain ?? '',
            currentUrl: data.currentUrl ?? '',
            urlPath: data.urlPath ?? '',
        };

        if (data.userId) {
            mapped.userId = data.userId;
        }
        let id = data.userId || data.deviceUdid;
        if (id && !this._missSendBeacon) {
            mapped.isNewUser = this._getIsNew(id);
        }
        return mapped;
    }

    _updateBaseAttribute(data = {}) {
        const config = {
            _system: data.deviceOs,
            _deviceId: data.deviceUdid,
            _screenWidth: data.screenWidth,
            _screenHeight: data.screenHeight,
            _cityName: data.city,
            _systemVersion: data.deviceOsVersion,
            _version: '',
            browser: data.browser,
            browserVersion: data.browserVersion,
        };

        this._baseAttributes = {
            ...filterNullKey(config),
            ...this._baseAttributes,
        };
    }

    _isInitCorrectly() {
        return this._appKey;
    }

    _storeIsNewUserMap() {
        if (Object.keys(this._isNewUserMap).length > 0) {
            setLocalStorage(this._isNewUserMapKey, this._isNewUserMap);
        }
    }

    // isNewUser字段的缓存策略
    _setIsNewUser(userId, deviceId) {
        const id = userId ?? deviceId;
        if (!id) {
            return;
        }
        const value = this._isNewUserMap[id];
        if (value === undefined) {
            this._isNewUserMap[id] = false;
            const retryAjax = retry(() => {
                const data = {
                    appKey: this._appKey,
                };
                if (userId) {
                    data.userId = userId;
                } else if (deviceId) {
                    data.deviceId = deviceId;
                }

                return this._request.get(this._isNewUrl, data).then(resp => {
                    const { code, data = {} } = resp;
                    if (code === 0) {
                        return data;
                    } else {
                        throw new Error('backend error, code is ' + code);
                    }
                });
            });

            retryAjax().then(data => {
                const { newUser, timestamp, id: idTag } = data;
                this._isNewUserMap[idTag] = {
                    isNew: newUser,
                    timestamp,
                };
                this._storeIsNewUserMap();
            });
        }
    }

    _sendErrorInfo(err) {
        const param = getRunTimeErrorParam(
            {
                userId: this._userId,
                appKey: this._appKey,
                appVersion: this._baseAttributes._version,
            },
            'oxpecker-runtime-error',
            err
        );
        if (this._missSendBeacon) {
            this._sendInXhr({
                url: this._logUrl,
                body: param,
                method: 'post',
            });
            return;
        }
        sendRuntimeError(this._logUrl, param);
    }
}
