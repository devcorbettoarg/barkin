if (!customElements.get('barkin-sticky-header')) {
  class BarkinStickyHeader extends HTMLElement {
    connectedCallback() {
      this.section = this.closest('.barkin-header-section');
      this.mobileViewport = window.matchMedia('(max-width: 749px)');
      this.mobileMenu = this.querySelector('.barkin-site-header__mobile-menu');
      this.mobileSearch = this.querySelector('.barkin-mobile-search-toggle');
      const mainHeader = this.querySelector('.barkin-site-header__main');
      const announcement = this.querySelector('.barkin-site-header__announcement');
      if (!this.section) return;

      this.updateHeight = () => {
        if (announcement) {
          this.section.style.setProperty('--barkin-announcement-height', `${announcement.getBoundingClientRect().height}px`);
        }
        if (mainHeader) {
          this.style.setProperty('--barkin-mobile-menu-top', `${Math.max(0, mainHeader.getBoundingClientRect().bottom)}px`);
        }
      };

      this.updateHeight();
      this.resizeObserver = new ResizeObserver(this.updateHeight);
      if (announcement) this.resizeObserver.observe(announcement);
      if (mainHeader) this.resizeObserver.observe(mainHeader);

      this.lastScrollY = Math.max(0, window.scrollY);
      this.onScroll = () => {
        const scrollY = Math.max(0, window.scrollY);
        if (this.mobileViewport.matches) {
          this.section.classList.remove('barkin-header-section--hidden');
          this.updateHeight();
          this.lastScrollY = scrollY;
          return;
        }
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
      this.onMenuToggle = () => {
        if (this.mobileMenu.open) this.updateHeight();
        else this.mobileMenu.querySelectorAll('details[open]').forEach((details) => { details.open = false; });
      };
      this.onSearchToggle = () => {
        if (this.mobileSearch.open) this.mobileSearch.querySelector('input[type="search"]').focus();
      };
      this.onCountryChange = (event) => {
        if (event.target.matches('[data-mobile-country]')) event.target.form.requestSubmit();
      };
      this.onKeyDown = (event) => {
        if (event.key === 'Escape' && this.mobileMenu?.open) {
          if (this.mobileSearch?.open) {
            this.mobileSearch.open = false;
            this.mobileSearch.querySelector('summary').focus();
            return;
          }
          this.mobileMenu.open = false;
          this.mobileMenu.querySelector('summary').focus();
        }
      };
      this.onOutsideClick = (event) => {
        if (this.mobileMenu?.open && !this.mobileMenu.contains(event.target)) {
          this.mobileMenu.open = false;
        }
      };
      this.onViewportChange = () => {
        if (!this.mobileViewport.matches && this.mobileMenu) this.mobileMenu.open = false;
        this.onScroll();
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.updateHeight);
      this.mobileViewport.addEventListener('change', this.onViewportChange);
      this.mobileMenu?.addEventListener('toggle', this.onMenuToggle);
      this.mobileSearch?.addEventListener('toggle', this.onSearchToggle);
      this.addEventListener('change', this.onCountryChange);
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('click', this.onOutsideClick);
      this.addEventListener('focusin', this.onFocusIn);
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.updateHeight);
      this.mobileViewport?.removeEventListener('change', this.onViewportChange);
      this.mobileMenu?.removeEventListener('toggle', this.onMenuToggle);
      this.mobileSearch?.removeEventListener('toggle', this.onSearchToggle);
      this.removeEventListener('change', this.onCountryChange);
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('click', this.onOutsideClick);
      this.removeEventListener('focusin', this.onFocusIn);
      this.section?.classList.remove('barkin-header-section--hidden');
      this.section?.style.removeProperty('--barkin-announcement-height');
      this.style.removeProperty('--barkin-mobile-menu-top');
    }
  }

  customElements.define('barkin-sticky-header', BarkinStickyHeader);
}
