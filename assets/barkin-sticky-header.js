if (!customElements.get('barkin-sticky-header')) {
  class BarkinStickyHeader extends HTMLElement {
    connectedCallback() {
      this.section = this.closest('.barkin-header-section');
      const announcement = this.querySelector('.barkin-site-header__announcement');
      if (!this.section) return;

      if (announcement) {
        const updateHeight = () => {
          this.section.style.setProperty('--barkin-announcement-height', `${announcement.getBoundingClientRect().height}px`);
        };

        updateHeight();
        this.resizeObserver = new ResizeObserver(updateHeight);
        this.resizeObserver.observe(announcement);
      }

      this.lastScrollY = Math.max(0, window.scrollY);
      this.onScroll = () => {
        const scrollY = Math.max(0, window.scrollY);
        const nearTop = scrollY <= this.section.offsetHeight;
        const menuInUse = this.querySelector('details[open]') || this.contains(document.activeElement);

        if (nearTop || menuInUse) {
          this.section.classList.remove('barkin-header-section--hidden');
        } else {
          // Ignore tiny movements to avoid flickering on touchpads.
          if (Math.abs(scrollY - this.lastScrollY) < 4) return;
          this.section.classList.toggle('barkin-header-section--hidden', scrollY > this.lastScrollY);
        }

        this.lastScrollY = scrollY;
      };
      this.onFocusIn = () => this.section.classList.remove('barkin-header-section--hidden');
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.addEventListener('focusin', this.onFocusIn);
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      window.removeEventListener('scroll', this.onScroll);
      this.removeEventListener('focusin', this.onFocusIn);
      this.section?.classList.remove('barkin-header-section--hidden');
      this.section?.style.removeProperty('--barkin-announcement-height');
    }
  }

  customElements.define('barkin-sticky-header', BarkinStickyHeader);
}
