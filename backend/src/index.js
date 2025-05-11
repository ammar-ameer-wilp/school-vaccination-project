const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const studentVaccinationRoutes = require('./routes/studentVaccinationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const app = express();
const PORT = process.env.PORT || '5000';

app.use(cors());
app.use(express.json());

const pool = require('./db');

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'OK',
      db: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error('Health check DB error:', err);
    res.status(500).json({
      status: 'FAIL',
      db: 'Not connected',
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/api/user', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/vaccination', vaccinationRoutes);
app.use('/api/drives', studentVaccinationRoutes);
app.use('/api/dashboard', dashboardRoutes);
