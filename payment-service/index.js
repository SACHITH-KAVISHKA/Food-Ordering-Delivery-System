const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const stripeRoutes = require('./routes/stripe');
app.use('/payment', stripeRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Stripe Payment Service running on port ${process.env.PORT}`);
});
