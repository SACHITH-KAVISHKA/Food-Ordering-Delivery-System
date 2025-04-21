const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const deliveryRoutes = require('./routes/delivery');
app.use('/delivery', deliveryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Delivery Service running on port ${process.env.PORT}`);
});
