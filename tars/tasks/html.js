'use strict';

const gulp = require('gulp');
const gulpif = require('gulp-if');
const handlebars = require('gulp-compile-handlebars');
const htmlmin = require('gulp-htmlmin');
const helpers = require('../helpers/handlebars-helpers');
const readComponentsData = require('../helpers/components-data');
const { isRelease, paths, guard, dest, server } = require('../tars');

module.exports = function html() {
    return gulp
        .src(paths.pages)
        .pipe(guard())
        .pipe(handlebars(readComponentsData(), { batch: [paths.components], helpers }))
        .pipe(gulpif(isRelease, htmlmin({ collapseWhitespace: true, conservativeCollapse: true })))
        .pipe(gulp.dest(dest))
        .on('end', () => server.reload());
};
