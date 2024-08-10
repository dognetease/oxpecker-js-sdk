/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2019-01-03
 * @description: 工具类
 */
var MathTool = {
    /**
     * 保留两位小数
     * @param {*} str 
     */
    formatNum: function(str) {
        if(isNaN(str)){	//不是数字直接返回
          return str;
        }
        str = "" + str;
        var newStr = "";
        var count = 0;
        
        if(str.indexOf(".")==-1){
            for(var i=str.length-1;i>=0;i--){
            if(count % 3 == 0 && count != 0){
                newStr = str.charAt(i) + "," + newStr;
              }else{
                newStr = str.charAt(i) + newStr;
              }
            count++;
          }
          str = newStr + ""; //自动补小数点后两位
        }
        else
        {
          for(var i = str.indexOf(".")-1;i>=0;i--){
            if(count % 3 == 0 && count != 0){
                newStr = str.charAt(i) + "," + newStr;
            }else{
                newStr = str.charAt(i) + newStr; //逐个字符相接起来
            }
            count++;
          }
          str = newStr + (str + "00").substr((str + "00").indexOf("."),3);
        }
        return str;
    },
    /**
     * 获取浏览器可视区域的宽度
     */
    getBrowserWidth: function() {
        var a = window.innerWidth || document.body.clientWidth;
        return isNaN(a) ? 0 : parseInt(a, 10);
    },
    /**
     * 获取浏览器可视区域的高度
     */
    getBrowserHeight: function() {
        var a = window.innerHeight || document.body.clientHeight;
        return isNaN(a) ? 0 : parseInt(a, 10);
    },
    /**
     * 获取横向滚动的距离
     */
    getScrollLeft: function() {
        var a = 0;
        try {
          a = document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset;
          a = isNaN(a) ? 0 : a;
        } catch (b) {
          a = 0;
        }
        return parseInt(a, 10);
    },
    /**
     * 获取纵向滚动的距离
     */
    getScrollTop: function() {
        var a = 0;
        try {
          a = document.documentElement.scrollTop || document.body.scrollTop || m.pageYOffset;
          a = isNaN(a) ? 0 : a;
        } catch (b) {
          a = 0;
        }
        return parseInt(a, 10);
    },
    /**
     * 获取页面的总宽度
     */
    getPageWidth: function() {
        var a = parseInt(document.body.scrollWidth, 10);
        return isNaN(a) ? 0 : a;
    },
    /**
     * 获取页面的总高度
     */
    getPageHeight: function() {
        var a = parseInt(document.body.scrollHeight, 10);
        return isNaN(a) ? 0 : a;
    },
    getBoundingClientRect(ele) {
        // 该方法是计算当前元素距离当前视口的距离，所以需要得到页面的滚动距离
        var scrollTop = this.getScrollTop();
        var scrollLeft = this.getScrollLeft();
        // 如果浏览器支持该方法
        if (ele.getBoundingClientRect) {
            // if (typeof ele.offset !== 'number') {
            // //不同浏览器中，元素的默认位置不同。为了统一起见，需要新创建一个元素
            //     var temp = document.createElement('div');
            //     temp.style.cssText = "position:absolute;top:0;left:0";
            //     document.body.appendChild(temp);
            //     ele.offset = -temp.getBoundingClientRect().top - scrollTop;
            //     document.body.removeChild(temp);
            //     temp = null;
            //     console.log(ele.offset);
            // }
            var rect = ele.getBoundingClientRect();
            //var rect = ele.offset;
  
            return {
                left: scrollLeft + rect.left,
                right: rect.right,
                top: scrollTop + rect.top,
                bottom: rect.bottom
            }
        } else {
            //当前浏览器不支持该方法
            var actualLeft = this.getElementLeft(ele);
            var actualTop = this.getElementTop(ele);
  
            return {
                left: actualLeft - scrollLeft,
                right: actualLeft + offsetWidth - scrollLeft,
                top: actualTop - scrollTop,
                bottom: actualTop + offsetHeight - scrollTop
            }
        }
    },
    //需要使用offsetLeft，offsetTop方法。需要明确的是这两个方法都是当前元素相对于其父元素的位置，所以要得到相对于页面的距离需要循环计算。
    getElementLeft(ele) {
        var actualLeft = ele.offsetLeft;
        var current = ele.offsetParent;
        // 如果当前元素不是根元素
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    },
    getElementTop(ele) {
        var actualTop = ele.offsetTop;
        var current = ele.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    },
    /**
     * 从URL中获取参数obj
     */
    getParamFormURL: function(p, urlParam) {
        //获取url中"?"符后的字串
        var url = '';
        if(urlParam){
            var index = urlParam.indexOf("?");
            url = urlParam.substr(index);
        }else{
            url = decodeURIComponent(location.search); 
        }
        
        url = url.replace(/\+/g, '%20');
        var theRequest = new Object();
        if (url.indexOf("?") > -1) {
            var str  = url.substr(1);
            var strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]);
            }
        }
        if(!!p){
            return theRequest[p];
        }else{
            return theRequest;
        }
    },
    isMobile() {
        return "ontouchstart" in window;
    }
}

export default MathTool;