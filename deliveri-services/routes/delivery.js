const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken, allowRoles } = require('../utils/authMiddleware');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

// 🚚 Get assigned or available orders
router.get('/orders', verifyToken, allowRoles('delivery'), async (req, res) => {
  try {
    const response = await axios.get(`http://order-service:5003/order/delivery/orders`, {
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
router.get('/all', verifyToken, allowRoles('delivery'), async (req, res) => {
  try {
    const response = await axios.get(`http://order-service:5003/order/delevery/allorders`, {
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


module.exports = router;
