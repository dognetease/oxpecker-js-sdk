/**
 * 共同cookie值，取出的值用来做打通关联。
 * 比如：用户访问了 https://www.163.com/ 后，会在163.com域下存放_ntes_nnid字段，值为随机码和首次访问时间戳；另一个 _ntes_nuid字段值为随机码，随机码跟_ntes_nnid随机码一致（区分但到期时间不一致）。
 * 当用户邮箱登录后，P_INFO字段会存储登录账户以及登录时间，若用户退出该cookie值仍然存在；下次重新登录后，改变。
 * 
 * 然后用户只要访问了二级域名是163.com的值后，上述字段都可以取到。sdk采集了这些信息后，就可以打通这几个网站： 
 * 如： 用户先访问了 https://www.163.com/   ==> https://kada.163.com/ | https://music.163.com/
 * 
 */

import {_} from './utils';

var commonCookie = {
    config: {
        sourceUrl: 'https://www.163.com/'
    },
    getCookie: function() {
        var NTES_P_UTID = _.cookie.get('NTES_P_UTID');
        var _ntes_nnid = _.cookie.get('_ntes_nnid');
        var _ntes_nuid = _.cookie.get('_ntes_nuid');
        var P_INFO = _.cookie.get('P_INFO');
        var obj = {};
        try {
            if (_ntes_nnid) {
                obj['$_ntes_nnid_id'] = _ntes_nnid.split(',')[0];
                obj['$_ntes_nnid_time'] = _ntes_nnid.split(',')[1];
                obj['$_ntes_domain'] = '163.com';
            }
            if (_ntes_nuid) {
                obj['$_ntes_nuid'] = _ntes_nuid;
            }
            if (P_INFO) {
                obj['$P_INFO_userid'] = P_INFO.split('|')[0];
                obj['$P_INFO_time'] = P_INFO.split('|')[1];
            }
            if (NTES_P_UTID) {
                obj['NTES_P_UTID'] = NTES_P_UTID;
            }
        } catch (error) {
            console.log(error)
        }

        return obj;
    }
};

export default commonCookie;