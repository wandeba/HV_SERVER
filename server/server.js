const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Database  connections 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Import routes
const riderRoutes = require('./routes/riders');
const stationRoutes = require('./routes/stations');
const transactionRoutes = require('./routes/transactions');

app.use('/api/riders', riderRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/transactions', transactionRoutes);

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [ridersCount, stationsCount, transactionsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM riders WHERE status = $1', ['active']),
      pool.query('SELECT COUNT(*) FROM fuel_stations WHERE status = $1', ['active']),
      pool.query(`SELECT COUNT(*) FROM fuel_purchases WHERE DATE(created_at) = CURRENT_DATE`)
    ]);

    res.json({
      success: true,
      data: {
        totalRiders: parseInt(ridersCount.rows[0].count),
        activeStations: parseInt(stationsCount.rows[0].count),
        todayTransactions: parseInt(transactionsCount.rows[0].count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Halal Ventures API is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Halal Ventures Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
