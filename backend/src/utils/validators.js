const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const isValidEmail = (value) => emailRegex.test(String(value || '').trim());

const isValidPhone = (value) => phoneRegex.test(String(value || '').trim());

const isStrongPassword = (value) => strongPasswordRegex.test(String(value || ''));

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

module.exports = {
  badRequest,
  isBlank,
  isStrongPassword,
  isValidEmail,
  isValidPhone,
};
