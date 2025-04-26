const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

// 🧾 Create payment (simulate success)
router.post('/create', async (req, res) => {
  const { orderId, amount, method } = req.body;

  if (!orderId || !amount || !method) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const paymentId = uuidv4();

  // Simulate processing delay
  setTimeout(async () => {
    console.log(`✅ Payment successful for Order: ${orderId}`);

    // Simulate order update call
    try {
      await axios.patch(`${ORDER_SERVICE_URL}/order/status/${orderId}`, {
        status: 'paid' // optional — your Order schema must support this or store separately
      });
    } catch (err) {
      console.error('Order Service update failed:', err.message);
    }
  }, 2000);

  res.status(201).json({
    message: 'Payment successful',
    paymentId,
    orderId,
    status: 'paid'
  });
});

module.exports = router;
