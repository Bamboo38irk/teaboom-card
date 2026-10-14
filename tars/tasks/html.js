'use strict';

const gulp = require('gulp');
const { Transform } = require('stream');
const handlebars = require('gulp-compile-handlebars');
const beautify = require('js-beautify');
const helpers = require('../helpers/handlebars-helpers');
const readComponentsData = require('../helpers/components-data');
const { paths, guard, dest, server } = require('../tars');

const inline = beautify.html.defaultOptions().inline.filter((tag) => !['svg', 'button'].includes(tag));

function format() {
    return new Transform({
        objectMode: true,
        transform(file, encoding, done) {
            const html = beautify.html(file.contents.toString(), {
                indent_size: 4,
                indent_inner_html: true,
                preserve_newlines: false,
                extra_liners: [],
                wrap_line_length: 0,
                inline,
            });

            file.contents = Buffer.from(`${html}\n`);
            done(null, file);
        },
    });
}

module.exports = function html() {
    return gulp
        .src(paths.pages)
        .pipe(guard())
        .pipe(handlebars(readComponentsData(), { batch: [paths.components], helpers }))
        .pipe(format())
        .pipe(gulp.dest(dest))
        .on('end', () => server.reload());
};
