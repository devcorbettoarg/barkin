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
