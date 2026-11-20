const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  relation: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    trim: true
  }
}, { _id: false });

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  familyMembers: [familyMemberSchema],
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  updatedBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
memberSchema.index({ name: 'text', phone: 'text' });
memberSchema.index({ city: 1, state: 1 });
memberSchema.index({ isActive: 1 });

module.exports = mongoose.model('members', memberSchema);
