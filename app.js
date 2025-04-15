// Configuration
const backendUrl = 'https://your-heroku-app.herokuapp.com'; // Replace with your Heroku URL

// DOM Elements
const paymentForm = document.getElementById('paymentForm');
const payButton = document.getElementById('payButton');
const emailInput = document.getElementById('email');
const amountInput = document.getElementById('amount');

// Handle form submission
paymentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value;
  const amount = amountInput.value;
  
  if (!email || !amount) {
    showError('Please fill in all fields');
    return;
  }

  payButton.disabled = true;
  payButton.textContent = 'Processing...';

  try {
    const response = await initializePayment(email, amount);
    if (response.authorization_url) {
      window.location.href = response.authorization_url;
    } else {
      showError('Payment initialization failed');
    }
  } catch (error) {
    console.error('Error:', error);
    showError('An error occurred. Please try again.');
  } finally {
    payButton.disabled = false;
    payButton.textContent = 'Pay Now';
  }
});

// Initialize payment with backend
async function initializePayment(email, amount) {
  const response = await fetch(`${backendUrl}/api/paystack/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, amount })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return await response.json();
}

// Check for payment verification on page load
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get('reference');

  if (reference) {
    verifyPayment(reference);
  }
});

// Verify payment with backend
async function verifyPayment(reference) {
  try {
    const response = await fetch(`${backendUrl}/api/paystack/verify/${reference}`);
    const data = await response.json();

    if (data.status === 'success') {
      // Redirect to success page or show success message
      window.location.href = 'payment-success.html';
    } else {
      showError('Payment verification failed');
    }
  } catch (error) {
    console.error('Verification error:', error);
    showError('Error verifying payment');
  }
}

// Show error message
function showError(message) {
  let errorElement = document.getElementById('error-message');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    paymentForm.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
}
