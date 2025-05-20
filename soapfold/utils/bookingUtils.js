// Constants
export const RAZORPAY_TEST_KEY = 'rzp_test_KhGe6qjulyJzhZ';
export const RAZORPAY_PROD_KEY = 'YOUR_PROD_KEY'; // Replace with production key

// Default delivery fee
export const DELIVERY_FEE = 5.00;

// Service types
export const SERVICE_TYPES = {
  WASH_FOLD: 'wash_fold',
  DRY_CLEAN: 'dry_clean',
  IRON: 'iron',
  EXPRESS: 'express'
};

// Validation functions
export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
};

export const validateService = (service) => {
  return (
    service &&
    service.id &&
    service.name &&
    validatePrice(service.price) &&
    service.type &&
    Object.values(SERVICE_TYPES).includes(service.type)
  );
};

export const validateQuantity = (quantity) => {
  const numQuantity = parseInt(quantity);
  return !isNaN(numQuantity) && numQuantity > 0;
};

// Price calculation functions
export const calculateBasePrice = (service, quantity) => {
  if (!validateService(service) || !validateQuantity(quantity)) {
    return 0;
  }
  return (parseFloat(service.price) * parseInt(quantity)).toFixed(2);
};

export const calculateAdditionalItemsPrice = (itemCounts, basePrice) => {
  const extraItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);
  return (extraItems * (parseFloat(basePrice) * 0.5)).toFixed(2);
};

export const calculateFinalPrice = (basePrice, additionalItemsPrice) => {
  return (parseFloat(basePrice) + parseFloat(additionalItemsPrice) + DELIVERY_FEE).toFixed(2);
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_SERVICE: 'Invalid service data. Please try again.',
  INVALID_PRICE: 'Invalid price information.',
  INVALID_QUANTITY: 'Please select a valid quantity.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  MISSING_REQUIRED_FIELDS: 'Please fill in all required fields.'
}; 