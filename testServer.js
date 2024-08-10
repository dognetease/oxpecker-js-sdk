'use strict';

var express      = require('express');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');
var bodyParser = require('body-parser');
var querystring = require('querystring');

var app = express();

// 返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

// app.use(cookieParser());
// app.use(logger('dev'));

//app.use('/tests', express.static(__dirname + "/tests"));
// app.get('/tests/cookie_included/:cookieName', function(req, res) {
//     if (req.cookies && req.cookies[req.params.cookieName]) {
//         res.json(1);
//     } else {
//         res.json(0);
//     }
// });
app.use(express.static(__dirname));

// app.all('*', function(req, res, next) {   /root/www/out/administration/dist
//     res.header("Access-Control-Allow-Origin", '*'); 
//     res.header("Access-Control-Allow-Headers", "Origin, X-requested-With, Content-Type, Accept");  
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
//     // res.header("X-Powered-By",' 3.2.1')  
//     // res.header("Content-Type", "application/json;charset=utf-8");  
//     next();  
// });

// app.get('/', function(req, res) {
//   console.log('xxx')
//     //res.redirect(301, '/tests/');
// });

// app.get('/decide', function(req, res) {
//     console.log('==================================================================================');
//     console.log('decide: ' +JSON.stringify(req.query));
//     res.send(JSON.stringify(req.query));
// });
// app.get('/track', function(req, res) {
//     //console.log('track: ' +JSON.stringify(req.query));
//     console.log('track: data' +new Buffer(JSON.stringify(req.query.data), 'base64').toString());
//     console.log('==================================================================================');
//     res.send(new Buffer(JSON.stringify(req.query.data), 'base64').toString());
// });
// app.get('/engage', function(req, res) {
//     //console.log('track: ' +JSON.stringify(req.query));
//     console.log('engage: data' +new Buffer(JSON.stringify(req.query.data), 'base64').toString());
//     console.log('==================================================================================');
//     res.send(new Buffer(JSON.stringify(req.query.data), 'base64').toString());
// });
app.get('/track/w', function(req, res) {
    //console.log('track: ' +JSON.stringify(req.query));
    //var dd = JSON.stringify(req.query.data);
    //dd = dd.replace(/\s/g, "+");
    //console.log('receiver: data' + new Buffer(dd, 'base64').toString('utf8'));
    // var kk = new Buffer(JSON.stringify(req.query.data), 'base64').toString();
    // kk = JSON.parse(kk);
    // console.log(kk.eventId, kk.currentUrl);
    // res.send(new Buffer(JSON.stringify(req.query.data), 'base64').toString());
    //res.send('test');
    res.send('test');
});
app.post('/track/w', function(req, res) {
    var data = '';
    req.on('data', function (chunk) {
    // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
        data += chunk;
    });
    req.on('end', function () {

    //（1）.对url进行解码（url会对中文进行编码）
        data = decodeURI(data);
        console.log(data);

    /**post请求参数不能使用url模块解析，因为他不是一个url，而是一个请求体对象 */

    //（2）.使用querystring对url进行反序列化（解析url将&和=拆分成键值对），得到一个对象
    //querystring是nodejs内置的一个专用于处理url的模块，API只有四个，详情见nodejs官方文档
    // var dataObject = querystring.parse(data);
    // console.log(dataObject);
    });


  //console.log(req.body);
    res.send('');
});
// app.post('/cc/a_exp', function(req, res) {
//     res.send(JSON.stringify({
//         "experiments": [
//             {
//                 "experimentId": "e5affe7a-cdd4-4301-85dd-11ec5b65e5b4",
//                 "versionId": "b4d95328-2ed5-43ac-8ee7-362f498a36c8",
//                 "variables": [
//                     "String12"
//                 ]
//             },
//             {
//                 "experimentId": "e5affe7a-cdd4-4301-85dd-11ec5b65e5b4--xx",
//                 "versionId": "b4d95328-2ed5-43ac-8ee7-362f498a36c8--xx",
//                 "variables": [
//                     "String13"
//                 ]
//             }
//         ],
//         "variables": {
//             "String12": "Value12",
//             "String13": '23'
//         }
//     }));
// });

