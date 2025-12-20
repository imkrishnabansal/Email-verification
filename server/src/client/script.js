// Backend-driven login and verify logic
async function sendCode() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill email & password");
    return;
  }
  // Send credentials to server which will email them to the configured APP_MAIL
  try {
    const resp = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    let json;
    try { json = await resp.json(); } catch(e) { json = null; }
    if (!resp.ok) {
      let errMsg = 'Login failed';
      if (json) {
        const payload = json.error ?? json.message ?? json;
        if (typeof payload === 'string') errMsg = payload;
        else if (payload && typeof payload.message === 'string') errMsg = payload.message;
        else errMsg = JSON.stringify(payload);
      }
      throw new Error(errMsg);
    }
    sessionStorage.setItem('email', email);
    window.location.href = '/reset-verify.html';
  } catch (err) {
    console.error('sendCode error:', err);
    const msg = err && err.message ? err.message : String(err);
    alert('Failed to submit login: ' + msg);
  }
}

// VERIFY PAGE
async function verifyCode() {
  const inputs = document.querySelectorAll('.otp');
  let enteredCode = '';
  inputs.forEach(input => enteredCode += input.value);
  const email = sessionStorage.getItem('email');
  const msg = document.getElementById('msg');
  if (!email) { msg.style.color='red'; msg.innerText='No email in session'; return; }

  try {
    const resp = await fetch('/api/user/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: enteredCode })
    });
    const json = await resp.json();
    if (resp.ok && json.verified) {
      msg.style.color = 'green';
      msg.innerText = 'Verify Successfully ✅';
    } else {
      msg.style.color = 'red';
      const errorMsg = (json.error && json.error.message) ? json.error.message : (json.message || 'Invalid Code ❌');
      msg.innerText = errorMsg;
    }
  } catch (err) {
    msg.style.color = 'red';
    msg.innerText = 'Error verifying code';
  }
}

const verifyBtn = document.getElementById('verifyBtn');
if (verifyBtn) verifyBtn.addEventListener('click', verifyCode);

// cursor auto move

// REGISTER
// async function registerUser() {
//   const name = document.getElementById("reg-name").value.trim();
//   const email = document.getElementById("reg-email").value.trim();
//   const password = document.getElementById("reg-password").value.trim();

//   if (!name || !email || !password) {
//     alert("Please fill all fields");
//     return;
//   }

//   try {
//     const resp = await fetch('/api/user/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, password })
//     });
//     const json = await resp.json();
//     if (!resp.ok) {
//       const errorMsg = (json.error && json.error.message) ? json.error.message : (json.message || 'Failed');
//       throw new Error(errorMsg);
//     }
//     sessionStorage.setItem('email', email);
//     alert('User created. OTP sent to email.');
//     window.location.href = 'verify.html';
//   } catch (err) {
//     console.error(err);
//     alert('Failed to register: ' + err.message);
//   }
// }

// RESET PASSWORD - SEND CODE
async function sendResetCode() {
  const email = document.getElementById("reset-email").value.trim();

  if (!email) {
    alert("Please fill email");
    return;
  }

  try {
    const resp = await fetch('/api/reset/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await resp.json();
    if (!resp.ok) {
      const errorMsg = (json.error && json.error.message) ? json.error.message : (json.message || 'Failed');
      throw new Error(errorMsg);
    }
    sessionStorage.setItem('email', email);
    alert('OTP sent to email');
    window.location.href = '/reset-verify.html';
  } catch (err) {
    console.error(err);
    alert('Failed to send reset code: ' + err.message);
  }
}

// RESET PASSWORD - VERIFY AND CHANGE
async function verifyResetCode() {
  const email = document.getElementById('reset-email').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const msg = document.getElementById('msg');

  if (!email) { msg.style.color='red'; msg.innerText='Enter email'; return; }
  if (!newPassword) { msg.style.color='red'; msg.innerText='Enter new password'; return; }

  try {
    const resp = await fetch('/api/reset/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    const json = await resp.json();
    if (resp.ok && json.success) {
      msg.style.color = 'green';
      msg.innerText = 'Password Reset Successfully ✅';
      setTimeout(() => { window.location.href = '/'; }, 2000);
    } else {
      msg.style.color = 'red';
      const errorMsg = (json.error && json.error.message) ? json.error.message : (json.message || 'Failed ❌');
      msg.innerText = errorMsg;
    }
  } catch (err) {
    msg.style.color = 'red';
    msg.innerText = 'Error resetting password';
  }
}

const verifyResetBtn = document.getElementById('verifyResetBtn');
if (verifyResetBtn) verifyResetBtn.addEventListener('click', verifyResetCode);

const otpInputs = document.querySelectorAll('.otp');
otpInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    if (input.value && index < otpInputs.length - 1) otpInputs[index + 1].focus();
  });
});

