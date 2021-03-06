/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 14 14:15
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/dom/hashchange
*/

KISSY.add("event/dom/hashchange", ["event/dom/base", "dom", "ua"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var Dom = require("dom");
  var UA = require("ua"), urlWithoutHash, Special = DomEvent.Special, win = S.Env.host, doc = win.document, REPLACE_HISTORY = "__ks_replace_history__", ie = UA.ieMode, HASH_CHANGE = "hashchange";
  DomEvent.REPLACE_HISTORY = REPLACE_HISTORY;
  function getIframeDoc(iframe) {
    return iframe.contentWindow.document
  }
  var POLL_INTERVAL = 50, IFRAME_TEMPLATE = "<html><head><title>" + (doc && doc.title || "") + " - {hash}</title>{head}</head><body>{hash}</body></html>", getHash = function() {
    var m = location.href.match(/#.+$/);
    return m && m[0] || "#"
  }, timer, lastHash, poll = function() {
    var hash = getHash(), replaceHistory = 0;
    if(hash.indexOf(REPLACE_HISTORY) !== -1) {
      replaceHistory = 1;
      hash = hash.replace(REPLACE_HISTORY, "");
      location.hash = hash
    }
    if(hash !== lastHash) {
      hashChange(hash, replaceHistory)
    }
    timer = setTimeout(poll, POLL_INTERVAL)
  }, hashChange = ie && ie < 8 ? function(hash, replaceHistory) {
    var html = S.substitute(IFRAME_TEMPLATE, {hash:S.escapeHtml(hash), head:Dom.isCustomDomain() ? "<script>" + "document." + 'domain = "' + doc.domain + '";<\/script>' : ""}), iframeDoc = getIframeDoc(iframe);
    try {
      if(replaceHistory) {
        iframeDoc.open("text/html", "replace")
      }else {
        iframeDoc.open()
      }
      iframeDoc.write(html);
      iframeDoc.close()
    }catch(e) {
    }
  } : function() {
    notifyHashChange()
  }, notifyHashChange = function() {
    DomEvent.fireHandler(win, HASH_CHANGE, {newURL:location.href, oldURL:urlWithoutHash + lastHash});
    lastHash = getHash()
  }, setup = function() {
    if(!timer) {
      poll()
    }
  }, tearDown = function() {
    if(timer) {
      clearTimeout(timer)
    }
    timer = 0
  }, iframe;
  if(ie && ie < 8) {
    setup = function() {
      if(!iframe) {
        var iframeSrc = Dom.getEmptyIframeSrc();
        iframe = Dom.create("<iframe " + (iframeSrc ? 'src="' + iframeSrc + '"' : "") + ' style="display: none" ' + 'height="0" ' + 'width="0" ' + 'tabindex="-1" ' + 'title="empty"/>');
        Dom.prepend(iframe, doc.documentElement);
        DomEvent.add(iframe, "load", function() {
          DomEvent.remove(iframe, "load");
          hashChange(getHash());
          DomEvent.add(iframe, "load", onIframeLoad);
          poll()
        });
        doc.attachEvent("propertychange", function(e) {
          e = e || window.event;
          try {
            if(e.propertyName === "title") {
              getIframeDoc(iframe).title = doc.title + " - " + getHash()
            }
          }catch(e) {
          }
        });
        var onIframeLoad = function() {
          location.hash = S.trim(getIframeDoc(iframe).body.innerText);
          notifyHashChange()
        }
      }
    };
    tearDown = function() {
      if(timer) {
        clearTimeout(timer)
      }
      timer = 0;
      DomEvent.detach(iframe);
      Dom.remove(iframe);
      iframe = 0
    }
  }
  Special[HASH_CHANGE] = {setup:function() {
    if(this !== win) {
      return
    }
    lastHash = getHash();
    urlWithoutHash = location.href.replace(/#.+/, "");
    setup()
  }, tearDown:function() {
    if(this !== win) {
      return
    }
    tearDown()
  }}
});

