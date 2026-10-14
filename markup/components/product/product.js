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
