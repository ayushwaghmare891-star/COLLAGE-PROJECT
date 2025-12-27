import { Discount } from '../models/Discount.js';

export const createDiscount = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minPurchaseAmount, maxDiscount, usageLimit, startDate, endDate } = req.body;

    const discount = new Discount({
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      createdBy: req.userId,
    });

    await discount.save();
    res.status(201).json({ message: 'Discount created successfully', discount });
  } catch (error) {
    res.status(500).json({ message: 'Error creating discount', error: error.message });
  }
};

export const getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find({ isActive: true });
    res.json({ discounts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discounts', error: error.message });
  }
};

export const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    res.json({ discount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discount', error: error.message });
  }
};

export const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: 'Discount updated successfully', discount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating discount', error: error.message });
  }
};

export const deleteDiscount = async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting discount', error: error.message });
  }
};

export const verifyDiscount = async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;

    const discount = await Discount.findOne({ code, isActive: true });

    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found or expired' });
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({ message: 'Discount code usage limit exceeded' });
    }

    if (purchaseAmount < discount.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase amount is ${discount.minPurchaseAmount}` });
    }

    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = (purchaseAmount * discount.discountValue) / 100;
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else {
      discountAmount = discount.discountValue;
    }

    res.json({
      message: 'Discount verified successfully',
      discount: {
        code: discount.code,
        discountAmount,
        finalAmount: purchaseAmount - discountAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying discount', error: error.message });
  }
};
