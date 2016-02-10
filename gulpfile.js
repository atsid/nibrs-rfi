'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if-else');
var replace = require('gulp-replace');
var googleAnalytics = require('gulp-ga');
var ghPages = require('gulp-gh-pages');
var wiredep = require('wiredep').stream;
var bower = require('gulp-bower');
var watch = require('gulp-watch');
var browserSync = require('browser-sync');
var del = require('del');

var reload = browserSync.reload;

var config = {
  paths: {
    app:   'src'
    //build: 'dist'
  }
};

// Images
gulp.task('images:clean', function(next) {
  del(config.paths.build + '/img/**', next);
});
gulp.task('images', ['images:clean'], function() {
  return gulp.src(config.paths.app + '/img/**/*')
    .pipe(gulp.dest(config.paths.build +'/img'));
});

// Styles
gulp.task('styles:clean', function(next) {
  del(config.paths.build + '/css/**', next);
});
gulp.task('styles', ['styles:clean'], function() {
  return gulp.src(config.paths.app + '/css/**/*')
    .pipe(gulp.dest(config.paths.build + '/css'));
});

// Javascript
gulp.task('js:clean', function(next) {
  del(config.paths.build + '/js/**', next);
});
gulp.task('js', ['js:clean'], function() {
  return gulp.src(config.paths.app + '/js/**/*')
    .pipe(gulpif(gutil.env.env === 'production',
      function() {
        // TODO: Data obtained from local CSV.
        
        if( process.env.SOCRATA_APP_TOKEN ) {
          return replace('bjp8KrRvAPtuf809u1UXnI0Z8',process.env.SOCRATA_APP_TOKEN);
        } else {
          gutil.log(gutils.colors.red('You need to set the SOCRATA_APP_TOKEN environment variable!'));
          gutil.beep();
          return gutil.noop();
        }                                                                
      }
    ))
    .pipe(gulp.dest(config.paths.build + '/js'));
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest(config.paths.build + '/bower_components'));
});

gulp.task('wiredep', function() {
  return gulp.src('src/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('src'));
});

// HTML
gulp.task('html:clean', function(next) {
  del(config.paths.build + '/**/*.html', next);
});

gulp.task('html', ['html:clean', 'bower'], function() {
  return gulp.src(config.paths.app + '/**/*.html')
    .pipe(wiredep({ignorePath: '../'+config.paths.build+'/'}))
    .pipe(gulpif(gutil.env.env === 'production', 
      function() {
        if( process.env.GA_TRACKING_ID ) {
          return googleAnalytics({
            url: 'labs.atsid.com/nibrs-rfi',
            uid: process.env.GA_TRACKING_ID,
            tag: 'body'
          });
        } else {
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
        port: 9000,
        server: {
            baseDir: ['src'],
            routes: {
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

// Deploy
gulp.task('deploy', ['build'], function() {
  return gulp.src(config.paths.build + '/**/*')
    .pipe(ghPages());
});

gulp.task('build', ['styles','js','bower','html','images']);
gulp.task('default', ['build']);
