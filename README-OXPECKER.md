oxpecker js SDK是基于hubble SDK基础上开发，为了减少测试sdk采集的公共字段是否正确工作量。业务方接入sdk仍按照hubble方式接入，oxpecker SDK提供额外接口，用于向oxpecker平台发送数据。

注意点
- oxpecker sdk目前采用同步方式加载，若未init sdk便发送埋点，会造成埋点数据的丢失。

### 接口一览

#### oxpecker_init

用于初始化oxpecker SDK，配置appKey和公共属性，必须在发送埋点之前设置

| 参数名称 | 类型   | 是否必传 | 描述               | 备注                                                                     |
| -------- | ------ | -------- | ------------------ | ------------------------------------------------------------------------ |
| appKey   | String | Y        | oxpecker平台appKey |                                                                          |
| config   | Object | N        | 公共参数           | 该公共参数会自动添加到用户自定义属性里，相当于调用oxpecker_update_config |

#### oxpecker_set_url

初始化oxpecker SDK埋点服务器地址，urls包含三个值

- baseUrl：一般埋点落库地址，默认为：https://oxpecker.lx.netease.com/api/pub/event/tracking

- beaconUrl：关闭页面，缓存埋点落库地址，默认为：https://oxpecker.lx.netease.com/api/pub/event/send-beacon/tracking

- isNewUrl：后端查询是否新用户url，默认为：https://oxpecker.lx.netease.com/api/pub/user-active

**测试环境域名:** `oxpecker.cowork.netease.com`

**正式环境域名:** `oxpecker.lx.netease.com`

| 参数名称 | 类型   | 是否必传 | 描述                 | 备注             |
| -------- | ------ | -------- | -------------------- | ---------------- |
| urls     | Object | N        | 配置oxpecker服务地址 | 完整协议，含路径 |

#### oxpecker_update_config

在更新全局配置的时候，sdk会自动flush

| 参数名称 | 类型   | 是否必传 | 描述         | 备注 |
| -------- | ------ | -------- | ------------ | ---- |
| config   | Object | Y        | 更新公共配置 |      |

#### oxpecker_remove_config

在更新全局配置的时候，sdk会自动flush

| 参数名称 | 类型   | 是否必传 | 描述                      | 备注 |
| -------- | ------ | -------- | ------------------------- | ---- |
| key      | String | Y        | 依赖key来删除业务公共配置 |      |

#### oxpecker_set_token

同步调试用，通过oxpecker可视化平台生成token，注入SDK，买点数据会自动发送到oxpecker平台，供测试

token可以通过api调用，也可以通过url query传入（web页面一般通过oxpecker可视化平台link跳转进入）

| 参数名称 | 类型   | 是否必传 | 描述                           | 备注 |
| -------- | ------ | -------- | ------------------------------ | ---- |
| token    | String | Y        | oxpecker平台调试页面生成hash码 |      |

#### oxpecker_set_product_profile

| 参数名称 | 类型   | 是否必传 | 描述                       | 备注 |
| -------- | ------ | -------- | -------------------------- | ---- |
| config   | Object | Y        | 业务productProfile公共配置 |      |

productProfile存储业务线的公共配置，*应当按照平台约定传入*，以*灵犀和外贸为例*，参数配置如下
| key           | 类型   | 描述                              |
| ------------- | ------ | --------------------------------- |
| domain        | String | 域名                              |
| isLogin       | Bool   | 是否登陆                          |
| orgName       | String | 网易灵犀办公,按照实际企业名称传输 |
| orgId         | Number | 企业ID                            |
| userAccount   | String | 邮箱账号                          |
| qiyeAccountId | Number | 企业邮箱账号                      |

#### oxpecker_flush

立即发送缓存的埋点，无参数。

#### oxpecker_config_sdk
配置sdk的行为表现，如是否向hubble发送埋点

| 参数名称 | 类型   | 是否必传 | 描述          | 备注 |
| -------- | ------ | -------- | ------------- | ---- |
| config   | Object | Y        | sdk的表现行为 |      |

目前仅支持是否向hubble发送埋点


#### oxpecker_set_base_attributes
批量数据发送过程中，一些*基础参数*会被放在baseAttributes下，大部分参数由sdk自动采集，用户可覆盖该部分配置
| 参数名称 | 类型   | 是否必传 | 描述          | 备注 |
| -------- | ------ | -------- | ------------- | ---- |
| config   | Object | Y        | sdk的表现行为 |      |

详细参数如下
| key            | 类型   | 描述                   |
| -------------- | ------ | ---------------------- |
| _system        | String | 操作系统               |
| _deviceId      | String | 用户设备id             |
| _screenWidth   | String | Number                 | 用户屏幕宽 |
| _screenHeight  | String | Number                 | 用户屏幕高 |
| _cityName      | String | 城市                   |
| _systemVersion | String | 操作系统版本           |
| _version       | String | app版本                |
| _pageTitle     | String | 页面title              |
| _pageUrl       | String | 页面path、包括参数部分 |


### 使用示例

以同步使用为例，script标签引入埋点代码

```html
<script>

    // hubble init
    const sdk = window.DATracker;
    if (sdk) {
        // 初始化hubble sdk，详情可以参考README
        sdk.init('88888888', {
            truncateLength: 255,
            persistence: "localStorage",
            cross_subdomain_cookie: false
        });




        // oxpecker init
        sdk.oxpecker_init('oxpeckerAppKey');

        // 更新productProfile，全量更新
        sdk.oxpecker_set_product_profile({
            domain: 'xxxx',
            isLogin: 'true',
            orgName: 'xxxx',
            orgId: 111111,
            qiyeAccountId: 2222222
        });

        // 增量更新业务公共配置，sdk会自动添加到data.attributes下
        sdk.oxpecker_update_config({
            name: 'test'，
            age: 'xxx'
        });
        // 根据key移除业务公共配置
        sdk.oxpecker_remove_config('name');

        // 手动注入debug token，oxpecker平台埋点实时调试需要
        sdk.oxpecker_set_token('21321776abcf23');

        // 手动设置用户设备的deviceId
        sdk.oxpecker_set_deviceId('XXXXX');

        // 配置埋点落库地址，如无特定地址，可不配置，默认走oxpecker公共落库地址
        sdk.oxpecker_set_url(
            {
                baseUrl: 'xxxx',
                beaconUrl: 'xxxx',
                isNewUrl: 'xxxx'
            }
        );

        // 配置baseAttributes属性
        sdk.oxpecker_set_base_attributes({
            _appVersion: 'XXXX'
        });

        // 配置sdk不向hubble平台发送数据，默认为true
        sdk.oxpecker_config_sdk({
            send2Hubble: false
        })

        // 立即刷新缓存埋点
        sdk.flush();

        // 发送业务埋点示例
        sdk.track('eventId', {
            xxx: 'xxxx'
        });

        // 发送性能埋点，自定义属性中必须有key为value的属性且value的值为数字
        sdk.track('eventId', {
            value: 1
        })
    }


</script>
```
