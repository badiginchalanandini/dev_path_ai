// Validation and Security Helper Rules

// 1. Email Format Validator
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 2. Strong Password Validator
// Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const validateStrongPassword = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long.'
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number (0-9).' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*).' };
  }

  return { isValid: true, message: 'Password is strong.' };
};

module.exports = {
  validateEmail,
  validateStrongPassword
};
