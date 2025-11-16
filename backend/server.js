const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./config/db');
const vehiclesRouter = require('./routes/vehicles');
const bookingsRouter = require('./routes/bookings');
const adminRouter = require('./routes/admin');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);

// Try two places for public folder (works for both local dev and Render)
const candidate1 = path.join(__dirname, 'public');        // backend/public
const candidate2 = path.join(__dirname, '..', 'public'); // root/public

let PUBLIC_DIR;
if (fs.existsSync(candidate1)) {
  PUBLIC_DIR = candidate1;
} else if (fs.existsSync(candidate2)) {
  PUBLIC_DIR = candidate2;
} else {
  console.error('No public directory found. Tried:', candidate1, candidate2);
  // Set PUBLIC_DIR to candidate1 so server still starts (404s will appear for static files)
  PUBLIC_DIR = candidate1;
}

app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'), err => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 BikeNest running on http://localhost:${PORT}`));