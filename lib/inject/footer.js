/* global Ext:true, extRequire:true */
// Ext.EventManager.un = function() {};

// Override Ext.Loader
Ext.Loader.syncModeEnabled = true;
Ext.Loader.loadScriptFile = function(url, onLoad, onError, scope, synchronous) {
  if (this.isFileLoaded[url]) {
    return this;
  }

  this.isLoading = true;

  // console.info('>>> loadScriptFile', url);

  // var file = url.replace(/^\//, '').replace(/\//g, path.sep);
  // require(path.resolve(appFolder, file));
  extRequire({
    url: url,
    ext: true
  });
  onLoad.call(scope);
};
Ext.Loader.injectScriptElement = function(url, onLoad, onError, scope, charset) {
  // console.info('>>> injectScriptElement', url);

  extRequire({
    url: url,
    script: true
  });
  onLoad.call(scope);
};

// Fix Ext.Msg, as it might brake the flow
Ext.ClassManager.onCreated(function() {
  Ext.Msg.show = function(opts) {
    console.info('Ext.Msg: ' + opts.title);
  };
}, null, 'Ext.window.MessageBox');

global.Ext = module.exports = Ext;
