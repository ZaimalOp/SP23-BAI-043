document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('checkoutForm');
    const resetButton = document.getElementById('resetButton');
  
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors();
  
      const validations = [
        validateFullName(),
        validateEmail(),
        validatePhone(),
        validateAddress(),
        validateCardNumber(),
        validateExpiryDate(),
        validateCvv()
      ];
  
      if (validations.every(Boolean)) {
        alert('Order placed successfully!');
        form.reset();
        clearErrors();
      }
    });
  
    resetButton.addEventListener('click', () => {
      form.reset();
      clearErrors();
    });
  
    function clearErrors() {
      document.querySelectorAll('.error').forEach(e => e.textContent = '');
    }
  
    function validateFullName() {
      const field = document.getElementById('fullName');
      const error = document.getElementById('fullNameError');
      if (!field.value.trim()) {
        error.textContent = 'Full name is required';
        return false;
      }
      if (!/^[A-Za-z ]+$/.test(field.value)) {
        error.textContent = 'Only alphabets and spaces are allowed';
        return false;
      }
      return true;
    }
  
    function validateEmail() {
      const field = document.getElementById('email');
      const error = document.getElementById('emailError');
      if (!field.value.trim()) {
        error.textContent = 'Email is required';
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        error.textContent = 'Invalid email address';
        return false;
      }
      return true;
    }
  
    function validatePhone() {
      const field = document.getElementById('phone');
      const error = document.getElementById('phoneError');
      if (!field.value.trim()) {
        error.textContent = 'Phone number is required';
        return false;
      }
      if (!/^\d{10,15}$/.test(field.value)) {
        error.textContent = 'Phone number must be 10 to 15 digits';
        return false;
      }
      return true;
    }
  
    function validateAddress() {
      const field = document.getElementById('address');
      const error = document.getElementById('addressError');
      if (!field.value.trim()) {
        error.textContent = 'Address is required';
        return false;
      }
      return true;
    }
  
    function validateCardNumber() {
      const field = document.getElementById('cardNumber');
      const error = document.getElementById('cardNumberError');
      if (!/^\d{16}$/.test(field.value)) {
        error.textContent = 'Card number must be exactly 16 digits';
        return false;
      }
      return true;
    }
  
    function validateExpiryDate() {
      const field = document.getElementById('expiryDate');
      const error = document.getElementById('expiryDateError');
      if (!field.value) {
        error.textContent = 'Expiry date is required';
        return false;
      }
      const selectedDate = new Date(field.value);
      const today = new Date();
      selectedDate.setDate(1);
      today.setDate(1);
      if (selectedDate <= today) {
        error.textContent = 'Expiry must be in the future';
        return false;
      }
      return true;
    }
  
    function validateCvv() {
      const field = document.getElementById('cvv');
      const error = document.getElementById('cvvError');
      if (!/^\d{3}$/.test(field.value)) {
        error.textContent = 'CVV must be exactly 3 digits';
        return false;
      }
      return true;
    }
  });
  