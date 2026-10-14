'use strict';

const fs = require('fs');
const path = require('path');
const { Handlebars } = require('gulp-compile-handlebars');
const { paths } = require('../tars');

const SHORT_WORD = /(^|[\s(«;])([а-яёa-z]{1,2}|без|для|при|над|под|про|или|что|как|из-за|из-под)\s+(?=\S)/gi;

function formatPrice(value) {
    const rounded = Math.round(value * 100) / 100;
    const digits = Number.isInteger(rounded) ? 0 : 2;

    return `${new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits }).format(rounded)} ₽`;
}

module.exports = {
    money(value) {
        return formatPrice(value);
    },

    minPrice(packs) {
        return formatPrice(Math.min(...packs.map((pack) => pack.price)));
    },

    unitPrice(price, grams) {
        return formatPrice((price * 100) / grams);
    },

    saving(price, oldPrice) {
        return oldPrice > price ? formatPrice(oldPrice - price) : '';
    },

    initial(text) {
        return String(text).charAt(0);
    },

    discount(price, oldPrice) {
        return oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : '';
    },

    Icon(options) {
        const { iconName, className } = options.hash;
        const file = path.join(paths.icons, `${iconName}.svg`);

        if (!fs.existsSync(file)) {
            throw new Error(`There is no icon with name: ${iconName}`);
        }

        const svg = fs.readFileSync(file, 'utf8').trim();
        const attrs = className ? ` class="${className}"` : '';


        return new Handlebars.SafeString(svg.replace('<svg', `<svg${attrs}`));
    },

    nbsp(text) {
        let result = Handlebars.Utils.escapeExpression(String(text));

        for (let pass = 0; pass < 2; pass++) {
            result = result.replace(SHORT_WORD, '$1$2&nbsp;');
        }

        return new Handlebars.SafeString(result.replace(/\s+—/g, '&nbsp;—'));
    },
};
