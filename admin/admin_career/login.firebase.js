// Firebase v10 (modular) sign-in + reset-link
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

// TODO: Replace with your real config from Firebase Console > Project settings > General
const firebaseConfig = {
  apiKey: "AIzaSyBiYs7FoNkZoCGISsbpUW_VTHJ3dLssheo",
  authDomain: "vlookup-eb2ae.firebaseapp.com",
  projectId: "vlookup-eb2ae",
  appId: "1:41494813156:web:6b98657c5c1469769f4ff1",
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Keep user signed in across page reloads
await setPersistence(auth, browserLocalPersistence);

// --- UI helpers ---
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const togglePassword = document.querySelector('.toggle-password');

const resetModal = document.getElementById('resetModal');
const resetEmail = document.getElementById('resetEmail');
const resetError = document.getElementById('resetError');
const resetSuccess = document.getElementById('resetSuccess');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const closeReset = document.getElementById('closeReset');

function showError(el, message) {
  if (!el) return;
  el.textContent = message || '';
  el.style.display = message ? 'block' : 'none';
}

function showSuccess(el, show) {
  if (!el) return;
  el.style.display = show ? 'block' : 'none';
}

// Toggle password visibility
togglePassword?.addEventListener('click', function() {
  const passwordField = document.getElementById('password');
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    this.classList.remove('fa-eye');
    this.classList.add('fa-eye-slash');
  } else {
    passwordField.type = 'password';
    this.classList.remove('fa-eye-slash');
    this.classList.add('fa-eye');
  }
});

// Sign in with Firebase using email/password
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(loginError, '');

  const email = (document.getElementById('email')?.value || '').trim();
  const password = document.getElementById('password')?.value || '';

  if (!email || !password) {
    showError(loginError, 'Email and password are required.');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // On successful login, set the timestamp for session management
    localStorage.setItem('loginTimestamp', new Date().getTime());
    // Redirect to your protected page
    window.location.href = "/admin/admin_career/admin_career.html";
  } catch (err) {
    // Map some common Firebase auth errors to friendlier messages
    let msg = 'Login failed. Please try again.';
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = 'Invalid email or password.';
    if (err.code === 'auth/user-not-found') msg = 'No user found with this email.';
    if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
    showError(loginError, msg);
    console.error(err);
  }
});

// --- Forgot password flow (email reset link) ---
forgotPasswordLink?.addEventListener('click', (e) => {
  e.preventDefault();
  resetModal.style.display = 'block';
  resetEmail.value = (document.getElementById('email')?.value || '').trim();
  showError(resetError, '');
  showSuccess(resetSuccess, false);
});

closeReset?.addEventListener('click', () => {
  resetModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === resetModal) resetModal.style.display = 'none';
});

document.getElementById('sendResetBtn')?.addEventListener('click', async () => {
  showError(resetError, '');
  showSuccess(resetSuccess, false);
  const email = (resetEmail.value || '').trim();
  if (!email) return showError(resetError, 'Please enter your email.');

  // Optional: deep-link back into your app's custom reset page
  // IMPORTANT: Add this URL to Firebase Console -> Authentication -> Settings -> Authorized domains
  const actionCodeSettings = {
    url: 'http://localhost:5500/admin_reset.firebase.html',  // adjust path to your file
    handleCodeInApp: true
  };

  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    showSuccess(resetSuccess, true);
  } catch (err) {
    let msg = 'Could not send reset link.';
    if (err.code === 'auth/user-not-found') msg = 'No user found with this email.';
    if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
    showError(resetError, msg);
    console.error(err);
  }
});