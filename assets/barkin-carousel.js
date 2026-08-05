if (!customElements.get('barkin-carousel')) {
  class BarkinCarousel extends HTMLElement {
    connectedCallback() {
      this.rail = this.querySelector('[data-carousel-rail]');
      this.cards = Array.from(this.querySelectorAll('[data-carousel-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-carousel-dot]'));

      if (!this.rail || this.cards.length < 2) return;

      this.onScroll = this.onScroll.bind(this);
      this.onResize = this.onResize.bind(this);

      this.dots.forEach((dot) => {
        dot.addEventListener('click', () => this.goTo(Number(dot.dataset.carouselDot)));
      });

      this.rail.addEventListener('scroll', this.onScroll, { passive: true });
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.rail);

      requestAnimationFrame(() => {
        const initialIndex = Math.min(Number(this.dataset.initialSlide || 0), this.cards.length - 1);
        this.goTo(initialIndex, false);
      });
    }

    disconnectedCallback() {
      this.rail?.removeEventListener('scroll', this.onScroll);
      this.resizeObserver?.disconnect();
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    }

    getSideInset() {
      return Number.parseFloat(getComputedStyle(this.rail).paddingLeft) || 0;
    }

    goTo(index, smooth = true) {
      const card = this.cards[index];
      if (!card) return;

      this.rail.scrollTo({
        left: Math.max(0, card.offsetLeft - this.getSideInset()),
        behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto',
      });

      this.updateState(index);
    }

    onScroll() {
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = requestAnimationFrame(() => this.updateState());
    }

    onResize() {
      this.updateState();
    }

    getCurrentIndex() {
      const target = this.rail.scrollLeft + this.getSideInset();
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      this.cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft - target);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    }

    updateState(forcedIndex) {
      const currentIndex = forcedIndex ?? this.getCurrentIndex();
      const activeDotIndex = Math.min(currentIndex, this.dots.length - 1);

      this.dots.forEach((dot, index) => {
        const isActive = index === activeDotIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });

      const railRect = this.rail.getBoundingClientRect();
      const visibleLeft = railRect.left + this.getSideInset();
      const visibleRight = railRect.right - this.getSideInset();

      this.cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const isFullyVisible = cardRect.left >= visibleLeft - 1 && cardRect.right <= visibleRight + 1;
        card.classList.toggle('is-edge', !isFullyVisible);
      });
    }
  }

  customElements.define('barkin-carousel', BarkinCarousel);
}
