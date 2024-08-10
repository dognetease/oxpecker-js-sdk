export default {
    toShortMap: {
        "a:nth-child": "ANC",
        "aside:nth-child": "ASNC",
        "article:nth-child": "ATNC",

        "button:nth-child": "BNC",

        "code:nth-child": "CDNC",
        "canvas:nth-child": "CVNC",

        "div:nth-child": "DVNC",

        "footer:nth-child": "FTNC",
        "form:nth-child": "FMNC",
        "frame:nth-child": "FRNC",

        "header:nth-child": "HDNC",

        "iframe:nth-child": "IFNC",
        "img:nth-child": "IGNC",
        "input:nth-child": "IPNC",
        
        "label:nth-child": "LBNC",

        "li:nth-child": "LINC",

        "nav:nth-child": "NNC",

        "p:nth-child": "PNC",

        "section:nth-child": "SCNC",
        "span:nth-child": "SPNC",

        "table:nth-child": "TBNC",
        "tbody:nth-child": "TYNC",
        "td:nth-child": "TDNC",
        "textarea:nth-child": "TANC",
        "tfoot:nth-child": "TFNC",
        "th:nth-child": "THNC",

        "ul:nth-child": "ULNC",
    },
    toLongMap: {
        "ANC": "a:nth-child",
        "ASNC": "aside:nth-child",
        "ATNC": "article:nth-child",

        "BNC": "button:nth-child",

        "CDNC": "code:nth-child",
        "CVNC": "canvas:nth-child",

        "DVNC": "div:nth-child",

        "FTNC": "footer:nth-child",
        "FMNC": "form:nth-child",
        "FRNC": "frame:nth-child",

        "HDNC": "header:nth-child",

        "IFNC": "iframe:nth-child",
        "IGNC": "img:nth-child",
        "IPNC": "input:nth-child",
        
        "LBNC": "label:nth-child",

        "LINC": "li:nth-child",

        "NNC": "nav:nth-child",

        "PNC": "p:nth-child",

        "SCNC": "section:nth-child",
        "SPNC": "span:nth-child",

        "TBNC": "table:nth-child",
        "TYNC": "tbody:nth-child",
        "TDNC": "td:nth-child",
        "TANC": "textarea:nth-child",
        "TFNC": "tfoot:nth-child",
        "THNC": "th:nth-child",

        "ULNC": "ul:nth-child",
    },
    toShortFunc: function(pathStr) {
        for( let key in this.toShortMap) {
            var re = new RegExp(key, 'g');
            pathStr = pathStr.replace(re, this.toShortMap[key]);
        }
        return pathStr;
    },
    toLongFunc: function(pathStr) {
        for( let key in this.toLongMap) {
            var re = new RegExp(key, 'g');
            pathStr = pathStr.replace(re, this.toLongMap[key]);
        }
        return pathStr;
    }
}