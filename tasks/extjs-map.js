'use strict';

var toCamelCase = function(name) {
  // convert to CamelCase instead of camel-case
  return name.split('-').map(function(part) {
    return part[0].toUpperCase() + part.substring(1);
  }).join('');
};

var prefixPath = function(prefix, path) {
  return prefix ? [prefix.replace(/\/$/, ''), path].join('/') : path;
};

module.exports = function(grunt) {
  var path = require('path');

  grunt.registerMultiTask('extjs-map', 'Generate ExtJS paths for components.', function() {
    var options = this.options();

    var rootPath = options.rootPath;
    var normalizePath = options.normalizePath;
    var normalizeNs = options.normalizeNs || toCamelCase;
    var compileMap = options.compileMap || function(map) {
      var cfg = ['extjs', this.target, 'map'].join('.');
      grunt.config.set(cfg, map);
      grunt.log.ok('ExtJS Paths are stored in "%s" variable.', cfg);
    }.bind(this);

    this.files.forEach(function(file) {
      var counter = 0;
      // Gather map
      var map = file.src.reduce(function(map, src) {
        var name = path.basename(grunt.file.isDir(src) ? src : path.dirname(src));
        var ns = normalizeNs(name, src);
        var root = typeof rootPath === 'function' ? rootPath(name, src, ns) : rootPath;

        if (ns) {
          map[ns] = normalizePath ? normalizePath(name, src, root, ns) : prefixPath(root, src);

          counter++;
          grunt.verbose.writeln('ExtJS Path added as %s : %s.', ns, map[ns]);
        }

        return map;
      }, {});

      // Compile to whatever
      if (typeof compileMap === 'function') {
        map = compileMap(map);
      }

      // Store if necessary
      if (map && file.dest) {
        grunt.file.write(file.dest, map);
        grunt.log.ok('%s ExtJS Paths stored in %s.', counter, file.dest);
      } else {
        grunt.log.ok('%s ExtJS Paths compiled.', counter);
      }
    });

  });

};
