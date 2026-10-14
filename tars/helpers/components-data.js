'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { paths } = require('../tars');

module.exports = function readComponentsData() {
    return fs.readdirSync(paths.components).reduce((data, component) => {
        const file = path.join(paths.components, component, 'data', 'data.js');

        if (!fs.existsSync(file)) {
            return data;
        }

        const source = fs.readFileSync(file, 'utf8');

        return Object.assign(data, vm.runInNewContext(`${source};data`, {}, { filename: file }));
    }, {});
};
