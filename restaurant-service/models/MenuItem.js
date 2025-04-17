const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  restaurantId: String,
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
