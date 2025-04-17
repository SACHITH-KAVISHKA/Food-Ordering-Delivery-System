const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Restaurant DB connected'))
  .catch(err => console.error('Mongo Error:', err));

const restaurantRoutes = require('./routes/restaurant');
app.use('/restaurant', restaurantRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Restaurant Service running on port ${process.env.PORT}`);
});
