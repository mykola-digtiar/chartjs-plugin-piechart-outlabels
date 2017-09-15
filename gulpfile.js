'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var file = require('gulp-file');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var zip = require('gulp-zip');
var merge = require('merge2');
var path = require('path');
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var {exec} = require('mz/child_process');
var pkg = require('./package.json');

var argv = require('yargs')
	.option('output', {alias: 'o', default: 'dist'})
	.option('sample-dir', {default: 'sample'})
	.option('docs-dir', {default: 'docs'})
	.option('www-dir', {default: 'www'})
	.argv;

function watch(glob, task) {
	gutil.log('Waiting for changes...');
	return gulp.watch(glob, function(e) {
		gutil.log('Changes detected for', path.relative('.', e.path), '(' + e.type + ')');
		var r = task();
		gutil.log('Waiting for changes...');
		return r;
	});
}

gulp.task('default', ['build']);

gulp.task('build', function() {
	var out = argv.output;
	var task = function() {
		return rollup('rollup.config.js')
			.pipe(source(pkg.name + '.js'))
			.pipe(gulp.dest(out))
			.pipe(rename(pkg.name + '.min.js'))
			.pipe(streamify(uglify({preserveComments: 'license'})))
			.pipe(gulp.dest(out));
	};

	var tasks = [task()];
	if (argv.watch) {
		tasks.push(watch('src/**/*.js', task));
	}

	return tasks;
});

gulp.task('lint', function() {
	var files = [
		'sample/**/*.js',
		'src/**/*.js',
		'*.js'
	];

	return gulp.src(files)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('docs', function(done) {
	var script = require.resolve('gitbook-cli/bin/gitbook.js');
	var out = path.join(argv.output, argv.docsDir);
	var cmd = 'node';

	exec([cmd, script, 'install', './'].join(' ')).then(() => {
		return exec([cmd, script, 'build', './', out].join(' '));
	}).then(() => {
		done();
	}).catch((err) => {
		done(new Error(err.stdout || err));
	});
});

gulp.task('sample', function() {
	// since we moved the dist files one folder up (package root), we need to rewrite
	// sample src="../dist/ to src="../ and then copy them in the /sample directory.
	var out = path.join(argv.output, argv.sampleDir);
	return gulp.src('sample/**/*', {base: 'sample'})
		.pipe(streamify(replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1', {skipBinary: true})))
		.pipe(gulp.dest(out));
});

gulp.task('package', ['build', 'sample'], function() {
	var out = argv.output;
	return merge(
		gulp.src(path.join(out, argv.sampleDir, '**/*'), {base: out}),
		gulp.src([path.join(out, '*.js'), 'LICENSE'])
	)
	.pipe(zip(pkg.name + '.zip'))
	.pipe(gulp.dest(out));
});

gulp.task('netlify', ['build', 'sample', 'docs'], function() {
	var root = argv.output;
	var out = path.join(root, argv.wwwDir);

	return merge(
		gulp.src(path.join(root, argv.docsDir, '**/*'), {base: path.join(root, argv.docsDir)}),
		gulp.src(path.join(root, argv.sampleDir, '**/*'), {base: root}),
		gulp.src(path.join(root, '*.js'))
	)
	.pipe(streamify(replace(/https?:\/\/chartjs-plugin-piechart-outlabels\.netlify\.com\/?/g, '/', {skipBinary: true})))
	.pipe(gulp.dest(out));
});

gulp.task('bower', function() {
	var json = JSON.stringify({
		name: pkg.name,
		description: pkg.description,
		homepage: pkg.homepage,
		license: pkg.license,
		version: pkg.version,
		main: argv.output + '/' + pkg.name + '.js'
	}, null, 2);

	return file('bower.json', json, {src: true})
		.pipe(gulp.dest('./'));
});
