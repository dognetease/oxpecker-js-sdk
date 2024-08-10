/**
 * 可视化实验：选择元素和渲染
 * hubbleoverlay
 */
import Util from './util.jsx';
// 先去掉，有问题
import { select } from 'optimal-select';

const _ = {
  getDomIndex(el){
    var indexof = [].indexOf;
    if (!el.parentNode) return -1;
    var list = el.parentNode.children;

    if (!list) return -1;
    var len = list.length;

    if (indexof) return indexof.call(list, el);
    for (var i = 0; i < len; ++i) {
      if (el == list[i]) return i;
    }
    return -1;
  },
  selector(el){
    //var classname = _.trim(el.className.baseVal ? el.className.baseVal : el.className);
    var i = (el.parentNode && 9 == el.parentNode.nodeType) ? -1 : this.getDomIndex(el);
    if(el.id){
      return '#' + el.id;
    }else{
      return el.tagName.toLowerCase()      //+ (classname ? classname.replace(/^| +/g, '.') : '')
        + (~i ? ':nth-child(' + (i + 1) + ')' : '');
    }
  },
  getDomSelector(el,arr) {
    if(!el || !el.parentNode || !el.parentNode.children){
      return false;
    }
    arr = arr && arr.join ? arr : [];
    var name = el.nodeName.toLowerCase();
    if (!el || name === 'body' || 1 != el.nodeType) {
      arr.unshift('body');
      return arr.join(' > ');
    }
    arr.unshift(this.selector(el));
    if (el.id) return arr.join(' > ');
    return this.getDomSelector(el.parentNode, arr);    
  },
  getDomSelectorTwo(el) {
    if(!el || !el.parentNode || !el.parentNode.children){
      return false;
    }
    return select(el);
  },
  isParent(itemEl, parentEl) {
    while (itemEl != undefined && itemEl != null && itemEl.tagName.toUpperCase() != 'BODY'){ 
      if (itemEl == parentEl){ 
        return true; 
      }
      itemEl = itemEl.parentNode; 
    }
    return false; 
  },
  querySelector(selector, parentEl) {
		try {
			return (parentEl || document).querySelector(selector);
		} catch (e) {
			return null
		}
  },
  querySelectorAll(selector, parentEl) {
		try {
			return (parentEl || document).querySelectorAll(selector);
		} catch (e) {
			return []
		}
  },
  offset(itemEl){
    if (!itemEl) return;
    const rect = itemEl.getBoundingClientRect();
    if ( rect.width || rect.height ) {
      const doc = itemEl.ownerDocument;
      const docElem = doc.documentElement;
      // 兼容IE写法 ==》  - docElem.clientTop、 - docElem.clientLeft ，其它浏览器为0px，IE为2px
      return {
        top: rect.top + window.pageYOffset - docElem.clientTop,
        left: rect.left + window.pageXOffset - docElem.clientLeft
      };
    }else{
      return {
        top: 0,
        left: 0
      }
    }
  },
  getSize(itemEl){
    if (!itemEl) return;
    if (!window.getComputedStyle) {
      return {width: itemEl.offsetWidth, height: itemEl.offsetHeight};
    }
    try {
      const bounds = itemEl.getBoundingClientRect();
      return {width: bounds.width, height: bounds.height};
    } catch (e){
      return {width: 0, height: 0};
    }
  },
  getStyle(itemEl, value){
    // 若可以拿到 style上的属性，则取它
    if(itemEl.style[value]) {
      return itemEl.style[value];
    }
    // 兼容IE
    if(itemEl.currentStyle){
      return itemEl.currentStyle[value];
    }else{
      return itemEl.ownerDocument.defaultView.getComputedStyle(itemEl, null).getPropertyValue(value);
    }
  },
  removeChild(itemEl) {
    itemEl && itemEl.parentNode && itemEl.parentNode.removeChild(itemEl);
  },
  getElementSpacingOffset(direction) {
    const $html = document.getElementsByTagName('html')[0];
    const $body = document.getElementsByTagName('body')[0];
    const scroll = (direction === 'top' ? window.scrollY : window.scrollX);
    const htmlPadding = parseInt(this.getStyle($html, 'padding-' + direction));
    const htmlMargin = parseInt(this.getStyle($html, 'margin-' + direction));
    const htmlBorder = parseInt(this.getStyle($html, 'border-' + direction));
    const bodyBorder = parseInt(this.getStyle($body, 'border-' + direction));
    let a = 0;
    if (htmlBorder > 0 && bodyBorder > 0) {
      a = htmlBorder + bodyBorder;
    }
    return parseInt(htmlPadding + htmlMargin + scroll + a, 10);
  },
  // 设置蒙层样式
  setOverlayPropertiesForElement(originEl, targetEl) {
    try {
      const offset = this.offset(originEl);
      const getSize = this.getSize(originEl);
      const elementBounds = {
        bottom: offset.top + getSize.height,
        top: offset.top,
        left: offset.left,
        right: offset.left + getSize.width,
        width: getSize.width,
        height: getSize.height
      };
      const setOverlayPropertiesForElementLeft = this.getElementSpacingOffset('left') + 1;
      const setOverlayPropertiesForElementTop = this.getElementSpacingOffset('top') + 1;
      targetEl.style.top = (elementBounds.top - setOverlayPropertiesForElementTop)  + 'px';
      targetEl.style.left = (elementBounds.left - setOverlayPropertiesForElementLeft)  + 'px';
      targetEl.style.width = elementBounds.width + 'px';
      targetEl.style.height = elementBounds.height + 'px';
    } catch (error) {
      console.error(error);
    }
  },
  getElementInfo(itemEl) {
    if (!itemEl) {
      return null;
    }
    const obj = {
      nodeName: itemEl.nodeName,
      outerHtml: itemEl.outerHtml,
      css: {
        'width': _.getStyle(itemEl, 'width'),
        'height': _.getStyle(itemEl, 'height'),
        'display': _.getStyle(itemEl, 'display'),
        'visibility': _.getStyle(itemEl, 'visibility'),
        'font-size': _.getStyle(itemEl, 'font-size'),
        'font-weight': _.getStyle(itemEl, 'font-weight'),
        'color': _.getStyle(itemEl, 'color'),
        'text-align': _.getStyle(itemEl, 'text-align'),
        'background-color': _.getStyle(itemEl, 'background-color'),
        'background-image': _.getStyle(itemEl, 'background-image'),
        'border-color': _.getStyle(itemEl, 'border-color'),
        'border-style': _.getStyle(itemEl, 'border-style'),
        'border-width': _.getStyle(itemEl, 'border-width')
      },
      attributes: {
      }
    };
    if (!itemEl.children.length) {
      obj.innerText = itemEl.innerText
    }
    if (itemEl.nodeName === 'A') {
      obj.attributes.href = itemEl.getAttribute('href') || "";
    }
    if (itemEl.nodeName === 'INPUT' || itemEl.nodeName === 'TEXTAREA') {
      obj.attributes.placeholder = itemEl.getAttribute('placeholder') || "";
    }
    if (itemEl.nodeName === 'IMG') {
      delete obj.innerText;
      obj.attributes.src = itemEl.getAttribute('src') || "";
    }
    return obj;
  }
};

