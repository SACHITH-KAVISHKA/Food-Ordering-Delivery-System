const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Order DB connected'))
  .catch(err => console.error('Mongo Error:', err));

const orderRoutes = require('./routes/order');
app.use('/order', orderRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Order Service running on port ${process.env.PORT}`);
});
