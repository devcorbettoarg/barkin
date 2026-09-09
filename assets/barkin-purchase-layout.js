if (!customElements.get('barkin-purchase-layout')) {
  customElements.define('barkin-purchase-layout', class extends HTMLElement {
    connectedCallback() {
      const productInfo = this.closest('product-info');
      if (!productInfo || !this.closest('main[data-template="product"]')) return;
      const quantity = productInfo.querySelector('.product-form__quantity');
      const buttons = this.parentElement.querySelector('.product-form__buttons');
      if (!quantity || !buttons) return;
      buttons.classList.add('barkin-purchase-buttons');
      buttons.prepend(quantity);
    }
  });
}

if (!customElements.get('barkin-purchase-options')) {
  customElements.define('barkin-purchase-options', class extends HTMLElement {
    connectedCallback() {
      if (this.onPurchaseChange) return;
      this.onPurchaseChange = () => {
        const subscription = this.querySelector('[data-subscription]');
        const select = this.querySelector('[data-subscription-plan]');
        if (!subscription || !select) return;
        this.querySelector('.barkin-purchase-plans').hidden = !subscription.checked;
        subscription.value = select.value;
        this.querySelector('[data-subscription-price]').textContent = select.selectedOptions[0].dataset.price;
        this.querySelectorAll('[data-plan-description]').forEach((description) => {
          description.hidden = description.dataset.planDescription !== select.value;
        });
      };
      this.addEventListener('change', this.onPurchaseChange);
      this.onPurchaseChange();
    }
  });
}
