'use strict';

const gulp = require('gulp');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const { config, isRelease, paths, guard, dest, server } = require('../tars');

const useSourcemaps = config.sourcemaps && !isRelease;

module.exports = function js() {
    return gulp
        .src(paths.scripts)
        .pipe(guard())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(gulpif(useSourcemaps, sourcemaps.init()))
        .pipe(concat('main.js'))
        .pipe(gulpif(isRelease, terser()))
        .pipe(gulpif(useSourcemaps, sourcemaps.write()))
        .pipe(gulp.dest(`${dest}static/js`))
        .pipe(server.stream());
};