const choiceElement = {
  lastKnownHoverElement: null,
  selectedElement: null,
  // 元素的原始属性集合 elementOriginalAttributes = { path: {xx:''} }
  elementOriginalAttributes: {},
  types: {
    'hover': 'hubble-abtest-hover',
    'selected': 'hubble-abtest-selected'
  },
  init() {
    this.setStyle();
    this.setupEventListeners();
  },
  css: [
    '.hubble-abtest-page-overlay {background: transparent;display: block;position: fixed;right: 0px;top: 0px;width: 100%;height: 100%;margin: 0 !important;padding: 0 !important;z-index: 2147483647 !important;}',
    '.hubble-abtest-cursor {position: fixed; background-color: rgba(0, 107, 255, 0.21); border: 1px solid rgba(0, 107, 255, 1); z-index: 2147483647 !important;pointer-events: none;border-radius: 2px;box-sizing: content-box;margin: 0 !important;padding: 0 !important; }'
  ],
  setStyle() {
    let text = '';
    const styleNode  = document.createElement('style');
    styleNode.type = 'text/css';
    for (let i=0; i< this.css.length; i += 1) {
      text += this.css[i];
    }
    if( styleNode.styleSheet){ 
      //ie下要通过 styleSheet.cssText写入. 
      styleNode.styleSheet.cssText = text;  
    }else{
      //在ff中， innerText是可读写的，但在ie中，它是只读的.
      styleNode.innerText = text;
    }
    document.getElementsByTagName('head')[0].appendChild(styleNode);
  },
  //禁止交互的元素
  forbidElement(nodeName) {
    let bool = true;
    if (['BODY','HTML'].indexOf(nodeName) > -1) {
      bool = false;
    }
    return bool;
  },
  // 重新设置蒙层样式
  rerender() {
    const $hubbleAbtestCursorHover = _.querySelector('div.hubble-abtest-hover');
    const $hubbleAbtestCursorSelected = _.querySelector('div.hubble-abtest-selected');
    if ($hubbleAbtestCursorHover) {
      _.setOverlayPropertiesForElement(this.lastKnownHoverElement, $hubbleAbtestCursorHover);
    }
    if ($hubbleAbtestCursorSelected) {
      _.setOverlayPropertiesForElement(this.selectedElement, $hubbleAbtestCursorSelected);
    }
  },
  highlight(e) {
    const selector = e.selector || '';
    const $elArr = _.querySelectorAll(selector);
    for(let i = 0; i < $elArr.length; i += 1) {
      let $div = document.createElement('div');
      $div.className = 'hubble-abtest-cursor ' + this.types[e.type];
      document.body.insertBefore($div, _.querySelector('.hubble-abtest-page-overlay'));
      
      _.setOverlayPropertiesForElement($elArr[i], $div);
    }
  },
  unhighlight(e) {
    const selector = '.hubble-abtest-' + e.type;
    const $elArr = _.querySelectorAll(selector);
    for(let i = 0; i < $elArr.length; i += 1) {
      _.removeChild($elArr[i]);
    }
  },
  handleHover(e) {
    const $element = this.getElementFromPoint(e);
    if ($element && $element !== this.lastKnownHoverElement) {
      const selector = _.getDomSelector($element);
      const elementInfo = _.getElementInfo($element);
      if (!this.forbidElement(elementInfo.nodeName)) {
        return false;
      }
      if (selector) {
        this.unhighlight({
          type: 'hover'
        });
        this.highlight({
          selector: selector,
          type: 'hover'
        });
      }
    }
    this.lastKnownHoverElement = $element;
  },
  unHover() {
    this.unhighlight({
      type: 'hover'
    });
    this.lastKnownHoverElement = null;
  },
  handleClick(e) {
    this.unHover();
    const $element = this.getElementFromPoint(e);
    const selector = _.getDomSelector($element);
    const elementInfo = _.getElementInfo($element);
    if (!this.forbidElement(elementInfo.nodeName)) {
      return false;
    }
    if (elementInfo) {
      this.unhighlight({
        type: 'selected'
      });
      this.highlight({
        selector: selector,
        type: 'selected'
      });
      var obj = {
        selector: selector,
        css: elementInfo.css,
        attributes: elementInfo.attributes,
        nodeName: elementInfo.nodeName
      };
      if (typeof elementInfo.innerText !== 'undefined') {
        obj.innerText = elementInfo.innerText;
      }
      this.setElementOriginalAttributes(selector);
      this.trigger('selected', obj);
      console.log(obj)
      console.log('当前选中元素的原始版本属性信息:', this.getElementOriginalAttributes(selector))
      this.selectedElement = $element;
    }
  },
  handleEvent(e) {
    const target = e.target;
    if (
      !_.isParent(target, document.getElementById('hubble-visual-main')) && 
      !_.isParent(target, document.getElementById('hubble-visual-top')) &&
      !_.isParent(target, document.getElementsByClassName('hubble-visual-confirm-modal')[0])
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "contextmenu") {
        return false;
      }
      switch (e.type) {
        case 'mousemove':
          this.handleHover(e);
          break;
        case 'click':
          this.handleClick(e);
          break;
        case 'mouseleave':
          this.unHover();
          break;
        default:
          return false;      
      }
    } else {
      this.unHover();
    }
  },
  getElementFromPoint(e) {
    const $overlay =  document.getElementsByClassName('hubble-abtest-page-overlay')[0];
    let $element = null;
    if ($overlay) {
      $overlay.style.width = '0';
      $element = document.elementFromPoint(e.clientX, e.clientY);
      $overlay.style.width = '';
    }
    return $element;
  },
  setupEventListeners() {
    const hubbleoverlay = document.createElement('hubbleoverlay');
    hubbleoverlay.className = 'hubble-abtest-page-overlay';
    document.body.appendChild(hubbleoverlay);
    document.body.addEventListener("mousemove", this.handleEvent.bind(this));
    document.body.addEventListener("click", this.handleEvent.bind(this));
    document.body.addEventListener("mouseleave", this.handleEvent.bind(this));
    document.body.addEventListener("contextmenu", this.handleEvent.bind(this));
    window.addEventListener('resize', () => {
      setTimeout(() => this.rerender(), 50);
    });
    window.addEventListener('scroll', () => {
      setTimeout(() => this.rerender(), 50);
    });
  },
  // 选中后元素样式重新渲染
  setElementAttributes(variation) {
    let bool = false;
    if (!variation || !variation.selector) {
      return false;
    }
    this.unHover();
    this.setElementOriginalAttributes(variation.selector);
    const $element = _.querySelector(variation.selector);
    if ($element) {
      for (let key in variation.css) {
        if (variation.css.hasOwnProperty(key)) {
          $element.style[key] = variation.css[key];
        }
      }
      for (let key in variation.attributes) {
        if (variation.attributes.hasOwnProperty(key)) {
          $element.setAttribute(key,variation.attributes[key]);
        }
      }
      for (let ii in variation) {
        if (variation.hasOwnProperty(ii)) {
          if (['css', 'attributes', 'nodeName', 'selector'].indexOf(ii) === -1) {
            $element[ii] = variation[ii];
          }
        }
      }
      // 选中后元素的蒙层重新渲染
      if (this.selectedElement) {
        _.setOverlayPropertiesForElement(this.selectedElement, _.querySelector('.hubble-abtest-selected'));
      }
      bool = true;
    }
    return bool;
  },
  // 外部调用：绘制
  setElementArrAttributes(varList) {
    let notRender = [];
    let _settimeNum = 0;
    varList.map( e => {
      const ttBol = this.setElementAttributes(e);
      if (!ttBol) {
        notRender.push(e);
      }
    } );

    const tt = () => {
      let notRenderNum = 0;
      let ttnotRenderArr = [];
      notRender.map( e => {
        const ttBol = this.setElementAttributes(e);
        if (!ttBol) {
          notRenderNum ++;
          ttnotRenderArr.push(e);
        }
      });

      notRender = ttnotRenderArr;
      if (notRenderNum > 0) {
        _settimeNum = setTimeout(() => {
            tt();
        }, 0);
      } else {
        clearTimeout(_settimeNum); 
      }
    };
    tt();
  },
  // 返回某个指定某个元素的原始属性
  // selector 表示元素的选择器
  getElementOriginalAttributes(selector) {
    return this.elementOriginalAttributes[selector];
  },
  // 设置指定某个元素的原始属性
  setElementOriginalAttributes(selector) {
    if (!selector) return;
    const $element = _.querySelector(selector);
    if ($element) {
      // 保留元素的原始样式
      if (!this.elementOriginalAttributes[selector]) {
        const elementInfo = _.getElementInfo($element);
        this.elementOriginalAttributes[selector] = {
          selector: selector,
          css: elementInfo.css,
          attributes: elementInfo.attributes,
          nodeName: elementInfo.nodeName
        };
        if (typeof elementInfo.innerText !== 'undefined') {
          this.elementOriginalAttributes[selector].innerText = elementInfo.innerText;
        }
      }
    }
  }
};

Util.installEvent(choiceElement);



export default choiceElement;
