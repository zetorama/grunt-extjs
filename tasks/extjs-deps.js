'use strict';


module.exports = function(grunt) {
  var fs = require('fs');
  var path = require('path');

  // Get an asset file, local to the root of the project.
  var asset = path.join.bind(null, __dirname, '..');

  grunt.registerMultiTask('extjs-deps', 'Gather ExtJS dependencies into filelist.', function() {
    var options = this.options({
      timeout: 5000,
      cwd: process.cwd(),
      appRoot: '',
      extDir: '',
      extFile: 'ext-debug.js',
      injectEnv: asset('lib/inject/env.js'),
      injectFooter: asset('lib/inject/footer.js'),
      compileDeps: function(files) {
        var cfg = ['extjs', this.target, 'deps'].join('.');
        grunt.config.set(cfg, files);
        grunt.verbose.ok('ExtJS dependencies are stored in "%s" variable.', cfg);
      }.bind(this)
    });

    var done = this.async();

    var extjs = path.join(options.cwd, 'ext-' + Math.floor(Math.random() * 1000000) + '.js');
    var extDir = path.join(options.cwd, options.extDir, 'src');
    var extFile = path.join(options.extDir, options.extFile);

    // console.info(extjs, extFile);
    var extra = '\n;Ext.Loader.setPath("Ext", "' + extDir.replace(/\\/g, '\\\\') + '");\n';
    grunt.file.copy(extFile, extjs);
    fs.appendFileSync(extjs, extra + grunt.file.read(options.injectFooter));

    var scripts = [options.injectEnv, extjs].concat(this.filesSrc);
    var spawnOpts = {
      grunt: false,
      cmd: process.argv[0],
      args: [asset('lib/deps-script.js')].concat(options.appRoot, scripts),
      opts: {
        cwd: options.cwd,
        env: process.env
      }
    };

    // console.info(spawnOpts.args);
    grunt.verbose.subhead('Spawning ExtJS App.');
    var child = grunt.util.spawn(spawnOpts, function(error, result, code) {
      var files, failed;
      grunt.verbose.ok('Spawning done. Processing result.');
      grunt.file.delete(extjs);

      if (!error) {
        files = JSON.parse(result.stdout);
        failed = Object.keys(files.failed);

        grunt.verbose.writeln('Console output:\n', files.console.join('\n').cyan);

        if (failed.length) {
          grunt.log.error('%s ' +
                          grunt.util.pluralize(failed.length, 'Class has/Classes have') +
                          ' not been created, so did not hit dependency list:', failed.length);
          failed.forEach(function(cls) {
            grunt.log.error('-\t%s : ' + '%s'.cyan, cls, files.failed[cls]);
          });
        }

        grunt.verbose.writeln('Compiling dependencies through options.compileDeps().');
        options.compileDeps(files);

        grunt.verbose.ok('Dependencies catched in total:');
        grunt.verbose.ok('classes - %s', files.classes.length);
        grunt.verbose.ok('scripts - %s', files.scripts.length);
        grunt.verbose.ok('xhr     - %s', files.xhr.length);

        grunt.log.notverbose.ok('%s ExtJS Classes gathered.', files.classes.length);
      } else {
        grunt.fail.warn('Spawned ExtJS App has failed with code ' + code + '.');
      }

      done();
    });

    child.stderr.on('data', function(data) {
      grunt.verbose.errorlns(String(data));
    });

    setTimeout(function() {
      child.kill();
      grunt.fail.warn('Spawned ExtJS App is killed by timeout.');
      grunt.file.delete(extjs);
    }, options.timeout);

  });

};
