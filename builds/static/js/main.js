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

(function () {
    'use strict';

    document.querySelectorAll('[data-product]').forEach((product) => {
        const crumbs = product.querySelector('[data-crumbs]');
        const tabs = product.querySelector('[data-tabs]');

        const pill = tabs.querySelector('[data-tabs-pill]');

        function movePill() {
            const active = tabs.querySelector('[data-tab].is-active');

            pill.style.width = `${active.offsetWidth}px`;
            pill.style.transform = `translateX(${active.offsetLeft}px)`;
        }

        function openTab(name) {
            tabs.querySelectorAll('[data-tab]').forEach((button) => {
                button.classList.toggle('is-active', button.dataset.tab === name);
            });

            tabs.querySelectorAll('[data-panel]').forEach((panel) => {
                panel.classList.toggle('is-active', panel.dataset.panel === name);
            });

            movePill();
        }

        new ResizeObserver(() => {
            crumbs.scrollLeft = crumbs.scrollWidth;
        }).observe(crumbs.firstElementChild);

        document.fonts.ready.then(() => {
            movePill();
            requestAnimationFrame(() => tabs.classList.add('is-ready'));
        });

        window.addEventListener('resize', movePill);

        tabs.querySelectorAll('[data-tab]').forEach((button) => {
            button.addEventListener('click', () => openTab(button.dataset.tab));
        });

        product.querySelectorAll('[data-tab-link]').forEach((link) => {
            link.addEventListener('click', () => openTab(link.dataset.tabLink));
        });

        product.querySelectorAll('[data-favorite]').forEach((button) => {
            button.addEventListener('click', () => {
                const isActive = button.classList.toggle('is-active');
                const submit = product.querySelector('[data-cart-add]');

                document.dispatchEvent(new CustomEvent('toast:show', {
                    detail: {
                        type: isActive ? 'favorite' : 'unfavorite',
                        title: isActive ? 'Добавлено в избранное' : 'Удалено из избранного',
                        name: button.dataset.name,
                        info: submit ? submit.dataset.info : button.dataset.info,
                        image: button.dataset.image,
                        href: 'https://teaboom.ru/my-favorite-products',
                        linkLabel: 'Перейти в избранное',
                    },
                }));
            });
        });

        const form = product.querySelector('[data-buy]');

        if (!form) {
            return;
        }

        const fields = product.querySelectorAll('[data-field]');
        const discountOnly = product.querySelectorAll('[data-discount-only]');
        const submit = form.querySelector('[data-cart-add]');
        const submitLabel = submit.querySelector('[data-submit-label]');
        const submitQty = submit.querySelector('[data-submit-qty]');
        const quantities = {};

        function renderSubmit() {
            const qty = quantities[submit.dataset.sku] || 0;

            submit.classList.toggle('is-added', qty > 0);
            submitLabel.textContent = qty ? 'Добавить ещё' : 'В корзину';
            submitQty.textContent = qty;
        }

        function render(pack) {
            fields.forEach((field) => {
                field.textContent = pack.dataset[field.dataset.field];
            });

            discountOnly.forEach((node) => {
                node.hidden = !pack.dataset.oldPrice;
            });

            submit.dataset.sku = pack.dataset.sku;
            submit.dataset.info = `${pack.dataset.weight} · ${pack.dataset.price}`;
            renderSubmit();
        }

        form.addEventListener('change', (event) => {
            if (event.target.name === 'sku') {
                render(event.target);
            }
        });

        form.addEventListener('submit', (event) => event.preventDefault());
        submitQty.addEventListener('animationend', () => submitQty.classList.remove('is-bumped'));

        const cta = product.querySelector('[data-sticky-cta]');
        const header = document.querySelector('.header');

        new IntersectionObserver(([entry]) => {
            cta.classList.toggle('is-visible', !entry.isIntersecting);
        }, { rootMargin: `-${header.offsetHeight}px 0px -40% 0px` }).observe(form);

        document.addEventListener('cart:add', (event) => {
            quantities[event.detail.sku] = event.detail.qty;
            renderSubmit();

            if (event.detail.sku === submit.dataset.sku) {
                submitQty.classList.remove('is-bumped');
                void submitQty.offsetWidth;
                submitQty.classList.add('is-bumped');
            }
        });

        render(form.querySelector('[name="sku"]:checked'));
    });
})();

(function () {
    'use strict';

    document.querySelectorAll('[data-related]').forEach((section) => {
        const slider = section.querySelector('[data-slider]');
        const items = [...slider.children];
        let timer = null;

        function makeClones() {
            return items.map((item) => {
                const clone = item.cloneNode(true);

                clone.classList.add('card--clone');

                return clone;
            });
        }

        slider.prepend(...makeClones());
        slider.append(...makeClones());

        function setWidth() {
            return items[0].offsetLeft - slider.children[0].offsetLeft;
        }

        function center() {
            slider.scrollLeft = items[0].offsetLeft - slider.children[0].offsetLeft;
        }

        function loop() {
            const width = setWidth();

            if (!width) {
                return;
            }

            if (slider.scrollLeft < width * 0.5) {
                slider.scrollLeft += width;
            } else if (slider.scrollLeft >= width * 1.5) {
                slider.scrollLeft -= width;
            }
        }

        function step() {
            const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;

            return items[0].offsetWidth + gap;
        }

        section.querySelector('[data-slider-prev]').addEventListener('click', () => {
            slider.scrollBy({ left: -step(), behavior: 'smooth' });
        });

        section.querySelector('[data-slider-next]').addEventListener('click', () => {
            slider.scrollBy({ left: step(), behavior: 'smooth' });
        });

        slider.addEventListener('scroll', () => {
            clearTimeout(timer);
            timer = setTimeout(loop, 120);
        }, { passive: true });

        window.addEventListener('resize', center);

        center();
    });
})();
