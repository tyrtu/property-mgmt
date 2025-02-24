// server/models/Property.js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  units: { type: Number, required: true },
  occupiedUnits: { type: Number, default: 0 },
  rentAmount: Number,
  amenities: [String],
  status: { 
    type: String, 
    enum: ['Vacant', 'Occupied'],
    default: 'Vacant'
  },
  photos: [String]
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);