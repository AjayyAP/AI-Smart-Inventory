export const passwordMessage = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const isValidPhone = (value) => /^[0-9+\-\s()]{7,20}$/.test(String(value || '').trim());

export const isStrongPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(String(value || ''));

export const requiredMessage = (label) => `${label} is required.`;
