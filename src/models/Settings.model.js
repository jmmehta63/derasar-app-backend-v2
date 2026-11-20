const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  templeName: {
    type: String
  },
  templeAddress: {
    type: String
  },
  trustRegistrationNumber: {
    type: String
  },
  categories: {
    type: [String]
  },
  subCategories: {
    type: Object,
    default: {
      name: String,
      criteria: String
    },
  },
  paymentModes: {
    type: [String]
  },
  statuses: {
    type: [String]
  },
  states: {
    type: [String]
  },
  cities: {
    type: [String]
  },
  constants: {
      type: Object,
      schema: {
        manPrice: String
      }
  },
  relations: {
    type: [String]
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('settings', settingsSchema);
