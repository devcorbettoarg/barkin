if (!customElements.get('barkin-gallery-controls')) {
  customElements.define('barkin-gallery-controls', class extends HTMLElement {
    connectedCallback() {
      this.gallery = this.closest('media-gallery');
      this.viewer = this.closest('slider-component');
      this.rail = this.viewer.querySelector('[id^="Slider-Gallery"]');
      this.abort = new AbortController();
      const options = { signal: this.abort.signal };
      this.refresh = () => {
        this.slides = Array.from(this.rail.children).filter(slide => slide.clientWidth > 0);
        this.replaceChildren(...this.slides.map((slide, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'barkin-gallery-dot';
          button.setAttribute('aria-label', `${this.dataset.label} ${index + 1}`);
          button.setAttribute('aria-controls', slide.id);
          button.addEventListener('click', () => this.gallery.setActiveMedia(slide.dataset.mediaId, false));
          return button;
        }));
        this.hidden = this.slides.length < 2;
        this.sync();
        this.viewer.resetPages?.();
      };
      this.sync = () => {
        const left = this.rail.getBoundingClientRect().left;
        const active = this.slides.reduce((best, slide) => !best || Math.abs(slide.getBoundingClientRect().left - left) < Math.abs(best.getBoundingClientRect().left - left) ? slide : best, null);
        this.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-current', String(this.slides[index] === active)));
        if (!active || this.active === active) return;
        this.active = active;
        this.slides.forEach(slide => slide.classList.toggle('is-active', slide === active));
        const thumbnail = this.gallery.querySelector(`[data-target="${active.dataset.mediaId}"]`);
        this.gallery.setActiveThumbnail?.(thumbnail);
      };
      this.rail.addEventListener('scroll', () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.sync, 100);
      }, options);
      this.rail.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || !event.target.closest('.product__modal-opener--image')) return;
        this.drag = { id: event.pointerId, x: event.clientX, left: this.rail.scrollLeft };
        this.moved = false;
      }, options);
      this.rail.addEventListener('pointermove', event => {
        if (!this.drag || event.pointerId !== this.drag.id) return;
        const distance = event.clientX - this.drag.x;
        if (Math.abs(distance) < 6 && !this.moved) return;
        this.moved = true;
        this.rail.setPointerCapture(event.pointerId);
        this.rail.classList.add('is-dragging');
        this.rail.scrollLeft = this.drag.left - distance;
        event.preventDefault();
      }, options);
      const endDrag = () => {
        if (!this.drag) return;
        const id = this.drag.id;
        this.drag = null;
        this.rail.classList.remove('is-dragging');
        if (this.rail.hasPointerCapture(id)) this.rail.releasePointerCapture(id);
      };
      window.addEventListener('pointerup', endDrag, options);
      window.addEventListener('pointercancel', endDrag, options);
      this.rail.addEventListener('click', event => {
        if (!this.moved) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        this.moved = false;
      }, { ...options, capture: true });
      this.rail.addEventListener('dragstart', event => event.preventDefault(), options);
      this.observer = new MutationObserver(this.refresh);
      this.observer.observe(this.rail, { childList: true });
      this.resize = new ResizeObserver(this.refresh);
      this.resize.observe(this.rail);
      this.refresh();
    }
    disconnectedCallback() {
      this.abort?.abort();
      this.observer?.disconnect();
      this.resize?.disconnect();
      clearTimeout(this.timer);
    }
  });
}
