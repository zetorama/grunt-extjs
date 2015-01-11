/* jshint browser: true */
/* global extRequire:true */
var __noop = function() {};
var __el = function(tag) {
  return {
    tagName: tag,
    src: ''
  };
};

global.location = {};

global.navigator = {
  userAgent: 'nodejs',
  platform: 'linux'
};

global.document = {
  getElementsByTagName: function(tag) {
    return [__el(tag)];
  },
  createElement: function(tag) {
    return __el(tag);
  },
  attachEvent: __noop,
  detachEvent: __noop,
  documentElement: {
    style: {}
  }
};

global.DOMParser = function() {
  return {
    parseFromString: function() {
      return document;
    }
  };
};

global.XMLHttpRequest = function() {
  return {
    open: function(method, url, async) {
      this.url = url;
      this.method = method;
      // console.info('>>> XHR %s: %s', method, url);
      extRequire({
        url: url,
        method: method,
        xhr: true
      });

      var xhr = this;
      setTimeout(function() {
        xhr.readyState = 4;
        xhr.status = 500;
        xhr.statusText = 'no data';
        if (typeof xhr.onreadystatechange === 'function') {
          xhr.onreadystatechange();
        }
      }, 1);
      return {};
    },
    send: function(data) {
      return true;
    },
    getAllResponseHeaders: function() {
      return '';
    }
  };
};

global.ActiveXObject = XMLHttpRequest;

global.window = {
  document: document,
  navigator: navigator,
  location: location,
  DOMParser: DOMParser,
  XMLHttpRequest: XMLHttpRequest,
  ActiveXObject: XMLHttpRequest,
  attachEvent: __noop,
  detachEvent: __noop,
  addEventListener: __noop,
  removeEventListener: __noop
};

global.top = window;
