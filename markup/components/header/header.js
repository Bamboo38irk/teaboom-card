(function () {
    'use strict';

    const dropdowns = [...document.querySelectorAll('[data-dropdown]')];

    function setOpen(dropdown, isOpen) {
        dropdown.classList.toggle('is-open', isOpen);
    }

    dropdowns.forEach((dropdown) => {
        dropdown.querySelector('[data-dropdown-toggle]').addEventListener('click', () => {
            const isOpen = !dropdown.classList.contains('is-open');
            const field = dropdown.querySelector('input');

            dropdowns.forEach((item) => setOpen(item, item === dropdown && isOpen));

            if (isOpen && field) {
                field.focus();
            }
        });
    });

    document.addEventListener('click', (event) => {
        dropdowns.forEach((dropdown) => {
            if (!dropdown.contains(event.target)) {
                setOpen(dropdown, false);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            dropdowns.forEach((dropdown) => setOpen(dropdown, false));
        }
    });

    const counter = document.querySelector('[data-cart-count]');
    const toast = document.querySelector('[data-toast]');
    const cart = {};
    let toastTimer = null;

    function hideToast() {
        toast.classList.remove('is-visible');
    }

    function showToast({ type, title, name, info, image, href, linkLabel }) {
        toast.dataset.type = type;
        toast.querySelector('[data-toast-title]').textContent = title;
        toast.querySelector('[data-toast-image]').style.backgroundImage = `url(${image})`;
        toast.querySelector('[data-toast-name]').textContent = name;
        toast.querySelector('[data-toast-info]').textContent = info;
        toast.querySelector('[data-toast-link]').href = href;
        toast.querySelector('[data-toast-link-label]').textContent = linkLabel;
        toast.classList.add('is-visible');

        clearTimeout(toastTimer);
        toastTimer = setTimeout(hideToast, 4000);
    }

    document.addEventListener('toast:show', (event) => showToast(event.detail));

    function bumpCounter() {
        counter.textContent = Number(counter.textContent) + 1;
        counter.classList.remove('is-bumped');
        void counter.offsetWidth;
        counter.classList.add('is-bumped');
    }

    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cart-add]');

        if (!button) {
            return;
        }

        const sku = button.dataset.sku;

        cart[sku] = (cart[sku] || 0) + 1;
        bumpCounter();
        showToast({
            type: 'cart',
            title: 'Добавлено в корзину',
            name: button.dataset.name,
            info: `${button.dataset.info} · ${cart[sku]} шт.`,
            image: button.dataset.image,
            href: 'https://teaboom.ru/cart',
            linkLabel: 'Перейти в корзину',
        });
        document.dispatchEvent(new CustomEvent('cart:add', { detail: { sku, qty: cart[sku] } }));
    });

    toast.querySelector('[data-toast-close]').addEventListener('click', hideToast);

    const normalize = (value) => value.toLowerCase().replace(/ё/g, 'е');

    function highlight(node, text, query) {
        const index = normalize(text).indexOf(query);
        const mark = document.createElement('mark');

        mark.textContent = text.slice(index, index + query.length);
        node.textContent = '';
        node.append(text.slice(0, index), mark, text.slice(index + query.length));
    }

    document.querySelectorAll('[data-search]').forEach((search) => {
        const form = search.querySelector('form');
        const input = search.querySelector('[data-search-input]');
        const popular = search.querySelector('[data-search-popular]');
        const results = search.querySelector('[data-search-results]');
        const empty = search.querySelector('[data-search-empty]');
        const all = search.querySelector('[data-search-all]');
        const count = search.querySelector('[data-search-count]');
        const items = [...search.querySelectorAll('[data-search-item]')].map((item) => {
            const name = item.querySelector('[data-search-name]');

            return { item, name, text: name.textContent.trim() };
        });

        function update() {
            const value = input.value.trim();
            const query = normalize(value);
            const isActive = query.length >= 2;
            let found = 0;

            items.forEach(({ item, name, text }) => {
                const isMatch = isActive && normalize(text).includes(query);

                item.hidden = !isMatch;

                if (isMatch) {
                    highlight(name, text, query);
                    found += 1;
                }
            });

            popular.hidden = isActive;
            results.hidden = !isActive;
            empty.hidden = found > 0;
            all.hidden = found === 0;
            count.textContent = found;
            all.href = `${form.action}?q=${encodeURIComponent(value)}`;
        }

        input.addEventListener('input', update);

        search.querySelectorAll('[data-search-query]').forEach((chip) => {
            chip.addEventListener('click', () => {
                input.value = chip.dataset.searchQuery;
                input.focus();
                update();
            });
        });
    });
})();
