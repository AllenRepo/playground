/// <binding Clean='clean' />

var gulp = require("gulp"),
  rimraf = require('rimraf'),
  wiredep = require('wiredep').stream,
  merge2 = require('merge2'),
  argv = require('yargs').argv,
  browserSync = require('browser-sync');
  $ = require('gulp-load-plugins')();

var config = require("./source.js")(),
  traceurOption = require("./traceur.config.js")();

//gulp-tasklisting : lists configured tasks
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

//rimraf : remove files
gulp.task('clean', function(cb) {
  $.util.log('*** clean started');
  switch(argv.mode) {
    case 'es6':
      rimraf(config.paths.es6out, cb);
      break;
    case 'ts':
      rimraf(config.paths.tsout, cb);
      break;
    case 'less':
      rimraf(config.paths.cssmin, cb);
      rimraf(config.paths.lessout, cb);
      break;
    case 'img':
      rimraf(config.paths.imgmin, cb);
      break;
  }
});

gulp.task('transpile', ['clean'], function() {
  $.util.log('*** transpile started');
  switch(argv.mode) {
    case 'es6':
      return es6Transpile();
    case 'ts':
      return tsTranspile();
  }
});

//gulp-traceur : convert es6 to js
//gulp-sourcemaps : pipe source maps
function es6Transpile(){
  $.util.log('*** es6 transpile started');
  return gulp.src(config.files.es6)
    .pipe($.sourcemaps.init())
    .pipe($.traceur(traceurOption))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.es6out));
}

//gulp-typescript : convert ts to js
//gulp-sourcemaps : pipe source maps
//merge2 : sync multiple IO streams
function tsTranspile() {
  $.util.log('*** ts transpile started');
  var tsConfig = $.typescript.createProject('./tsconfig.json');
  var tsStream = gulp.src([config.files.ts])
    .pipe($.sourcemaps.init())
    .pipe($.typescript(tsConfig));

  return merge2([
    tsStream.dts.pipe(gulp.dest(config.paths.tsout)),
    tsStream.js.pipe(gulp.dest(config.paths.tsout)),
    tsStream.pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest(config.paths.tsout))
  ]);
}

//gulp-jshint : code analysis
//gulp-jscs : code styling
gulp.task('analyze', function() {
  $.util.log('*** analyze started');
  return gulp.src([config.files.es6, config.files.es6out])
    .pipe($.jshint('./.jshintrc'))
    .pipe($.jshint.reporter('default', { verbose: true }))
    .pipe($.jscs({ configPath: './.jscsrc' }));
});

//wiredep : inject bower references
//gulp-inject : inject file references
gulp.task('reference', function(){
  $.util.log('*** reference started');
  return gulp.src(config.files.mainhtml)
    .pipe(wiredep())
    .pipe($.inject(gulp.src([
        config.files.es6out, 
        config.files.tsout, 
        config.paths.templatecache + '*.js']
      , { read: false })
      , { starttag: '<!-- inject:custom:js -->'
    }))
    .pipe($.inject(gulp.src([config.files.css], {read:false}), {
      starttag: '<!-- inject:custom:css -->'
    }))
    .pipe(gulp.dest(config.paths.app));
});

//gulp-useref : parse comments similar to gulp-inject
//              take all js and combine to one file
//gulp-plumber : hides gulp errors and continue execution
gulp.task('useref', function(){
  $.util.log('*** useref started');

  var assets = $.useref.assets({searchPath: './'});

  return gulp.src(config.files.mainhtml)
    .pipe($.plumber())
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(config.paths.dist));
});

//gulp-minify-html : minify html
//gulp-angular-templatecache : converts html to angular template cache
gulp.task('templatecache', function(){
  $.util.log('*** templatecache started');
  var options = {
    module: 'app.templates',
    standAlone: true,
    root: 'app/'
  };
  return gulp.src(config.files.template)
    .pipe($.minifyHtml({ empty:true }))
    .pipe($.angularTemplatecache('templates.js', options))
    .pipe(gulp.dest(config.paths.templatecache));
});

//gulp-less : compile less to css
//gulp-sourcemaps : pipe source maps
//gulp-rename : rename output file
gulp.task('less', function() {
  $.util.log('*** less started');
  return gulp.src(config.files.less)
    .pipe($.sourcemaps.init())
    .pipe($.less())
    //.pipe($.less({compress:true}))
    .pipe($.autoprefixer())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.lessout));
});

//gulp-gulify : minify js
//gulp-sourcemaps : pipe source maps
gulp.task('jsmin', function(){
  $.util.log('*** jsmin started');
  return gulp.src([config.files.tsout, config.files.es6out])
    .pipe($.sourcemaps.init())
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.jsmin));
});

//gulp-minify-css : minify css
//gulp-sourcemaps : pipe source maps
gulp.task('cssmin', function() {
  $.util.log('*** cssmin started');
  return gulp.src([config.files.lessout])
    .pipe($.sourcemaps.init())
    .pipe($.minifyCss({compatibility: 'ie8'}))
    .pipe($.rename('less.min.css'))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.cssmin));
});

//gulp-imagemin : minify img
gulp.task('imgmin', function() {
  $.util.log('*** imgmin started');
  return gulp.src(config.files.img)
    .pipe($.imagemin({optimizationLevel: 3, interlaced: true}))
    .pipe(gulp.dest(config.paths.imgmin));
});

