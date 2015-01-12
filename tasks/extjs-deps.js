'use strict';

var finishJob = function(grunt, options, files) {
  var num;

  grunt.verbose.writeln('Console log output:\n', files.console.join('\n').cyan);

  var failed = Object.keys(files.failed);
  num = failed.length;
  if (num) {
    grunt.log.error('%s %s not been created, so did not hit dependency list:',
                    num,
                    grunt.util.pluralize(num, 'Class has/Classes have'));
    failed.forEach(function(cls) {
      grunt.log.error('-\t%s : ' + '%s'.cyan, cls, files.failed[cls]);
    });
  }

  num = files.missed.length;
  if (num) {
    grunt.log.error('%s %s requested, but %s exist:',
                    num,
                    grunt.util.pluralize(num, 'file was/files were'),
                    grunt.util.pluralize(num, 'does not/don\'t'));
    files.missed.forEach(function(file) {
      grunt.log.error('-\t%s'.cyan, file);
    });
  }

  grunt.verbose.writeln('Compiling dependencies through options.compileDeps().');
  options.compileDeps(files);

  grunt.verbose.ok('Dependencies catched in total:');
  grunt.verbose.ok('classes - %s', files.classes.length);
  grunt.verbose.ok('scripts - %s', files.scripts.length);
  grunt.verbose.ok('xhr     - %s', files.xhr.length);

  grunt.log.notverbose.ok('%s ExtJS Classes gathered.', files.classes.length);
};


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
        grunt.log.ok('ExtJS dependencies are stored in "%s" variable.', cfg);
      }.bind(this)
    });

    var done = this.async();
    var tid;

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
      var files;
      clearTimeout(tid);
      grunt.verbose.ok('Spawning done. Processing result.');
      grunt.file.delete(extjs);

      if (!error) {
        grunt.log.debug(result.stdout);
        try {
          files = JSON.parse(result.stdout);
          finishJob(grunt, options, files);
        } catch (err) {
          grunt.fail.warn('Can not parse result from spawned ExtJS App. ' + err.message);
        }

      } else {
        grunt.fail.warn('Spawned ExtJS App has failed with code ' + code + '.');
      }

      done();
    });

    child.stderr.on('data', function(data) {
      grunt.verbose.error(String(data));
    });

    tid = setTimeout(function() {
      child.kill();
      grunt.fail.warn('Spawned ExtJS App is killed by timeout.');
      grunt.file.delete(extjs);
    }, options.timeout);

  });

};
