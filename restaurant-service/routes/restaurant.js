const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { verifyToken, allowRoles } = require('../utils/authMiddleware');

///restaurant/api/restaurants
router.get('/api/restaurants', async (req, res) => {
 
  try {
    const restaurants = await Restaurant.find(); // You can add filters if needed
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurants:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/api/restaurants-id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log('Logged-in user ID:', userId);

    const restaurants = await Restaurant.find({ ownerId: userId });
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurant IDs:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:restaurantId/menu', async (req, res) => {
  const { restaurantId } = req.params;
  console.log('Fetching menu for restaurant:', restaurantId);

  try {
    // Fetch restaurant by hardcoded ID (or dynamically use the passed restaurantId)
    const restaurant = await Restaurant.findById(restaurantId);
    console.log('Restaurant found:', restaurant);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Fetch menu items for the specific restaurant
    const menuItems = await MenuItem.find({ restaurantId: restaurant._id });
    console.log('Menu Items:', menuItems);

    if (menuItems.length === 0) {
      return res.status(404).json({ message: 'No menu items found for this restaurant' });
    }

    res.json(menuItems);  // Return the menu items
  } catch (err) {
    console.error('Error fetching menu:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Create restaurant profile
router.post('/profile', verifyToken, allowRoles('restaurant'), async (req, res) => {
  try {
    const { name } = req.body;
    const restaurant = new Restaurant({ name, ownerId: req.user.id, isOpen: true });
    await restaurant.save();
    res.send({ message: 'Restaurant profile created', restaurant });
  } catch (err) {
    console.error('Error in /restaurant/profile:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Add menu item
router.post('/menu', verifyToken, allowRoles('restaurant'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const item = new MenuItem({ name, description, price, restaurantId: req.user.id });
    await item.save();
    res.send({ message: 'Menu item added', item });
  } catch (err) {
    console.error('Error in /restaurant/menu:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// View own menu items
router.get('/menu', verifyToken, allowRoles('restaurant'), async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.user.id });
    res.send(items);
  } catch (err) {
    console.error('Error in /restaurant/menu GET:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Delete a menu item
router.delete('/menu/:id', verifyToken, allowRoles('restaurant'), async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.send({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('Error in /restaurant/menu/:id DELETE:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});



module.exports = router;
