const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get all riders with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM riders';
    let countQuery = 'SELECT COUNT(*) FROM riders';
    let params = [];

    if (search) {
      query += ' WHERE full_name ILIKE $1 OR phone_number ILIKE $1 OR boda_plate ILIKE $1 OR rider_id ILIKE $1';
      countQuery += ' WHERE full_name ILIKE $1 OR phone_number ILIKE $1 OR boda_plate ILIKE $1 OR rider_id ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    params.push(limit, offset);

    const [ridersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, 1))
    ]);

    res.json({
      success: true,
      data: ridersResult.rows,
      pagination: {
        page: parseInt(page),
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get riders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch riders' });
  }
});

// Create new rider
router.post('/', async (req, res) => {
  try {
    const { full_name, phone_number, boda_plate, initial_balance = 0 } = req.body;

    if (!full_name || !phone_number || !boda_plate) {
      return res.status(400).json({
        success: false,
        error: 'Full name, phone number, and boda plate are required'
      });
    }

    // Generate rider ID
    const countResult = await pool.query('SELECT COUNT(*) FROM riders');
    const rider_id = `RDR${(parseInt(countResult.rows[0].count) + 1).toString().padStart(3, '0')}`;

    const result = await pool.query(
      `INSERT INTO riders (rider_id, full_name, phone_number, boda_plate, wallet_balance) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [rider_id, full_name, phone_number, boda_plate, initial_balance]
    );

    res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create rider error:', error);
    res.status(500).json({ success: false, error: 'Failed to create rider' });
  }
});

module.exports = router;
