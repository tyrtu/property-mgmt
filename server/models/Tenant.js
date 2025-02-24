const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  leaseStart: Date,
  leaseEnd: Date,
  rentAmount: Number,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', TenantSchema);