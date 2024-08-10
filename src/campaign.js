/**
 * 渠道推广
 */
import {_} from './utils';

var campaign = {
    data: {
        campaign: {
            utm_source: '',
            utm_medium: '',
            utm_campaign: '',
            utm_content: '',
            utm_term: '',
            promotional_id: ''
        },
        //是否渠道推广
        isCampaign: false,
        //是否为点击广告事件
        isAdClick: false,
        campaignParamsSaved: false,
        APPKEY: ''
    },
    init: function(APPKEY, instance) {
        if(typeof APPKEY === 'undefined') return;
        this.data.APPKEY = APPKEY;
        this.DATracker = instance;
        this.checkCampaign();
        this.checkAdClick();
        this.setParams();
        if( this.data.isCampaign ) {
            this.save();
        }
    },
    campaignParams: function() {
        var campaign_keywords = 'utm_source utm_medium utm_campaign utm_content utm_term promotional_id'.split(' '),
            kw = '',
            params = {};
        _.each(campaign_keywords, function(kwkey) {
            kw = _.getQueryParam(document.URL, kwkey);
            if (kw.length) {
                params[kwkey] = kw;
            }
        });
    
        return params;
    },
    setParams: function() {
        var params = {};
        //是渠道推广，params 数据从 url上拿, 否则从cookie上拿
        if(this.data.isCampaign) {
            params = this.campaignParams();
        } else {
            var cookie = _.cookie.get('hb_'+ this.data.APPKEY + '_u');
            if(cookie) {
                params = _.JSONDecode(cookie);
            }
        }
        this.data.campaign = _.extend( this.data.campaign, params );
    },
    getParams: function() {
        this.setParams();
        return  this.changeParams();
    },
    //检测是否为渠道推广
    checkCampaign: function() {
        var params = this.campaignParams();
        if( typeof params.utm_source !== 'undefined' &&
            // 需求变更
            //typeof params.utm_medium !== 'undefined' &&
            typeof params.utm_campaign !== 'undefined'
          ) {
            this.data.isCampaign = true;
        }
    },
    //检测是否为点击广告事件
    checkAdClick: function() {
        // t_rs 有表示短链跳转到落地页，此时sdk认为不是广告点击事件
        var t_rs = _.getQueryParam(document.URL, 't_rs');
        if(this.data.isCampaign) {
            if( document.referrer && !t_rs) {
                this.data.isAdClick = true;
            }
        }
    },
    //params保存到本地cookie
    save: function() {
        var campaigin = this.DATracker.get_config('campaigin');
        if (!campaigin) {
            campaigin = {
                useHour: false, // 默认使用天
                day: 30,
                hour: 30 * 24
                //keepCachedUtm: false // 如果设置为true，不更新本地已存在的推广信息，先判断本地是否有数据
            }
        }
        if (!this.data.campaignParamsSaved) {
            if (!campaigin.useHour) {
                _.cookie.set('hb_'+ this.data.APPKEY + '_u', _.JSONEncode( this.data.campaign ), campaigin.day, this.DATracker.get_config('cross_subdomain_cookie'));
            } else {
                _.cookie.setUseHour('hb_'+ this.data.APPKEY + '_u', _.JSONEncode( this.data.campaign ), campaigin.hour, this.DATracker.get_config('cross_subdomain_cookie'));
            }
            
            this.data.campaignParamsSaved = true;
        }
    },
    changeParams: function() {
        var campaign = this.data.campaign;
        var turnParams = {
            utmSource: campaign.utm_source,
            utmMedium: campaign.utm_medium,
            promotionalID: campaign.promotional_id,
            utmCampaign: campaign.utm_campaign,
            utmContent: campaign.utm_content,
            utmTerm: campaign.utm_term
        };
        if(!turnParams.utmSource) {
            delete turnParams.utmSource;
        }
        if(!turnParams.utmMedium) {
            delete turnParams.utmMedium;
        }
        if(!turnParams.promotionalID) {
            delete turnParams.promotionalID;
        }
        if(!turnParams.utmCampaign) {
            delete turnParams.utmCampaign;
        }
        if(!turnParams.utmContent) {
            delete turnParams.utmContent;
        }
        if(!turnParams.utmTerm) {
            delete turnParams.utmTerm;
        }
        return turnParams;
    }
};

export default campaign;