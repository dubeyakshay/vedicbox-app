// Input validation and sanitization utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9\-\+\(\)\s]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^[0-9]{5,}$/;
  return zipRegex.test(zipCode);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 500); // Limit length
};

export const validateCartItem = (quantity: number): boolean => {
  return quantity > 0 && quantity <= 999 && Number.isInteger(quantity);
};

export const validateCouponCode = (code: string): boolean => {
  return /^[A-Z0-9]{3,20}$/.test(code.toUpperCase());
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount < 1000000;
};
