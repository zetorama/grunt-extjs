# grunt-extjs v0.1.0
> Generate ExtJS paths & dependencies.


## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-extjs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-extjs');
```

* [ExtJS Deps Task](#extjs-deps-task)
* [ExtJS Map Task](#extjs-map-task)

## ExtJS Deps Task
_Run this task with the `grunt extjs-deps` command._

This task will modify ExtJS core file (with some black magic injections) to be run by Node. Then your ExtJS App will be spawned (i.e. instantiated by Node) to find all of your dependencies by `Ext.Loader`. As a result you will get whole Class files list in the right order. As well as static scripts URIs (requested by `Ext.Loader.loadScript`) and Ajax URIs (requested by `Ext.data.Connection`).

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

Also note that running grunt with the `--verbose` flag will output some extra information. This can be very helpful in seeing actual console logs/errors during processing.


### Options

#### timeout
Type: `Number`  
Default: `5000`

The amount of time (in milliseconds) that grunt will wait for spawned App to be initialized.

#### injectEnv
Type: `String`  
Default: (built-in)

File with browser environment emulation. Used to run ExtJS by Node.

#### injectFooter
Type: `String`  
Default: (built-in)

File with custom ExtJS overrides. Used to run ExtJS by Node & actually catch dependencies.

#### cwd
Type: `String`
Default: `process.cwd()`

Root path for all scripts paths. Results would be relative to this.

#### appRoot
Type: `String`
Default: `""`

Your App root path. Usually, where your `index.html` is located.

#### extDir
Type: `String`  
Default: `""`

ExtJS sources path. Be sure to specify as this package doesn't contain ExtJS sources.

#### extFile
Type: `String`  
Default: `"ext-debug.js"`

ExtJS Core file to be used. Use `"ext-all.js"` if you don't want catch any `Ext.*` Classes.

#### compileDeps
Type: `Function`  
Default: (built-in)

Callback to deal with gathered dependencies. By default it setups `extjs.{target}.deps` option with passed `(files)`, including:
  * `classes` [path]
  * `scripts` [uri]
  * `xhr` [uri]
  * `failed` {class: path}

### Usage examples

```js
// Project configuration.
grunt.initConfig({
  'extjs-deps': {
    options: {
      extDir: 'src/vendor/extjs',
      extFile: 'ext-all.js',
      appRoot: 'src'
    },
    app: {
      src: 'src/app/index.js'
      // would be stored as grunt config variable `extjs.app.deps`
      // so use it in another task 
      // (e.g. to concat files as <%= extjs.app.deps.classes %>)
    }
  }
});
```


## ExtJS Map Task
_Run this task with the `grunt extjs-map` command._

Useful to generate Path map of ExtJS Namespaces. Generated map usually passed to `Ext.Loader.setPath()`.

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

Also note that running grunt with the `--verbose` flag will output some extra information.


### Options

#### normalizeNs
Type: `Function`
Default: (built-in)

Call to normalize namespace, passing `(dirname, filepath)`. By default it converts `my-dir-name_one` to `MyDirName_one`.

#### normalizePath
Type: `Function`
Default: (built-in)

Call to normalize path, passing `(dirname, filepath, rootPath, namespace)`. By default it joins as `rootPath/diname`.

#### rootPath
Type: `String|Function`
Default: ''

Path prefix to be added to each generated path. If a Function, then called each time before path is normalized, passing `(dirname, filepath, namespace)`.

#### compileMap
Type: `Function`  
Default: (built-in)

Callback to deal with gathered map. By default it setups `extjs.{target}.map` option with passed map, like `{"namespace":"path"}`.


### Usage examples

```js
// Project configuration.
grunt.initConfig({
  'extjs-map': {
        options: {
          rootPath: 'lib',
          compileMap: function (map) {
            return 'Ext.Loader.setPath(' + JSON.stringify(map, null, 2) + ');';
          }
        },
        develop: {
          src: 'components/*',
          dest: 'app/ext-paths.js'
        },
        build: {
          src: 'components/*'
          // would be stored as grunt config variable `extjs.build.map`
          // so use it in another task (e.g. to inject into html)
        }
      }
});
```

---

## Release History

 * 2015-01-11   v0.1.0   Work in progress, not yet officially released.



