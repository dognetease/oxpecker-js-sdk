(function(document, abtestingLeadCode, dataLayer, root){
  if (!abtestingLeadCode['__SV']) {
    abtestingLeadCode = {
      __SV: 1.0,
      isshowPage: false,
      showPage: function() {
        if (!this.isshowPage) {
          this.isshowPage = true;
          var styleNode = document.getElementById('_hb_abtesting_page_hides');
          if (styleNode) {
            styleNode.parentNode.removeChild(styleNode);
          }
        }
      },
      hidePage: function() {
        var styleNode = document.createElement('style');
        var style = 'body{opacity:0 !important;}';
        var head = document.getElementsByTagName('head')[0];
        styleNode.setAttribute('id', '_hb_abtesting_page_hides');
        styleNode.setAttribute('type', 'text/css');
        if (styleNode.styleSheet) {
          styleNode.styleSheet.cssText = style;
        } else {
          styleNode.appendChild(document.createTextNode(style));
        }
        head.appendChild(styleNode);
      },
      transition: function() {
        var styleNode = document.createElement('style');
        var style = '*{transition: opacity .3s linear; -moz-transition: opacity .3s linear; -webkit-transition: opacity .3s linear; -o-transition: opacity .3s linear;}';
        var head = document.getElementsByTagName('head')[0];
        styleNode.setAttribute('id', '_hb_abtesting_transition_hides');
        styleNode.setAttribute('type', 'text/css');
        if (styleNode.styleSheet) {
          styleNode.styleSheet.cssText = style;
        } else {
          styleNode.appendChild(document.createTextNode(style));
        }
        head.appendChild(styleNode);
      },
      getShowPage: function() {
        return this.isshowPage;
      },
      getDataLayer: function() {
        if (typeof dataLayer === 'number') {
          return dataLayer;
        }
        return 4000;
      },
      init: function() {
        var settings_timer = setTimeout('DATrackerABTestingLeadCode.showPage()', this.getDataLayer());
        this.hidePage();
        this.transition();
        return settings_timer;
      }
    };
    window['DATrackerABTestingLeadCode'] = abtestingLeadCode;
  }
})(document, window['DATrackerABTestingLeadCode'] || {}, 4000, window);
DATrackerABTestingLeadCode.init();