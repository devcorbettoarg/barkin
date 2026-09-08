if (!customElements.get('barkin-desktop-mega-menu')) {
  class BarkinDesktopMegaMenu extends HTMLElement {
    connectedCallback() {
      this.details = this.querySelector(':scope > details');
      this.summary = this.details?.querySelector(':scope > summary');
      this.panel = this.details?.querySelector(':scope > .barkin-site-header__mega');
      this.desktopQuery = window.matchMedia('(min-width: 990px)');

      if (!this.details || !this.summary || !this.panel) return;

      this.onSummaryClick = this.onSummaryClick.bind(this);
      this.onPointerEnter = this.onPointerEnter.bind(this);
      this.onPointerLeave = this.onPointerLeave.bind(this);
      this.onFocusOut = this.onFocusOut.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      this.onBreakpointChange = this.onBreakpointChange.bind(this);

      this.summary.addEventListener('click', this.onSummaryClick);
      this.addEventListener('pointerenter', this.onPointerEnter);
      this.addEventListener('pointerleave', this.onPointerLeave);
      this.addEventListener('focusout', this.onFocusOut);
      this.addEventListener('keyup', this.onKeyUp);
      this.desktopQuery.addEventListener('change', this.onBreakpointChange);
    }

    disconnectedCallback() {
      this.cancelPendingTransition();
      this.summary?.removeEventListener('click', this.onSummaryClick);
      this.removeEventListener('pointerenter', this.onPointerEnter);
      this.removeEventListener('pointerleave', this.onPointerLeave);
      this.removeEventListener('focusout', this.onFocusOut);
      this.removeEventListener('keyup', this.onKeyUp);
      this.desktopQuery?.removeEventListener('change', this.onBreakpointChange);
    }

    get isReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    get isOpen() {
      return this.details.hasAttribute('open') && !this.details.classList.contains('is-closing');
    }

    onSummaryClick(event) {
      if (!this.desktopQuery.matches) return;
      event.preventDefault();
      this.isOpen ? this.close() : this.open();
    }

    onPointerEnter(event) {
      if (this.desktopQuery.matches && event.pointerType !== 'touch') this.open();
    }

    onPointerLeave(event) {
      if (this.desktopQuery.matches && event.pointerType !== 'touch') this.close();
    }

    onFocusOut() {
      window.setTimeout(() => {
        if (!this.contains(document.activeElement)) this.close();
      }, 0);
    }

    onKeyUp(event) {
      if (event.code !== 'Escape' || !this.details.hasAttribute('open')) return;
      event.preventDefault();
      this.close({ returnFocus: true });
    }

    onBreakpointChange(event) {
      if (!event.matches) this.finishClose(false);
    }

    open() {
      if (
        !this.desktopQuery.matches ||
        this.details.classList.contains('is-open') ||
        this.details.classList.contains('is-opening')
      ) return;

      this.cancelPendingTransition();
      this.closeSiblingMenus();
      this.details.setAttribute('open', '');
      this.summary.setAttribute('aria-expanded', 'true');
      this.details.classList.remove('is-closing', 'is-open', 'is-opening');

      if (this.isReducedMotion) {
        this.details.classList.add('is-open');
        return;
      }

      // Commit the closed transform before starting the entrance transition.
      this.panel.getBoundingClientRect();
      this.openFrame = requestAnimationFrame(() => {
        this.openFrame = null;
        this.details.classList.add('is-opening');
        this.waitForTransition('is-opening', () => {
          this.details.classList.remove('is-opening');
          this.details.classList.add('is-open');
        });
      });
    }

    close({ returnFocus = false } = {}) {
      if (!this.details.hasAttribute('open')) return;
      if (this.details.classList.contains('is-closing')) {
        if (returnFocus) this.summary.focus();
        return;
      }

      this.cancelPendingTransition();
      this.summary.setAttribute('aria-expanded', 'false');
      this.details.classList.remove('is-opening', 'is-open');
      this.details.classList.add('is-closing');

      if (returnFocus) this.summary.focus();
      if (this.isReducedMotion) {
        this.finishClose(false);
        return;
      }

      this.waitForTransition('is-closing', () => this.finishClose(false));
    }

    finishClose(returnFocus = false) {
      this.cancelPendingTransition();
      this.details?.classList.remove('is-opening', 'is-open', 'is-closing');
      this.details?.removeAttribute('open');
      this.summary?.setAttribute('aria-expanded', 'false');
      if (returnFocus) this.summary?.focus();
    }

    closeSiblingMenus() {
      this.closest('.barkin-site-header__nav')
        ?.querySelectorAll('barkin-desktop-mega-menu')
        .forEach((menu) => {
          if (menu !== this && typeof menu.close === 'function') menu.close();
        });
    }

    waitForTransition(expectedClass, callback) {
      const token = Symbol('mega-menu-transition');
      this.transitionToken = token;

      const finish = (event) => {
        if (event && (event.target !== this.panel || event.propertyName !== 'transform')) return;
        if (this.transitionToken !== token || !this.details.classList.contains(expectedClass)) return;
        this.cancelPendingTransition();
        callback();
      };

      this.transitionEndHandler = finish;
      this.panel.addEventListener('transitionend', finish);
      this.transitionTimer = window.setTimeout(() => finish(), 500);
    }

    cancelPendingTransition() {
      if (this.openFrame) cancelAnimationFrame(this.openFrame);
      if (this.transitionEndHandler && this.panel) {
        this.panel.removeEventListener('transitionend', this.transitionEndHandler);
      }
      if (this.transitionTimer) window.clearTimeout(this.transitionTimer);
      this.transitionEndHandler = null;
      this.transitionTimer = null;
      this.transitionToken = null;
      this.openFrame = null;
    }
  }

  customElements.define('barkin-desktop-mega-menu', BarkinDesktopMegaMenu);
}
