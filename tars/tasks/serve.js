'use strict';

const gulp = require('gulp');
const css = require('./css');
const js = require('./js');
const html = require('./html');
const assets = require('./assets');
const { config, paths, dest, server } = require('../tars');

module.exports = function serve() {
    server.init({ server: dest, port: config.port, notify: false, ui: false });

    gulp.watch(paths.stylesWatch, css);
    gulp.watch(paths.scripts, js);
    gulp.watch([...paths.templates, `${paths.icons}/*.svg`], html);
    gulp.watch([...paths.static, paths.misc], assets);
};
