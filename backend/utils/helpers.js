import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password, hash) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

export const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate 6-character alphanumeric OTP
export const generateAlphanumericOTP = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generateCouponCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const calculateAnalytics = (offers) => {
  return {
    totalOffers: offers.length,
    activeOffers: offers.filter(o => o.isActive).length,
    totalRedemptions: offers.reduce((sum, o) => sum + o.currentRedemptions, 0),
    totalDiscount: offers.reduce((sum, o) => sum + (o.discount || 0), 0),
  };
};
