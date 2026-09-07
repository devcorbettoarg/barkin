if (!customElements.get('barkin-carousel')) {
  class BarkinCarousel extends HTMLElement {
    connectedCallback() {
      this.rail = this.querySelector('[data-carousel-rail]');
      this.cards = Array.from(this.querySelectorAll('[data-carousel-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-carousel-dot]'));

      if (!this.rail || this.cards.length < 2) return;

      this.onScroll = this.onScroll.bind(this);
      this.onResize = this.onResize.bind(this);
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerEnd = this.onPointerEnd.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onDragStart = this.onDragStart.bind(this);

      this.dotHandlers = this.dots.map((dot) => {
        const handler = () => {
          const index = Number(dot.dataset.carouselDot);
          if (this.dataset.pagination === 'positions') this.goToPage(index);
          else this.goTo(index);
        };
        dot.addEventListener('click', handler);
        return handler;
      });

      this.rail.addEventListener('scroll', this.onScroll, { passive: true });
      this.rail.addEventListener('pointerdown', this.onPointerDown);
      this.rail.addEventListener('pointermove', this.onPointerMove);
      this.rail.addEventListener('pointerup', this.onPointerEnd);
      this.rail.addEventListener('pointercancel', this.onPointerEnd);
      this.rail.addEventListener('click', this.onClick, true);
      this.rail.addEventListener('dragstart', this.onDragStart);
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.rail);

      requestAnimationFrame(() => {
        this.updatePages();
        const initialIndex = Math.min(Number(this.dataset.initialSlide || 0), this.cards.length - 1);
        this.goTo(initialIndex, false);
      });
    }

    disconnectedCallback() {
      this.rail?.removeEventListener('scroll', this.onScroll);
      this.rail?.removeEventListener('pointerdown', this.onPointerDown);
      this.rail?.removeEventListener('pointermove', this.onPointerMove);
      this.rail?.removeEventListener('pointerup', this.onPointerEnd);
      this.rail?.removeEventListener('pointercancel', this.onPointerEnd);
      this.rail?.removeEventListener('click', this.onClick, true);
      this.rail?.removeEventListener('dragstart', this.onDragStart);
      this.dots?.forEach((dot, index) => dot.removeEventListener('click', this.dotHandlers?.[index]));
      this.resizeObserver?.disconnect();
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    }

    onPointerDown(event) {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      if (event.target.closest('button, input, select, textarea')) return;

      this.dragPointerId = event.pointerId;
      this.dragStartX = event.clientX;
      this.dragStartScrollLeft = this.rail.scrollLeft;
      this.isPointerDown = true;
      this.hasDragged = false;
      this.rail.setPointerCapture?.(event.pointerId);
      this.rail.classList.add('is-dragging');
    }

    onPointerMove(event) {
      if (!this.isPointerDown || event.pointerId !== this.dragPointerId) return;

      const distance = event.clientX - this.dragStartX;
      if (Math.abs(distance) > 5) this.hasDragged = true;
      if (!this.hasDragged) return;

      event.preventDefault();
      this.rail.scrollLeft = this.dragStartScrollLeft - distance;
    }

    onPointerEnd(event) {
      if (!this.isPointerDown || event.pointerId !== this.dragPointerId) return;

      this.isPointerDown = false;
      this.rail.classList.remove('is-dragging');
      if (this.rail.hasPointerCapture?.(event.pointerId)) {
        this.rail.releasePointerCapture(event.pointerId);
      }

      window.setTimeout(() => {
        this.hasDragged = false;
      }, 0);
    }

    onClick(event) {
      if (!this.hasDragged) return;
      event.preventDefault();
      event.stopPropagation();
    }

    onDragStart(event) {
      if (event.target.closest('img, a')) event.preventDefault();
    }

    getSideInset() {
      return Number.parseFloat(getComputedStyle(this.rail).paddingLeft) || 0;
    }

    goTo(index, smooth = true) {
      const card = this.cards[index];
      if (!card) return;

      this.rail.scrollTo({
        left: this.dataset.align === 'center'
          ? this.getCenteredPosition(card)
          : Math.max(0, card.offsetLeft - this.getSideInset()),
        behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto',
      });

      this.updateState(index);
    }

    onScroll() {
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = requestAnimationFrame(() => this.updateState());
    }

    onResize() {
      if (this.dataset.align === 'center' && this.activeIndex !== undefined) {
        this.goTo(this.activeIndex, false);
      }
      this.updatePages();
      this.updateState();
    }

    getCardPosition(card) {
      return card.getBoundingClientRect().left - this.rail.getBoundingClientRect().left
        + this.rail.scrollLeft - this.getSideInset();
    }

    updatePages() {
      if (this.dataset.pagination !== 'positions') return;
      const maxScroll = Math.max(0, this.rail.scrollWidth - this.rail.clientWidth);
      this.pages = [];
      this.cards.forEach((card) => {
        const position = Math.min(maxScroll, Math.max(0, this.getCardPosition(card)));
        if (!this.pages.length || position - this.pages[this.pages.length - 1] > 1) {
          this.pages.push(position);
        } else if (position === maxScroll) {
          this.pages[this.pages.length - 1] = maxScroll;
        }
      });
      this.dots.forEach((dot, index) => {
        dot.hidden = this.pages.length < 2 || index >= this.pages.length;
      });
      const pagination = this.querySelector('.barkin-showcase__dots');
      if (pagination) pagination.hidden = this.pages.length < 2;
    }

    goToPage(index) {
      const position = this.pages?.[index];
      if (position === undefined) return;
      this.rail.scrollTo({
        left: position,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      this.updateState();
    }

    getCurrentPage() {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      (this.pages || []).forEach((position, index) => {
        const distance = Math.abs(position - this.rail.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      return nearestIndex;
    }

    getCenteredPosition(card) {
      return Math.max(0, Math.min(
        this.rail.scrollWidth - this.rail.clientWidth,
        card.offsetLeft - (this.rail.clientWidth - card.offsetWidth) / 2
      ));
    }

    getCurrentIndex() {
      const target = this.rail.scrollLeft + this.getSideInset();
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      this.cards.forEach((card, index) => {
        const distance = this.dataset.align === 'center'
          ? Math.abs(this.getCenteredPosition(card) - this.rail.scrollLeft)
          : Math.abs(card.offsetLeft - target);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    }

    updateState(forcedIndex) {
      const currentIndex = forcedIndex ?? this.getCurrentIndex();
      this.activeIndex = currentIndex;
      const activeDotIndex = this.dataset.pagination === 'positions'
        ? this.getCurrentPage()
        : Math.min(currentIndex, this.dots.length - 1);

      this.dots.forEach((dot, index) => {
        const isActive = index === activeDotIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });

      this.cards.forEach((card, index) => {
        card.classList.toggle('is-active', index === currentIndex);
      });

      if (this.dataset.carouselEdges !== 'false') {
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
  }

  customElements.define('barkin-carousel', BarkinCarousel);
}
