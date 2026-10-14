'use strict';

const del = require('del');
const { dest } = require('../tars');

module.exports = function clean() {
    return del(dest);
};
