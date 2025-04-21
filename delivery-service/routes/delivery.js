const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken, allowRoles } = require('../utils/authMiddleware');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

// 🚚 Get assigned or available orders
router.get('/orders', verifyToken, allowRoles('delivery'), async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/order/delivery`, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error fetching delivery orders' });
  }
});

// ✅ Update delivery status
router.patch('/order/:id', verifyToken, allowRoles('delivery'), async (req, res) => {
  try {
    const response = await axios.patch(`${ORDER_SERVICE_URL}/order/status/${req.params.id}`, req.body, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;
