const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { verifyToken, allowRoles } = require('../utils/authMiddleware');

// Create restaurant profile
router.post('/profile', verifyToken, allowRoles('restaurant'), async (req, res) => {
  const { name } = req.body;
  const restaurant = new Restaurant({ name, ownerId: req.user.id, isOpen: true });
  await restaurant.save();
  res.send({ message: 'Restaurant profile created', restaurant });
});

// Add menu item
router.post('/menu', verifyToken, allowRoles('restaurant'), async (req, res) => {
  const { name, description, price } = req.body;
  const item = new MenuItem({ name, description, price, restaurantId: req.user.id });
  await item.save();
  res.send({ message: 'Menu item added', item });
});

// View own menu items
router.get('/menu', verifyToken, allowRoles('restaurant'), async (req, res) => {
  const items = await MenuItem.find({ restaurantId: req.user.id });
  res.send(items);
});

// Delete a menu item
router.delete('/menu/:id', verifyToken, allowRoles('restaurant'), async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.send({ message: 'Menu item deleted' });
});

module.exports = router;
