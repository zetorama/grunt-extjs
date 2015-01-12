var path = require('path');
var fs = require('fs');

// process.argv = [
//   'node',
//   __filename,
//   'src/public',
//   'node_modules\\grunt-extjs\\lib\\inject\\env.js',
//   'ext-733641.js',
//   'generated\\ext.deps.js',
//   'src\\public\\scripts\\index.js'
// ];

// Prepare
var cwd = process.cwd();
var appRoot = process.argv[2];
var scripts = Array.prototype.slice.call(process.argv, 3);

var absolute = function(root, file) {
  return path.normalize(path.resolve(root, file));
};

var result = {
  version: 0,
  deps: 0,
  scripts: [],
  classes: [],
  failed: {},
  missed: [],
  xhr: [],
  console: []
};

global.extRequire = function(options) {
  var url = options.url;
  var file;
  // console.info('>>> %s: %s', options.ext && 'EXT' || options.script && 'JS' || options.xhr && 'XHR', url);

  if (options.ext) {
    file = absolute(appRoot, url.replace(/^\//, ''));

    if (fs.existsSync(file)) {
      result.deps++;
      require(file);
    } else {
      result.missed.push(path.relative(cwd, file));
    }

  } else if (options.script) {
    result.scripts.push(url);
  } else if (options.xhr) {
    result.xhr.push(url);
  }
};

// Mute console
console.dir = function() {};
console.log = console.info = function() {
  var msg = Array.prototype.slice.call(arguments).join(', ');
  result.console.push(msg);
};

// Go
scripts.forEach(function(s) {
  var file = absolute(cwd, s);
  // console.info('++ %s', file);
  require(file);
});

// Gather the actual history
var Ext = global.Ext;
if (!Ext) {
  console.error('Ext is undefined.');
  process.exit(666);
}

var getPath = function(cls) {
  var file = Ext.Loader.getPath(cls);
  return path.relative(cwd, absolute(appRoot, file));
};

result.version = Ext.getVersion().version;
result.classes = Ext.Loader.history.map(getPath);

if (result.classes.length !== result.deps) {
  // Some classes hasn't been created, so they didn't hit the classes
  Object.keys(Ext.Loader.classNameToFilePathMap)
    .filter(function(cls) {
      return !~Ext.Loader.history.indexOf(cls);
    })
    .reduce(function(failed, cls) {
      failed[cls] = getPath(cls);
      return failed;
    }, result.failed);
}

// console.info('>>> total: %s, classes: %s', result.deps, result.classes.length);

process.stdout.write(JSON.stringify(result));

// Finish the job, with a delay (see https://github.com/joyent/node/issues/8329)
setTimeout(function() {
  process.exit(0);
}, 250);

module.exports = result;
