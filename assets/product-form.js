const restoreBarkinCartIcon = (button) => {
  if (!button?.matches('main[data-template="product"] .product-form__submit')) return;

  let icon = button.querySelector('.barkin-pdp-cart-icon');
  if (icon?.querySelector('path')) return;
  if (!icon) {
    icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('barkin-pdp-cart-icon');
    button.insertBefore(icon, button.querySelector('span'));
  }

  icon.setAttribute('width', '13');
  icon.setAttribute('height', '17');
  icon.setAttribute('viewBox', '0 0 13 17');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  icon.innerHTML = `
    <g clip-path="url(#clip0_56_2085)">
      <path d="M0.536077 3.80707H3.30993V3.23299C3.30993 2.34348 3.66739 1.53498 4.24325 0.949609C4.81911 0.363906 5.61402 0 6.48858 0C7.36315 0 8.15838 0.363906 8.73391 0.949609C9.30977 1.53498 9.66756 2.34348 9.66756 3.23299V3.80707H12.4639C12.6317 3.80707 12.7839 3.87779 12.8936 3.98936L12.9233 4.02322C13.0163 4.13246 13.0728 4.2749 13.0728 4.42664V14.7777C13.0728 15.3877 12.8266 15.9438 12.4303 16.3466C12.0343 16.7493 11.4875 17 10.8878 17H2.11186C1.51347 17 0.966666 16.7493 0.569701 16.3459C0.17339 15.9441 -0.0727539 15.3887 -0.0727539 14.7777V4.42664C-0.0727539 4.25598 -0.00419916 4.10059 0.105815 3.98869C0.215502 3.87713 0.368281 3.80707 0.536077 3.80707ZM6.08313 9.19096C6.08313 8.95687 6.26986 8.76695 6.50001 8.76695C6.73016 8.76695 6.91689 8.95687 6.91689 9.19096V10.5606H8.26317C8.49299 10.5606 8.67972 10.7502 8.67972 10.9843C8.67972 11.2183 8.49299 11.4083 8.26317 11.4083H6.91689V12.7776C6.91689 13.0116 6.73016 13.2016 6.50001 13.2016C6.26986 13.2016 6.08313 13.0116 6.08313 12.7776V11.4083H4.73685C4.5067 11.4083 4.31997 11.2183 4.31997 10.9843C4.31997 10.7502 4.5067 10.5606 4.73685 10.5606H6.08313V9.19096ZM4.08493 3.80707H8.89257V3.23299C8.89257 2.56129 8.62194 1.95002 8.18613 1.50676C7.75032 1.06383 7.14932 0.788242 6.48858 0.788242C5.82817 0.788242 5.22685 1.06383 4.79137 1.50676C4.35555 1.95002 4.08493 2.56129 4.08493 3.23299V3.80707ZM3.30993 5.33641V4.59631H0.702893V14.7777C0.702893 15.1712 0.861875 15.5291 1.11749 15.7891C1.37212 16.0497 1.72468 16.2108 2.11186 16.2108H10.8878C11.2737 16.2108 11.6263 16.0487 11.8819 15.7887C12.1375 15.5288 12.2971 15.1702 12.2971 14.7777V4.59631H9.66756V5.34471C9.95517 5.49346 10.1523 5.79727 10.1523 6.14756C10.1523 6.64527 9.7557 7.04836 9.26668 7.04836C8.77766 7.04836 8.38069 6.64527 8.38069 6.14756C8.38069 5.78631 8.59027 5.47453 8.89257 5.33109V4.59631H4.08493V5.33939C4.37808 5.48615 4.58015 5.79262 4.58015 6.14756C4.58015 6.64527 4.18384 7.04836 3.69449 7.04836C3.20547 7.04836 2.80915 6.64527 2.80915 6.14756C2.80915 5.79062 3.01319 5.48184 3.30993 5.33641Z" fill="#FFFDFC"/>
    </g>
    <defs><clipPath id="clip0_56_2085"><rect width="13" height="17" fill="white"/></clipPath></defs>`;
};

if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');
        restoreBarkinCartIcon(this.submitButton);

        this.iconObserver = new MutationObserver(() => restoreBarkinCartIcon(this.submitButton));
        this.iconObserver.observe(this.submitButton, { childList: true, subtree: true });

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        const variantId = formData.get('id');
        const quantity = parseInt(formData.get('quantity')) || 1;
        const linesUpdateDeferred = this.createCartLinesUpdateEvent(variantId, quantity);

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: variantId,
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);
              this.dispatchCartErrorEvent(response.description || response.message, 'INVALID');
              linesUpdateDeferred?.reject(new Error(response.description || response.message));

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              this.resolveCartLinesUpdate(linesUpdateDeferred);
              window.location = window.routes.cart_url;
              return;
            }

            this.resolveCartLinesUpdate(linesUpdateDeferred);

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: variantId,
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
            this.dispatchCartErrorEvent(e.message || 'Network error', 'SERVICE_UNAVAILABLE');
            linesUpdateDeferred?.reject(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      createCartLinesUpdateEvent(variantId, quantity) {
        const { CartLinesUpdateEvent } = window.StandardEvents || {};
        if (!CartLinesUpdateEvent) return null;

        const deferred = CartLinesUpdateEvent.createPromise();
        this.dispatchEvent(
          new CartLinesUpdateEvent({
            action: 'add',
            context: 'product',
            lines: [{ merchandiseId: variantId, quantity }],
            promise: deferred.promise,
          })
        );
        return deferred;
      }

      resolveCartLinesUpdate(deferred) {
        if (!deferred) return;
        const { CartLinesUpdateEvent } = window.StandardEvents || {};
        if (!CartLinesUpdateEvent) return;

        const pendingCartDataPromise = typeof CartItems !== 'undefined'
          ? CartItems.fetchCartData()
          : fetch(`${routes.cart_url}.json`).then((response) => response.json());

        pendingCartDataPromise
          .then((cart) => {
            if (!cart?.currency) return deferred.reject(new Error('Missing currency in cart response'));
            deferred.resolve({ cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart) });
          })
          .catch((e) => deferred.reject(e));
      }

      dispatchCartErrorEvent(message, code) {
        const { CartErrorEvent } = window.StandardEvents || {};
        if (!CartErrorEvent) return;
        this.dispatchEvent(new CartErrorEvent({ error: message, code }));
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
