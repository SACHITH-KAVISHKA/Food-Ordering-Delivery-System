const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken, allowRoles } = require('../utils/authMiddleware');

// 🧑 Customer places an order
router.post('/create', verifyToken, allowRoles('customer'), async (req, res) => {
  const { restaurantId, items } = req.body;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = new Order({
    customerId: req.user.id,
    restaurantId,
    items,
    total,
  });

  await order.save();
  res.status(201).json({ message: 'Order created', order });
});

// 🍽️ Restaurant fetches incoming orders
router.get('/restaurant', verifyToken, allowRoles('restaurant'), async (req, res) => {
  const orders = await Order.find({ restaurantId: req.user.id });
  res.json(orders);
});

// 🚴 Delivery person fetches all "in-transit" or assigned orders
router.get('/delivery', verifyToken, allowRoles('delivery'), async (req, res) => {
  const orders = await Order.find({
    $or: [
      { status: 'in-transit', deliveryPersonId: req.user.id },
      { status: 'accepted' }
    ]
  });
  res.json(orders);
});

// ✅ Restaurant updates status (e.g., accepted)
router.patch('/status/:id', verifyToken, allowRoles('restaurant', 'delivery'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatus = ['accepted', 'in-transit', 'delivered'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const update = { status };

  // If a delivery person is marking it in-transit, record their ID
  if (req.user.role === 'delivery' && status === 'in-transit') {
    update.deliveryPersonId = req.user.id;
  }

  await Order.findByIdAndUpdate(id, update);
  res.json({ message: 'Order status updated' });
});

module.exports = router;
