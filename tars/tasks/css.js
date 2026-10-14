'use strict';

const gulp = require('gulp');
const gulpif = require('gulp-if');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const { config, isBuild, paths, guard, dest, server } = require('../tars');

const useSourcemaps = config.sourcemaps && !isBuild;

module.exports = function css() {
    return gulp
        .src(paths.styles)
        .pipe(guard())
        .pipe(gulpif(useSourcemaps, sourcemaps.init()))
        .pipe(sass({ includePaths: ['markup'] }))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulpif(useSourcemaps, sourcemaps.write()))
        .pipe(gulp.dest(`${dest}static/css`))
        .pipe(server.stream());
};
