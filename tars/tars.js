'use strict';

const { PassThrough } = require('stream');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync');
const config = require('../tars-config');

const isRelease = !process.argv.slice(2).includes('dev');

const paths = {
    pages: 'markup/pages/**/*.html',
    components: 'markup/components',
    templates: ['markup/pages/**/*.html', 'markup/components/**/*.html', 'markup/components/**/data/data.js'],
    styles: 'markup/static/scss/main.scss',
    stylesWatch: ['markup/static/scss/**/*.scss', 'markup/components/**/*.scss'],
    scripts: ['markup/components/**/*.js', '!markup/components/**/data/data.js'],
    icons: 'markup/static/icons',
    static: ['markup/static/img/**/*', 'markup/static/fonts/**/*'],
    misc: 'markup/static/misc/**/*',
};

function guard() {
    if (isRelease) {
        return new PassThrough({ objectMode: true });
    }

    return plumber({
        errorHandler(error) {
            console.error(error.messageFormatted || error.message);
            this.emit('end');
        },
    });
}

module.exports = {
    config,
    isRelease,
    paths,
    guard,
    dest: isRelease ? config.buildPath : config.devPath,
    server: browserSync.create('tars'),
};
