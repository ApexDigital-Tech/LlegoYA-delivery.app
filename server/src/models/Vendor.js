const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  marketName: {
    type: String,
    required: true,
    enum: ['La Cancha', 'Mercado Rodriguez', 'Feria 16 de Julio', 'Mercado Lanza', 'Otro'],
  },
  category: {
    type: String,
    required: true,
    enum: ['Salteñas', 'Jugos', 'Comida Tradicional', 'Frutas/Verduras', 'Abarrotes'],
  },
  description: String,
  imageUrl: String,
  rating: {
    type: Number,
    default: 0
  },
  deliveryTime: {
    type: String,
    default: '20-30 min'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  location: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema);
