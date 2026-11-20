const { body, validationResult } = require('express-validator');

exports.validateTransaction = [
  body('memberType').optional().isIn(['member', 'non-member']).withMessage('Member type must be either "member" or "non-member"'),
  
  // Conditional validation for member type
  body('memberId').custom((value, { req }) => {
    if (req.body.memberType === 'member' || !req.body.memberType) {
      if (!value) throw new Error('Member ID is required for member transactions');
    }
    return true;
  }),
  
  body('familyMemberName').custom((value, { req }) => {
    if (req.body.memberType === 'member' || !req.body.memberType) {
      if (!value || value.trim() === '') throw new Error('Family member name is required for member transactions');
    }
    return true;
  }),
  
  // Conditional validation for non-member type
  body('nonMemberName').custom((value, { req }) => {
    if (req.body.memberType === 'non-member' && req.body.transactionType === 'IN') {
      if (!value || value.trim() === '') throw new Error('Non-member name is required for non-member IN transactions');
    }
    return true;
  }),
  
  body('nonMemberPhone').custom((value, { req }) => {
    if (req.body.memberType === 'non-member' && req.body.transactionType === 'IN') {
      if (!value || value.trim() === '') throw new Error('Non-member phone is required for non-member IN transactions');
    }
    return true;
  }),
  
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('paymentMode').isIn(['', 'Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']).withMessage('Invalid payment mode'),
  body('status').isIn(['Pending', 'Paid', 'Cancelled', 'Rejected']).withMessage('Invalid status'),
  body('transactionDate').optional().isISO8601().withMessage('Invalid date format'),
  
  // Validate categoryItems array if provided
  body('categoryItems').optional().isArray().withMessage('Category items must be an array'),
  body('categoryItems.*.category').optional().trim().isString().withMessage('Category must be a string'),
  body('categoryItems.*.subCategory').optional().trim().isString().withMessage('SubCategory must be a string'),
  body('categoryItems.*.criteria').optional().isIn(['rupees', 'man']).withMessage('Criteria must be either "rupees" or "man"'),
  body('categoryItems.*.numberOfMan').optional().isNumeric().withMessage('Number of man must be a number'),
  body('categoryItems.*.pricePerMan').optional().isNumeric().withMessage('Price per man must be a number'),
  body('categoryItems.*.amount').isNumeric().withMessage('Amount must be a number'),
  
  // Validate otherDetails if provided
  body('otherDetails').optional().trim().isString().withMessage('Other details must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateTransactionUpdate = [
  // For updates, all fields are optional but must be valid if provided
  body('memberType').optional().isIn(['member', 'non-member']).withMessage('Member type must be either "member" or "non-member"'),
  
  body('memberId').optional().custom((value, { req }) => {
    if (req.body.memberType === 'member' && !value) {
      throw new Error('Member ID is required for member transactions');
    }
    return true;
  }),
  
  body('familyMemberName').optional().custom((value, { req }) => {
    if (req.body.memberType === 'member' && (!value || value.trim() === '')) {
      throw new Error('Family member name is required for member transactions');
    }
    return true;
  }),
  
  body('nonMemberName').optional().trim().isString().withMessage('Non-member name must be a string'),
  body('nonMemberPhone').optional().trim().isString().withMessage('Non-member phone must be a string'),
  
  body('totalAmount').optional().isNumeric().withMessage('Total amount must be a number'),
  body('paymentMode').optional().isIn(['', 'Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']).withMessage('Invalid payment mode'),
  body('status').optional().isIn(['Pending', 'Paid', 'Cancelled', 'Rejected']).withMessage('Invalid status'),
  body('transactionDate').optional().isISO8601().withMessage('Invalid date format'),
  
  // Validate categoryItems array if provided
  body('categoryItems').optional().isArray().withMessage('Category items must be an array'),
  body('categoryItems.*.category').optional().trim().isString().withMessage('Category must be a string'),
  body('categoryItems.*.subCategory').optional().trim().isString().withMessage('SubCategory must be a string'),
  body('categoryItems.*.criteria').optional().isIn(['rupees', 'man']).withMessage('Criteria must be either "rupees" or "man"'),
  body('categoryItems.*.numberOfMan').optional().isNumeric().withMessage('Number of man must be a number'),
  body('categoryItems.*.pricePerMan').optional().isNumeric().withMessage('Price per man must be a number'),
  body('categoryItems.*.amount').optional().isNumeric().withMessage('Amount must be a number'),
  
  // Validate otherDetails if provided
  body('otherDetails').optional().trim().isString().withMessage('Other details must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
