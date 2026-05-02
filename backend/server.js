require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
