// 参考：https://my.oschina.net/wanjubang/blog/630872?p=1
import os from 'os';
import { expect } from 'chai';
import jsdom from 'mocha-jsdom';
import sinon from 'sinon';
import nodeLocalStorage from 'node-localstorage';

import Abtest from '../../src/abtest'
import { _ } from '../../src/utils'


jsdom({
  url: 'http://10.240.192.60:3100/tests/test_wy.html'
});

const triggerMouseEvent = function(node, eventType) {
  node.dispatchEvent(new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true
  }));
}

const simulateClick = function(el) {
  triggerMouseEvent(el, "click");
}

describe('abtest', function() {
  before(function() {
    // jsdom doesn't have support for local/session storage
    // add support using this node implementation
    window.sessionStorage = nodeLocalStorage.LocalStorage(os.tmpdir() + '/tmpSessionStorage');
  });

  beforeEach(function() {
    window.sessionStorage.clear();
  });

  describe('编程实验以及相关API', function() {
    let lib, sandbox;
    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
      sandbox = sinon.createSandbox();
      lib = {
        _prepare_callback: sandbox.spy(callback => callback),
        _send_request: sandbox.spy((url, params, callback) => callback({config: {enable_collect_everything: true}})),
        get_user_id: sandbox.spy(function() {
          return 'xxxx-id';
        }),
        get_config: sandbox.spy(function(key) {
          switch (key) {
            case 'api_host':
              return 'https://test.com';
            case 'token':
              return 'testtoken';
            case 'abtest':
              return {
                enable_abtest: true,
                default_variables: {
                  btnColor: 'red'
                }
              };   
          }
        }),
        appkey: 'testtoken',
        track: sandbox.spy()
      };
      Abtest._getVariableInfoComplete = true;
    });

    afterEach(function() {
      sandbox.restore();
      this.clock.restore();
    });

    it('调用 get_variation 方法，执行一次回调', function() {
      Abtest.init(lib);
      const test = {
        callback: function(flgs) {
        }
      };
      const callback = sandbox.spy(test, 'callback');
      Abtest.get_variation(callback);
      this.clock.tick(600);
      expect(callback.calledOnce).to.equal(true);
    });

    it('调用 get 方法，获取指定变量', function() {
      Abtest.init(lib);
      expect(Abtest.get('btnColor')).to.equal('red');
    });

    it('使用某个实验变量，触发abtest事件', function() {
      Abtest.init(lib);
      Abtest.data.variables = {'btnColor': 'ff'};
      Abtest.data.experiments = [{
        experimentId: 12,
        versionId: 13,
        variables: ['btnColor']
      }];
      Abtest.get('btnColor');
      expect(lib.track.calledOnce).to.equal(true);
      const trackArgs = lib.track.args[0];
      const event = trackArgs[0];
      const props = trackArgs[1];
      expect(event).to.equal('da_abtest');
      expect(props).to.deep.equal({
      '$experimentId': '12',
      '$versionId': '13',
      '$experimentType': 1,
       btnColor: 'ff'});
    });

    it('判断是否要去拉取配置内置方法：_checkUpdateTime', function() {
      Abtest.init(lib);
      Abtest.abtest_config.interval_mins_abtest = 0.1;
      Abtest._getLocalStorageData =  sandbox.stub(Abtest, '_getLocalStorageData').returns({data: { updatedTime: new Date().getTime() }});
      // 不用拉取配置
      expect(Abtest._checkUpdateTime()).to.equal(false);
      setTimeout(() => {
        // 拉取配置
        expect(Abtest._checkUpdateTime()).to.equal(true);
      }, 6000);
    });
    
    it('返回本地是否有缓存方法：hasLocalCache', function() {
      Abtest.init(lib);
      Abtest.abtest_config.interval_mins_abtest = 0.1;
      Abtest._getLocalStorageData =  sandbox.stub(Abtest, '_getLocalStorageData').returns({data: { updatedTime: new Date().getTime() }});
      expect(Abtest.hasLocalCache()).to.equal(true);
      setTimeout(() => {
        // 无缓存
        expect(Abtest.hasLocalCache()).to.equal(false);
      }, 6000);
    });

  });

  describe('重新从服务器拉取最新实验数据方法: async_get_variable', function() {
    let lib, sandbox;
    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
      sandbox = sinon.createSandbox();
      lib = {
        _prepare_callback: sandbox.spy(callback => callback),
        _send_request: sandbox.spy((url, params, callback) => callback({config: {enable_collect_everything: true}})),
        get_user_id: sandbox.spy(function() {
          return 'xxxx-id';
        }),
        get_config: sandbox.spy(function(key) {
          switch (key) {
            case 'api_host':
              return 'https://test.com';
            case 'token':
              return 'testtoken';
            case 'abtest':
              return {
                enable_abtest: true,
                default_variables: {
                  btnColor: 'red'
                }
              };   
          }
        }),
        appkey: 'testtoken',
        track: sandbox.spy()
      };
      Abtest.init(lib);
    });
    afterEach(function() {
      sandbox.restore();
      this.clock.restore();
    });

    it('实验编辑阶段，取消从服务器拉取配置信息', function() {
      Abtest.isEditor =  sandbox.stub(Abtest, 'isEditor').returns(true);
      sandbox.spy(_.ajax, 'post');
      Abtest.async_get_variable();
      expect(_.ajax.post.calledOnce).to.equal(false);
      expect(Abtest._getVariableInfoComplete).to.equal(true);
    });

    it('未开启abtest实验，不从服务器拉取配置信息', function() {
      sandbox.spy(_.ajax, 'post');
      Abtest.abtest_config.enable_abtest = false;
      Abtest.async_get_variable();
      expect(_.ajax.post.calledOnce).to.equal(false);
    });
    
    it('正常拉取实验配置', function() {
      sandbox.spy(_.ajax, 'post');
      Abtest.async_get_variable();
      expect(_.ajax.post.calledOnce).to.equal(true);
    });

    it('超时配置，timeoutMs', function() {
      const data = {
        code: 200,
        data: {
          experiments: [],
          variables: {}
        }
      };
      Abtest.abtest_config.timeoutMs = 1000;
      sandbox.spy(Abtest, '_saveLocal');
      _.ajax.post = sandbox.stub(_.ajax, 'post')
        .yieldsTo('callback', data);
      Abtest.async_get_variable();
      const postArgs = _.ajax.post.args[0];
      const callback = postArgs[2];
      const timeout = postArgs[3];
      expect(timeout).to.equal(Abtest.abtest_config.timeoutMs);
      this.clock.tick(1000);
      expect(Abtest._getVariableInfoComplete).to.equal(true);
      expect(Abtest._saveLocal.calledOnce).to.equal(false);
      _.ajax.post('111', {}, callback.bind(Abtest), timeout);
    });
  });

});