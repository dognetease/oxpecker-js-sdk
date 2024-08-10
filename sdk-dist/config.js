// sdk默认配置信息
var Config = {
    DEBUG: false,
    // 当前sdk版本号
    LIB_VERSION: '1.6.11',
    api_host: 'https://hubble.netease.com',
    // 日志上报的路径
    track_url: '/track/w/',
    cross_subdomain_cookie: true,
    persistence: 'localStorage',
    // 初始化前的钩子函数
    loaded: function() {},
    // 是否启动信标方式上报日志
    img: true,
    // 是否启动自动采集PV
    track_pageview: true,
    // 控制台打印调试日志
    debug: false,
    // cookie过期日期
    cookie_expiration: 730,
    // 一次Session的超时时间，默认30分钟。
    session_interval_mins: 30,
    track_links_timeout:  300,
    // 默认不启动单页面应用
    is_single_page: false,
    // 单页面模式下的配置
    single_page_config: {
        mode: 'hash',
        // history模式下，当url变动是通过 replace方式，默认不采集pv
        track_replace_state: false
    },
    // APP采集H5页面数据开关，默认为false
    use_app_track: false,
    // 截取字段长度，默认不截取
    truncateLength: -1,
    // 发送数据异常上报开关，默认为false
    send_error: false,
    // 在hubble平台内跳转到第三方网页，启动渲染模式不发数据
    hubble_render_mode: false,
    //热力图引入的js地址
    heatmap_url : 'https://hubble.netease.com/track/w/heatmap/heatmap.js',
    //拉取热力图请求地址
    heatmap_getdata_host: 'https://hubble.netease.com',
    // 在hubble平台中，控制js文件的路径
    control_js_url: 'https://hubble.netease.com/track/w/control/control.js',
    // 可视化实验编辑js文件路径
    visualization_editor_js_url: 'https://hubble.netease.com/track/w/visualization/visualization.js'
};

// 事件类型
// 默认事件类型，自定义
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

// 用户属性系统保留属性
var PEOPLE_RESERVED_PROPERTY = [];
// 用户属性上报数据所属事件id
var PEOPLE_PROPERTY_ID = 'da_user_profile';

// sdk上报数据所属类型
var SDKTYPE = 'js';


export { Config, DATATYPE, DEFAULTEVENTID, PEOPLE_RESERVED_PROPERTY, SDKTYPE, PEOPLE_PROPERTY_ID };
