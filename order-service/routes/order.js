const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken, allowRoles } = require('../utils/authMiddleware');
const axios = require('axios');
const NOTIFY_SERVICE_URL = process.env.NOTIFY_SERVICE_URL;

  // 🏢 Customer fetches all restaurants
  // /order/restaurants
  router.get('/restaurants', verifyToken, allowRoles('customer'), async (req, res) => {
    console.log('Fetching all restaurants...');
    try {
      const response = await axios.get(`http://restaurant-service:5002/restaurant/api/restaurants`);
      res.json(response.data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err.message);
      res.status(500).json({ message: 'Failed to fetch restaurants' });
    }
  });

  router.get('/restaurant/:restaurantId/menu', verifyToken, allowRoles('customer'), async (req, res) => {
    const { restaurantId } = req.params;
  
    try {
      // Assuming you're fetching the menu from the restaurant service
      const response = await axios.get(`http://restaurant-service:5002/restaurant/${restaurantId}/menu`);
      res.json(response.data);  // Return the menu items to the client
    } catch (err) {
      console.error('Failed to fetch menu items:', err.message);
      res.status(500).json({ message: 'Failed to fetch menu items' });
    }
  });
  

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

// get orders
// /order/orders
router.get('/customer/orders', verifyToken, allowRoles('customer'), async (req, res) => {
  const orders = await Order.find({ customerId: req.user.id });
  res.json(orders);
});

router.get('/delevery/allorders', verifyToken, allowRoles('delivery'), async (req, res) => {
  const orders = await Order.find({ status: { $ne: 'delivered' } });
  res.json(orders);
});

router.get('/delivery/orders', verifyToken, allowRoles('delivery'), async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          $or: [
            { status: 'in-transit', deliveryPersonId: req.user.id },
            { status: 'accepted' }
          ]
        }
      },
      {
        $lookup: {
          from: 'users', // Name of the User collection
          localField: 'deliveryPersonId',
          foreignField: '_id',
          as: 'deliveryPerson'
        }
      },
      {
        $unwind: {
          path: '$deliveryPerson',
          preserveNullAndEmptyArrays: true // Keep orders without deliveryPersonId
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          items: 1,
          total: 1,
          createdAt: 1,
          deliveryPersonId: 1,
          deliveryPersonName: '$deliveryPerson.username' 
        }
      }
    ]);

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error fetching delivery orders' });
  }
});

// 🍽️ Restaurant fetches incoming orders
router.get('/restaurant', verifyToken, allowRoles('restaurant'), async (req, res) => {
  const restaurantId = axios.get('http://restaurant-service:5002/restaurant/api/restaurants-id', {
    headers: { Authorization: req.headers.authorization }
  });
  console.log('Restaurant ID:', restaurantId.data);
  // const orders = await Order.find({ restaurantId: req.user.id });
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

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;

  if (req.user.role === 'delivery' && status === 'in-transit') {
    order.deliveryPersonId = req.user.id;
  }

  await order.save();

  // 🔔 Notify customer based on status
  const fakeCustomerPhone = '+94761111222';
  const fakeCustomerEmail = 'customer@example.com';

  try {
    if (status === 'accepted') {
      await axios.post(`${NOTIFY_SERVICE_URL}/notify/email`, {
        to: fakeCustomerEmail,
        subject: 'Your order has been accepted!',
        text: `Your order is now being prepared and will be delivered soon.`
      });
    }

    if (status === 'in-transit') {
      await axios.post(`${NOTIFY_SERVICE_URL}/notify/sms`, {
        to: fakeCustomerPhone,
        message: `🚴 Your delivery is now on the way!`
      });
    }

    if (status === 'delivered') {
      await axios.post(`${NOTIFY_SERVICE_URL}/notify/email`, {
        to: fakeCustomerEmail,
        subject: 'Order Delivered!',
        text: 'Your order has been delivered. Enjoy your meal!'
      });

      await axios.post(`${NOTIFY_SERVICE_URL}/notify/sms`, {
        to: fakeCustomerPhone,
        message: `📦 Your order has been delivered. Bon appétit!`
      });
    }
  } catch (err) {
    console.error('Failed to notify user:', err.message);
  }

  res.json({ message: 'Order status updated and user notified' });
});

module.exports = router;
