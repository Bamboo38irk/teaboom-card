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
