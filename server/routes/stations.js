const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get all stations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT station_id, station_name, location, airtel_money_number, contact_person, status, created_at
      FROM fuel_stations 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stations' });
  }
});

module.exports = router;
