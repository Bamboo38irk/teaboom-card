# Markup builder

A small gulp-based builder for static markup: Handlebars templates, SCSS, plain JavaScript and SVG icons. A trimmed-down rewrite of TARS with the same project layout.

## Quick start

Requires Node.js 16 or newer.

```bash
npm install
npm run dev     # dev build in dev/ and a local server with live reload: http://localhost:3004
npm run build   # production build in builds/ with minified HTML, CSS and JS
```

With gulp-cli installed globally, `gulp dev` and `gulp build` do the same.

## Structure

```
markup/
  pages/              page templates, one file per page
  components/
    <name>/
      <name>.html     markup (Handlebars partial)
      <name>.scss     styles
      <name>.js       behaviour
      data/data.js    content for the template
  static/
    scss/             entry file and base styles: fonts, variables, reset, mixins, common styles, buttons
    icons/            SVG icons, inlined into the markup
    img/, fonts/      copied as is
    misc/             copied to the site root (favicon, robots.txt and so on)
tars/                 build tasks and Handlebars helpers
tars-config.js        output paths, dev server port, sourcemaps
```

## Components and data

A component is a folder in `markup/components`. Include it in a page as a partial and pass its data:

```hbs
{{> product/product product}}
```

Each `data/data.js` declares a `data` object keyed by name; all data files are merged and passed to the templates:

```js
var data = {
    product: {
        name: 'Product name'
    }
};
```

Component styles are imported in `markup/static/scss/main.scss`; component scripts are picked up automatically.

## Helpers

- `{{Icon iconName='cart' className='button__icon'}}` — inlines `markup/static/icons/cart.svg`.
- `{{nbsp text}}` — puts non-breaking spaces after short words and before dashes.
- `{{money 1432}}` → `1 432 ₽`, `{{discount price oldPrice}}`, `{{saving price oldPrice}}`, `{{unitPrice price grams}}`, `{{minPrice packs}}` — price formatting.

Helpers are loaded once on start, so restart `npm run dev` after editing `tars/helpers/handlebars-helpers.js`.

## What the build does

- Compiles pages with Handlebars.
- Compiles SCSS with Autoprefixer; sourcemaps in dev, CSSO minification in the build.
- Checks component scripts with ESLint, concatenates them into `static/js/main.js`, minifies with Terser in the build.
- Copies images, fonts and misc files.
- In dev mode watches all sources and reloads the browser.
