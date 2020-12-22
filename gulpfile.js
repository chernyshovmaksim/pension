const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');

const del = require('del');
const bs = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concatCss = require('gulp-concat-css');
const csso = require('gulp-csso');
const image = require('gulp-image');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');

function clean(cb) {
    return del(['./build/**', '!./build']);
    cb();
}

function server(cb) {
    return bs.init({
        server: {
            baseDir: './build'
        },
        // tunnel: 'gulp-boilerplate'
    });
    cb();
}

function sassToCss(cb) {
    return src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false,
        }))
        .pipe(dest('./src/css'));
    cb();
}

function copyCss(cb) {
    return src([
        './src/css/*.css'
    ])
        .pipe(concatCss('main.css'))
        .pipe(csso())
        .pipe(dest('./build/css'));
    cb();
}

function copyHtml(cb) {
    return src('./src/*.html')
        .pipe(dest('build'));
    cb();
}

function copyImages(cb) {
    return src('./src/img/**/*')
        .pipe(image())
        .pipe(dest('./build/img/'));
    cb();
}

function javascript(cb) {
    return src([
        './src/js/main.js'
    ])
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(dest('./build/js/'));
    cb();
}



//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////




function watcher(cb) {
    watch('./src/js/**/*', javascript);
    watch('./src/sass/**/*', sassToCss);
    watch('./src/css/*', copyCss);
    watch('./src/img/**/*', copyImages);
    watch('./src/*.html', copyHtml);
    watch('./build/**/*').on('change', bs.reload);
    cb();
}


exports.default = series(
    clean,
    sassToCss,
    copyCss,
    javascript,
    copyHtml,
    copyImages
);

exports.dev = series(
    clean,
    sassToCss,
    copyCss,
    javascript,
    copyHtml,
    copyImages,
    parallel(
        server,
        watcher
    )
);