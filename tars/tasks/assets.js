'use strict';

const gulp = require('gulp');
const { paths, dest, server } = require('../tars');

function staticFiles() {
    return gulp
        .src(paths.static, { base: 'markup' })
        .pipe(gulp.dest(dest))
        .pipe(server.stream());
}

function miscFiles() {
    return gulp.src(paths.misc, { dot: true }).pipe(gulp.dest(dest));
}

module.exports = gulp.parallel(staticFiles, miscFiles);
