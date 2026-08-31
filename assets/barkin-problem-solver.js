(() => {
  const initializeProblemSolver = (root = document) => {
    root.querySelectorAll('.barkin-problem-solver').forEach((section) => {
      if (section.dataset.problemSolverReady === 'true') return;

      const tabs = Array.from(section.querySelectorAll('[data-problem-tab]'));
      const slides = Array.from(section.querySelectorAll('[data-problem-slide]'));
      const rail = section.querySelector('[data-carousel-rail]');

      if (!rail || tabs.length === 0 || slides.length === 0) return;

      const activateTab = (index, { focus = false } = {}) => {
        const tab = tabs[index];
        const slide = slides[index];
        if (!tab || !slide) return;

        tabs.forEach((item, itemIndex) => {
          const isActive = itemIndex === index;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
          item.tabIndex = isActive ? 0 : -1;
        });

        const sideInset = Number.parseFloat(getComputedStyle(rail).paddingLeft) || 0;
        rail.scrollTo({
          left: Math.max(0, slide.offsetLeft - sideInset),
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });

        if (focus) tab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(index));
        tab.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          const direction = event.key === 'ArrowRight' ? 1 : -1;
          const nextIndex = (index + direction + tabs.length) % tabs.length;
          activateTab(nextIndex, { focus: true });
        });
      });

      section.dataset.problemSolverReady = 'true';
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeProblemSolver(), { once: true });
  } else {
    initializeProblemSolver();
  }

  document.addEventListener('shopify:section:load', (event) => initializeProblemSolver(event.target));
})();