//gulp-minify-html : minify html
gulp.task('htmlmin', function() {
  $.util.log('*** htmlmin started');
  var options = {
    empty: true
  };
  return gulp.src(config.files.template)
    .pipe($.minifyHtml(options))
    .pipe(gulp.dest(config.paths.templatemin));
});

//gulp-filter : filter stream to other files
//gulp-rev : append hash to filenames
//gulp-rev-replace : rewrite filename
gulp.task('optimize', function() {
  $.util.log('*** optimize started');

  var assets = $.useref.assets({searchPath: './'});
  var cssFilter = $.filter('**/*.css', {restore:true});
  var jsFilter = $.filter('**/*.js', {restore:true});

  return gulp
      .src(config.files.mainhtml)
      .pipe($.plumber())
      .pipe(assets)
       .pipe(cssFilter)
       .pipe($.minifyCss({compatibility: 'ie8'}))
       .pipe(cssFilter.restore)
      .pipe(jsFilter)
      .pipe($.uglify())
      .pipe(jsFilter.restore)
      .pipe($.rev())
       .pipe(assets.restore())
       .pipe($.useref())
      .pipe($.revReplace())
      .pipe(gulp.dest(config.paths.dist))
      .pipe($.rev.manifest())
      .pipe(gulp.dest(config.paths.dist));
});

//gulp-nodemon : watch file changes (server)
gulp.task('serve-dev', function() {
  $.util.log('*** serve-dev started');
  serve(true);
});

function serve(isDev, specRunner){
  var options = {
    script: config.node.main,
    delayTime: 1,
    env: {
      'PORT': config.node.port,
      // 'NODE_ENV' : isDev ? 'dev' : 'build'
      'NODE_ENV' : 'dev'
    },
    watch: [config.node.server]
  };

  return $.nodemon(options)
    .on('restart', function(ev){
      $.util.log('*** server restarted');
      $.util.log('files changed:\n' + ev);
      setTimeout(function() {
        browserSync.notify('reloading');
        browserSync.reload({stream:false});
      }, config.other.browserReloadDelay)
    })
    .on('start', function(){
      $.util.log('*** server started');
      startBrowserSync(isDev, specRunner);
    })
    .on('crash', function(){
      $.util.log('*** server crashed');
    })
    .on('exit', function(){
      $.util.log('*** server exit');
    })
}

//browser-sync : sync browsers
function startBrowserSync(isDev, specRunner) {
  if (browserSync.active) return;
  $.util.log('*** browser-sync started');

  if (isDev) {
        gulp.watch([config.files.less], ['less'])
            .on('change', changeEvent);
    } else {
        gulp.watch([config.files.less, config.files.ts, config.files.mainhtml], ['optimize', browserSync.reload])
            .on('change', changeEvent);
    }

  var options = {
    proxy: 'localhost:' + config.node.port,
    port: 8001,
    files: [
      config.paths.app + '**/*.*',
      '!' + config.files.ts,
      '!' + config.files.es6,
      config.files.css
    ],
    ghostMode: {
      clicks:true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 1000
  }

  if (specRunner) {
        options.startPath = config.tests.specRunner;
        options.files = options.files.concat(config.tests.files);
  }

  browserSync(options);
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    $.util.log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

gulp.task('autotest', function(done) {
    startTests(false /* singleRun */, done);
});

gulp.task('test', function(done) {
    startTests(true /* singleRun */, done);
});

gulp.task('serve-specs', ['build-specs'], function(done){
  $.util.log('serve-specs started');
  serve(true /*isDev*/, true /*specRunner*/);
  done();
});

gulp.task('build-specs', function() {
  $.util.log('build-specs started');
  var wiredep = require('wiredep').stream;

  return gulp.src(config.tests.specRunner)
    .pipe(wiredep())
    .pipe($.inject(gulp.src(config.tests.testlibraries),
      {name: 'inject:testlibraries', read: false}))
    .pipe($.inject(gulp.src(config.tests.files),
      {name: 'inject:specs', read:false}))
    .pipe(gulp.dest(config.paths.app));
});

function startTests(singleRun, done) {
    var child;
    var fork = require('child_process').fork;
    var karma = require('karma').Server;
    var excludeFiles = [];
    var serverSpecs = config.tests.serverIntegrationSpecs;

    if (argv.startServers) { // gulp test --startServers
        $.util.log('Starting server');
        var savedEnv = process.env;
        savedEnv.NODE_ENV = 'dev';
        savedEnv.PORT = 8888;
        child = fork(config.node.main);
    } else {
        if (serverSpecs && serverSpecs.length) {
            excludeFiles = serverSpecs;
        }
    }

    new karma({
        configFile: __dirname + '/karma.conf.js',
        exclude: excludeFiles,
        singleRun: !!singleRun
    }, karmaCompleted).start();

    // karma.start({
    //     configFile: __dirname + '/karma.conf.js',
    //     exclude: excludeFiles,
    //     singleRun: !!singleRun
    // }, karmaCompleted);

    function karmaCompleted(karmaResult) {
        $.util.log('Karma completed!');
        if (child) {
            $.util.log('Shutting down the child process');
            child.kill();
        }
        if (karmaResult === 1) {
            done('karma: tests failed with code ' + karmaResult);
        } else {
            done();
        }
    }
}


gulp.task("play", function() {
  // $.util.log(config.files.es6 + ' ' + config.paths.es6out);
  var temp = 3;
  temp = 4;
  $.util.log(temp);
});