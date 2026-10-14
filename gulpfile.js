'use strict';

const { series, parallel } = require('gulp');
const clean = require('./tars/tasks/clean');
const css = require('./tars/tasks/css');
const js = require('./tars/tasks/js');
const html = require('./tars/tasks/html');
const assets = require('./tars/tasks/assets');
const serve = require('./tars/tasks/serve');

const build = series(clean, parallel(css, js, assets, html));

exports.build = build;
exports.dev = series(build, serve);
exports.default = build;