var http = require('http');
var querystring = require('querystring');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.post('/cc/a_exp', function(reqsss, ressss) {
    var opt = {
        host:'10.240.192.60',
        port:'8182',
        method:'POST',//这里是发送的方法
        path:'http://10.240.192.60:8182/cc/a_exp',     //这里是访问的路径
        headers:{
     //这里放期望发送出去的请求头
            'Content-Type':'application/json'
        }
    }
    var body = '';
    var req = http.request(opt, function(res) {
    //console.log("Got response: " + res.statusCode);
        res.on('data',function(d){
            body += d;
        }).on('end', function(){
   // console.log(res.headers)
            console.log(body)
            body = JSON.parse(body);
            body.data.experiments.push(
                {
                    experimentId: '222',
                    versionId: '页面组1222',
                    variables: ['%7d0096f77546a7de1']
                },
                {
                    experimentId: '333',
                    versionId: '单页面111',
                    variables: ['%7d0096f77546a7de']
                }
    );
            body.data.variables['%7d0096f77546a7de1'] = '{"pattern":{"relation":"OR","conditions":[{"type":"urlGroup","field":"URL","func":"EQUAL","params":["http://10.240.192.60:3100/tests/test_wy.html"],"attributeType":"Custom","fieldType":"Event"},{"type":"urlGroup","field":"URL","func":"CONTAIN","params":["#dd=33"],"attributeType":"Custom","fieldType":"Event"},{"type":"urlGroup","field":"URL","func":"REG_MATCH","params":["/#dd=2/"],"attributeType":"Custom","fieldType":"Event"}]},"variations":[{"selector":"#one","css":{"background-color":"rgb(221, 221, 221)","background-image":"none","border-color":"rgba(0, 0, 0, 0.65)","border-style":"none","border-width":"0px","color":"rgba(0, 0, 0, 0.65)","display":"block","font-size":"14px","font-weight":"400","height":"42px","text-align":"start","visibility":"visible","width":"1920px"},"attributes":{"placeholder":"","href":"javascript:;"},"nodeName":"A"},{"selector":"#ff","css":{"background-image":"none","border-color":"rgba(0, 0, 0, 0.65)","border-style":"none","border-width":"0px","color":"rgba(0, 0, 0, 0.65)","display":"block","font-size":"14px","font-weight":"400","height":"42px","text-align":"start","visibility":"visible","width":"1920px"},"attributes":{"placeholder":"","href":"javascript:;"},"nodeName":"BUTTON"}]}';

            body.data.variables['%7d0096f77546a7de'] = '{"variations":[{"selector":"#ff","css":{"background-color":"#f00","background-image":"none","border-color":"rgba(0, 0, 0, 0.65)","border-style":"none","border-width":"0px","color":"rgba(0, 0, 0, 0.65)","display":"block","font-size":"14px","font-weight":"400","height":"42px","text-align":"start","visibility":"visible","width":"1920px"},"attributes":{"placeholder":"","href":""},"nodeName":"BUTTON"},{"selector":"#stop","css":{"background-color":"rgb(221, 221, 221)","background-image":"none","border-color":"rgba(0, 0, 0, 0.65)","border-style":"none","border-width":"0px","color":"rgba(0, 0, 0, 0.65)","display":"block","font-size":"14px","font-weight":"400","height":"42px","text-align":"start","visibility":"visible","width":"1920px"},"attributes":{"placeholder":"","href":""},"nodeName":"BUTTON"}]}';

            ressss.send(JSON.stringify(body));
        });
   
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    })
    console.log(querystring.stringify(reqsss.body))
  //req.write(querystring.stringify(reqsss.body));
    req.write(JSON.stringify(reqsss.body));
    req.end();
});

var port = 80;

var server = app.listen(port, function () {
    console.log('11 test app listening on port %s', server.address().port);
});
