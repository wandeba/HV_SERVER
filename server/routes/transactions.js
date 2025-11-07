
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Process fuel purchase
router.post('/fuel-purchase', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { rider_id, station_id, fuel_amount, pos_user } = req.body;

    // Validate required fields
    if (!rider_id || !station_id || !fuel_amount) {
      throw new Error('Missing required fields: rider_id, station_id, fuel_amount');
    }

    if (fuel_amount <= 0) {
      throw new Error('Fuel amount must be greater than 0');
    }

    // Check rider exists and get balance
    const riderResult = await client.query(
      'SELECT wallet_balance, full_name, status FROM riders WHERE rider_id = $1 FOR UPDATE',
      [rider_id]
    );

    if (riderResult.rows.length === 0) {
      throw new Error('Rider not found');
    }

    const rider = riderResult.rows[0];
    
    if (rider.status !== 'active') {
      throw new Error('Rider account is not active');
    }

    // Check sufficient balance
    if (rider.wallet_balance < fuel_amount) {
      throw new Error(`Insufficient balance. Current: ${rider.wallet_balance} UGX, Required: ${fuel_amount} UGX`);
    }

    const newBalance = rider.wallet_balance - fuel_amount;

    // Update rider balance
    await client.query(
      'UPDATE riders SET wallet_balance = $1 WHERE rider_id = $2',
      [newBalance, rider_id]
    );

    // Record fuel purchase
    const purchaseResult = await client.query(
      `INSERT INTO fuel_purchases (rider_id, station_id, fuel_amount, pos_user)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [rider_id, station_id, fuel_amount, pos_user || 'system']
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Fuel purchase recorded successfully',
      data: {
        purchase_id: purchaseResult.rows[0].id,
        rider_name: rider.full_name,
        fuel_amount: fuel_amount,
        new_balance: newBalance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fuel purchase error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
