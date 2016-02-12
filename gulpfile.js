'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpif = require('gulp-if-else'),
    replace = require('gulp-replace'),
    googleAnalytics = require('gulp-ga'),
    ghPages = require('gulp-gh-pages'),
    wiredep = require('wiredep').stream,
    useref = require('gulp-useref'),
    bower = require('gulp-bower'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    del = require('del'),
    reload = browserSync.reload,
    config = {
        paths: {
            app  : 'src',
            build: 'dist'
        }
    };

// Images
gulp.task('images:clean', function (next) {
    del(config.paths.build + '/img/**', next);
});
gulp.task('images', ['images:clean'], function () {
    return gulp.src(config.paths.app + '/img/**/*')
        .pipe(gulp.dest(config.paths.build + '/img'));
});

// Data
gulp.task('data:clean', function (next) {
    del(config.paths.build + '/data/**', next);
});
gulp.task('data', ['data:clean'], function () {
    return gulp.src(config.paths.app + '/data/**/*')
        .pipe(gulp.dest(config.paths.build + '/data'));
});

gulp.task('wiredep', function () {
    return gulp.src('src/index.html')
        .pipe(wiredep())
        .pipe(gulp.dest('src'));
});

// HTML
gulp.task('html:clean', function (next) {
    del(config.paths.build + '/**/*.html', next);
});

gulp.task('html', ['html:clean'], function () {
    return gulp.src(config.paths.app + '/**/*.html')
        .pipe(useref({ searchPath: ['.', 'src'] }))
        .pipe(gulpif(gutil.env.env === 'production',
            function () {
                if (process.env.GA_TRACKING_ID) {
                    return googleAnalytics({
                        url: 'labs.atsid.com/nibrs-rfi',
                        uid: process.env.GA_TRACKING_ID,
                        tag: 'body'
                    });
                }
                else {
                    gutil.log(gutil.colors.red('You need to set GA_TRACKING_ID environment variable!'));
                    gutil.beep();
                    return gutil.noop();
                }
            }
        ))
        .pipe(gulp.dest(config.paths.build));
});

// Developing
gulp.task('serve', function () {

    browserSync({
        notify: false,
        online: true,
        port  : 9000,
        server: {
            baseDir: ['src'],
            routes : {
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch([
        'src/*.html',
        'src/js/**/*.js',
        'src/img/**/*'
    ]).on('change', reload);

    gulp.watch('src/css/**/*.css');
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('serve:dist', ['build'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

// Deploy
gulp.task('deploy', ['build'], function () {
    return gulp.src(config.paths.build + '/**/*')
        .pipe(ghPages());
});

gulp.task('build', ['data', 'images', 'html']);
gulp.task('default', ['build']);
