// ================= LOGIN PAGE =================
function sendCode() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill email & password");
    return;
  }

  const code = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  console.log("Generated OTP:", code); // debug console

  // Store in sessionStorage
  sessionStorage.setItem("otp", code);
  sessionStorage.setItem("email", email);

  // Send Email using EmailJS
  emailjs.send("service_qylo9xu", "template_aj1yt9g", {
    to_email: email,
    code: code
  })
  .then(() => {
    alert("6 digit code sent to email");
    window.location.href = "verify.html";
  })
  .catch(err => {
    console.error("EmailJS Error:", err);
    alert("Failed to send email. Check console for error");
  });
}

// ================= VERIFY PAGE =================
function verifyCode() {
  const inputs = document.querySelectorAll(".otp");
  let enteredCode = "";

  inputs.forEach(input => {
    enteredCode += input.value;
  });

  const storedCode = sessionStorage.getItem("otp");
  const msg = document.getElementById("msg");

  if (enteredCode === storedCode) {
    msg.style.color = "green";
    msg.innerText = "Verify Successfully ✅";
  } else {
    msg.style.color = "red";
    msg.innerText = "Invalid Code ❌";
  }
}

// Button listener for verify
const verifyBtn = document.getElementById("verifyBtn");
if (verifyBtn) {
  verifyBtn.addEventListener("click", verifyCode);
}

// ================= AUTO MOVE CURSOR =================
const otpInputs = document.querySelectorAll(".otp");
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
});
