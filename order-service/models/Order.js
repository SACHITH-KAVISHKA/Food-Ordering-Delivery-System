const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: String,
  restaurantId: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-transit', 'delivered'],
    default: 'pending'
  },
  deliveryPersonId: String // Optional, set when assigned
});

module.exports = mongoose.model('Order', orderSchema);
