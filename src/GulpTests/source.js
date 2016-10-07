module.exports = function () {
	var wiredep = require('wiredep');
	var bowerFiles = wiredep({devDependencies: true})['js'];
	var report = './report/';

	var app = './app/',
		content = './content/',
		server = './server/',
		test = './test/'
		dist = './dist/';
	var fileType = {
		js: '**/*.js',
		ts: '**/*.ts',
		css: '**/*.css',
		less: '**/*.less',
		template: '**/*.tpl.html'
	};
	var paths = {
		es6: app + 'es6/',
		es6out: app + 'es6out/',
		ts: app + 'ts/',
		tsout: app + 'tsout/',
		app: app,
		css: content + 'css/',
		less: content + 'less/',
		lessout: content + 'lessout/',
		img: content + 'img/',
		imgmin: content + 'imgmin/',
		jsmin: app + 'jsmin/',
		cssmin: content + 'cssmin/',
		templatemin: app + 'templatemin/',
		templatecache: app + 'templatecache/',
		dist: dist,
		test: test,
		root: './'
	};
	var files = {
		es6: paths.es6 + fileType.js,
		es6out: paths.es6out + fileType.js,
		ts: paths.ts + fileType.ts,
		tsout: paths.tsout + fileType.ts,
		mainhtml: app + 'app.html',
		css: paths.css + fileType.css,
		less: paths.less + fileType.less,
		lessout: paths.lessout + fileType.css,
		img: paths.img + '**/*.{png,PNG,jpg,JPG,gif,GIF,svg,SVG}',
		template: app + fileType.template
	};
	var node = {
		port: '8000',
		server: server,
		main: server + 'app.js'
	};
	var other = {
		browserReloadDelay: 1000
	};
	var tests = {
		files: [].concat(
				'./test/*.spec.js'
			),
		exclue: [],
		coverage: {
            dir: report + 'coverage',
            reporters: [
                {type: 'html', subdir: 'report-html'},
                {type: 'lcov', subdir: 'report-lcov'},
                {type: 'text-summary'}
            ]
        },
        preprocessors: {},
        specHelpers: [],
        serverIntegrationSpecs: [],

        specRunner: app + 'specs.html',
        testlibraries: [
           'node_modules/mocha/mocha.js',
           'node_modules/chai/chai.js',
           'node_modules/mocha-clean/index.js',
           'node_modules/sinon-chai/lib/sinon-chai.js'
        ],
	};
	tests.preprocessors['**/!(*.spec)+(.js)'] = ['coverage'];

	var config = {
		paths: paths,
		files: files,
		node: node,
		other: other,
		tests: tests
	};
	return config;
};