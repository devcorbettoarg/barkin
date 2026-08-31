(() => {
  const initializeProblemSolver = (root = document) => {
    root.querySelectorAll('.barkin-problem-solver').forEach((section) => {
      if (section.dataset.problemSolverReady === 'true') return;

      const tabs = Array.from(section.querySelectorAll('[data-problem-tab]'));
      const panels = Array.from(section.querySelectorAll('[data-problem-panel]'));

      if (tabs.length === 0 || panels.length === 0) return;

      const activateTab = (index, { focus = false } = {}) => {
        const tab = tabs[index];
        const panel = panels[index];
        if (!tab || !panel) return;

        tabs.forEach((item, itemIndex) => {
          const isActive = itemIndex === index;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
          item.tabIndex = isActive ? 0 : -1;
        });

        panels.forEach((item, itemIndex) => {
          item.hidden = itemIndex !== index;
        });

        panel.querySelector('[data-carousel-rail]')?.scrollTo({ left: 0, behavior: 'auto' });

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
