function filterNullKey(data = {}) {
    let newData = {};
    for (const key of Object.keys(data)) {
        if (data[key] !== null || data[key] !== undefined) {
            newData[key] = data[key];
        }
    }
    return newData;
}

function gatherMessageFromXhr(xhr) {
    const {
        status,
        statusText,
        responseText,
        responseType,
        responseURL,
        readyState,
    } = xhr;
    const message = {
        status,
        statusText,
        responseText,
        responseType,
        responseURL,
        readyState,
    };
    return JSON.stringify(message);
}

/* global fetch */
export class Request {
    constructor() {
        // this._fetchRef = window.fetch.bind(window);
    }

    post(url, data) {
        const config = this._getReqConfig('POST');
        data = filterNullKey(data);
        const param = {
            ...config,
            body: JSON.stringify(data)
        }
        return this._request(url, param);
    }

    get(url, data) {
        const config = this._getReqConfig('GET');
        data = filterNullKey(data);
        const keys = Object.keys(data);
        const queryList = [];
        if (keys.length > 0) {
            for (const key of keys) {
                queryList.push(
                    encodeURIComponent(key) +
                        '=' +
                        encodeURIComponent(data[key])
                );
            }
            url += '?';
            url += queryList.join('&');
        }
        return this._request(url, config);
    }


    _getReqConfig(method = 'GET') {
        return {
            method,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }


    _request(url, params) {
        url = url.trim();
        const { method, headers, body = '' } = params;
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open(method, url, true);
        for (const headerKey of Object.keys(headers)) {
            const headerVal = headers[headerKey];
            xhr.setRequestHeader(headerKey, headerVal);
        }

        xhr.send(body);
        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        const message = gatherMessageFromXhr(xhr);
                        reject(message);
                    }
                }
            };

            xhr.onerror = error => {
                const { currentTarget } = error;
                const message = gatherMessageFromXhr(currentTarget);
                reject(message);
            };

            xhr.ontimeout = () => {
                reject('timeout error!');
            };
        });
    }
}
