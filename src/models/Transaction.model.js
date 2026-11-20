const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  memberType: {
    type: String,
    enum: ['member', 'non-member'],
    default: 'member'
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'members',
    required: function() {
      return this.memberType === 'member';
    },
    index: true,
    // Allow null/undefined for non-member transactions
    default: undefined
  },
  familyMemberName: {
    type: String,
    required: function() {
      return this.memberType === 'member';
    },
    trim: true,
    default: undefined
  },
  nonMemberName: {
    type: String,
    trim: true,
    required: function() {
      return this.memberType === 'non-member' && this.transactionType === 'IN';
    }
  },
  nonMemberPhone: {
    type: String,
    trim: true,
    required: function() {
      return this.memberType === 'non-member' && this.transactionType === 'IN';
    }
  },
  categoryItems: [{
    category: {
      type: String,
      trim: true
    },
    subCategory: {
      type: String,
      trim: true
    },
    criteria: {
      type: String,
      enum: ['rupees', 'man'],
      default: 'rupees'
    },
    numberOfMan: {
      type: Number,
      min: 0,
      default: 0
    },
    pricePerMan: {
      type: Number,
      min: 0,
      default: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  // Legacy fields - kept for backward compatibility
  category: {
    type: String,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  man: {
    type: Number,
    min: 0
  },
  manRate: {
    type: Number,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMode: {
    type: String,
    enum: ['', 'Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']
  },
  transactionReference: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Cancelled', 'Rejected'],
    default: 'Pending',
    index: true
  },
  paidDate: {
    type: Date,
    required: function() {
      return this.status === 'Paid';
    }
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  transactionType: {
    type: String,
    enum: ['IN', 'OUT'],
    required: true
  },
  otherDetails: {
    type: String,
    trim: true
  },
  fileAttachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: String
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ status: 1, transactionDate: -1 });
transactionSchema.index({ memberName: 'text', transactionNumber: 'text' });

// Auto-generate transaction number if not provided
transactionSchema.pre('save', async function (next) {
  if (!this.transactionNumber) {
    const count = await mongoose.model('transactions').countDocuments();
    this.transactionNumber = `INV-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('transactions', transactionSchema);
