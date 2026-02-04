class CardPaymentWidget {
  constructor(ElmId, options = {}) {
    this.cardPaymentFormWrapper = document.getElementById(ElmId);
    this.themeColor = options.themeColor || '#0d6efd';
    //We can maintain different text for different languages.
    this.labels = options.labels || {
      title: 'Secure Payment',
      cardNumber: 'CARD NUMBER',
      expiry: 'EXPIRY',
      cvc: 'CVC',
      postalCode: 'POSTAL CODE',
      payNow: 'Pay Now',
      processing: 'Processing...',
      paymentConfirmed: 'Payment Confirmed',
      successMsg: 'Your transaction was successful.',
      paymentFailed: 'Payment Failed',
      failMsg: 'The transaction was declined. Please check your card details and try again.',
      done: 'Done',
      errors: {
        invalidFormat: 'Invalid card format',
        expiryFormat: 'Format MM/YY required',
        invalidMonth: 'Invalid Month',
        cardExpired: 'Card Expired',
        invalidCvc: 'Invalid CVC',
        invalidPostalCode: 'Invalid postal code'
      }
    };
    this.inputElements = ['cardNumber', 'expiry', 'cvc', 'postalCode'];
    this.init();
  }

  init() {
    this.render();
    this.registerEvents();
    this.loadInitialData();
  }

  expiryValidator(value) {
    const val = value.replace('/', '');
    if (!val || val.length !== 4) return { valid: false, msg: this.labels.errors.expiryFormat };
    
    const m = parseInt(val.substring(0, 2)), 
          year = parseInt(val.substring(2, 4));
    const now = new Date(), 
          currentMonth = now.getMonth() + 1, 
          currentYear = now.getFullYear() % 100;

    if (m < 1 || m > 12) return { valid: false, msg: this.labels.errors.invalidMonth };
    if (year < currentYear || (year === currentYear && m < currentMonth)) {
        return { valid: false, msg: this.labels.errors.cardExpired };
    }
    return { valid: true };
  }

  validateField(id, isValid, errorMsg = '') {
    const el = document.getElementById(id);
    const feedback = el.nextElementSibling;
    if (!isValid) {
      el.classList.add('is-invalid');
      if (feedback) feedback.innerText = errorMsg;
    } else {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
    }
    return isValid;
  }

  render() {
    this.cardPaymentFormWrapper.innerHTML = `
      <div class="card border-0">
        <div class="card-body p-4" id="paymentScreen">
          <h5 class="fw-bold mb-4">${this.labels.title}</h5>
          <form id="paymentForm">
            <div class="mb-3">
              <label class="form-label small fw-bold" for="cardNumber">${this.labels.cardNumber}</label>
              <input type="text" id="cardNumber" class="form-control" placeholder="XXXX XXXX XXXX XXX/XXXX" required maxlength="19" inputmode="numeric" pattern="[0-9 ]*">
              <div class="invalid-feedback" aria-live="polite"></div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold" for="expiry">${this.labels.expiry}</label>
                <input type="text" id="expiry" class="form-control" placeholder="MM/YY" maxlength="5" required>
                <div class="invalid-feedback" aria-live="polite"></div>
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold" for="cvc">${this.labels.cvc}</label>
                <input type="password" id="cvc" class="form-control" placeholder="XXX" maxlength="3" required>
                <div class="invalid-feedback" aria-live="polite"></div>
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label small fw-bold" for="postalCode" >${this.labels.postalCode}</label>
              <input type="text" id="postalCode" class="form-control" required minlength="5" >
              <div class="invalid-feedback" aria-live="polite"></div>
            </div>
            <button type="submit" id="submitBtn" aria-label="${this.labels.payNow}" class="btn w-100 fw-bold py-2 text-white" 
                    style="background-color: ${this.themeColor}">${this.labels.payNow}</button>
          </form>
        </div>
      </div>
    `;
  }

  registerEvents() {
    const form = document.getElementById('paymentForm');
    if(!form) return;

    document.getElementById('cardNumber')?.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\s+/g, ''); // To remove all spaces
      const blocks = val.match(/.{1,4}/g); // To take characters in groups of 1 up to 4. (Amex last group will have 3 digits)
      e.target.value = blocks ? blocks.join(' ') : val;
    });

    this.inputElements.forEach(id => {
      document.getElementById(id)?.addEventListener('blur', () => this.validateSingleField(id));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  validateSingleField(id) {
    const element = document.getElementById(id);
    if (!element) return false;
  
    let isValid = false;
    let errorMsg = '';

    switch (id) {
      case 'cardNumber':
        isValid = /^(?:\d{4} ){3}\d{3,4}$|^\d{15,16}$/.test(element.value);
        errorMsg = this.labels.errors.invalidFormat;
        break;
      case 'expiry':
        const res = this.expiryValidator(element.value);
        isValid = res.valid;
        errorMsg = res.msg;
        break;
      case 'cvc':
        isValid = /^[0-9]{3,4}$/.test(element.value);
        errorMsg = this.labels.errors.invalidCvc;
        break;
      case 'postalCode':
        const isAlphanumeric = /^\d{5}(-\d{4})?$/.test(element.value);
        isValid = this.validatePostalCode(element.value, isAlphanumeric);
        errorMsg = isAlphanumeric ? '' : this.labels.errors.invalidPostalCode;
        break;
    }
  
    return this.validateField(id, isValid, errorMsg);
  }
  validatePostalCode(postalCode, isAlphanumeric) {
    const isRightLength = postalCode.length > 4 && postalCode.length <= 10;
    return isRightLength && isAlphanumeric;
  }

  markAllTouched() {
    this.isFormValid = true;
    this.inputElements.forEach(id => {
      let status = this.validateSingleField(id); 
      if(!status) {
        this.isFormValid = false;
        return;
      }
    });
  }


  async handleSubmit() {
    await this.markAllTouched();
    if (this.isFormValid) {
      this.processPayment();
    }
  }

  async processPayment() {
    const btn = document.getElementById('submitBtn');
    if(btn.disabled) return ;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${this.labels.processing}`;
    // ToDo: API call to get the token key from stripe/Worldpay/other libraries to generate secure tokens.
    // const paymentPayload = {
    //   cardNumber: document.getElementById('cardNumber').value.trim(),
    //   expiryDate: document.getElementById('expiry').value.trim(),
    //   cvc: document.getElementById('cvc').value.trim(),
    //   postalCode: documentgetElementById('postalCode').trim()
    // }
    // const { token } = await stripe.createToken(cardElement);
    // fetch("/processPayment", { method: 'POST', body: token} ).then((resp)=>{
    //   if(resp) { this.showPaymentSuccess();}
    // }, catch((error)=>{
    // this.showPaymentFailed();
    // }));
    setTimeout(() => {
      btn.disabled = false;
      this.showPaymentSuccess();
    }, 1500);
  }

  showPaymentSuccess() {
    this.cardPaymentFormWrapper.querySelector('.card').innerHTML = `
    <div class="card-body p-5 text-center">
      <i class="bi bi-check-circle-fill display-1" style="color: ${this.themeColor}"></i>
      <h3 class="fw-bold mt-3">${this.labels.paymentConfirmed}</h3>
      <p class="text-muted">${this.labels.successMsg}</p>
      <button class="btn mt-3" style="background-color: ${this.themeColor}; color: white" 
          onclick="location.reload()">${this.labels.done}</button>
    </div>
  `;
  }

  showPaymentFailed() {
    this.cardPaymentFormWrapper.querySelector('.card').innerHTML = `
      <div class="card-body p-5 text-center">
        <i class="bi bi-check-circle-fill display-1" style="color: #d32f2f"></i>
        <h3 class="fw-bold mt-3">Payment Failed</h3>
        <p class="text-muted">The transaction was declined. Please check your card details and try again.</p>
        <button class="btn mt-3" style="background-color: #d32f2f; color: white" 
            onclick="location.reload()">Done</button>
      </div>`;
  }

  loadInitialData() {
    // Here need to make api call with token to get the details from stripe or any other secure vault.
    //For test purpose added test data
    const receiveRespone = {
      cardNumber: '4000056655665556',
      expiry: '12/27',
      postalCode: '06614'
    }
    document.getElementById('cardNumber').value = receiveRespone.cardNumber.match(/.{1,4}/g)?.join(' ') || '';
    document.getElementById('expiry').value = receiveRespone.expiry || '';
    document.getElementById('postalCode').value = receiveRespone.postalCode || '';
  }
}