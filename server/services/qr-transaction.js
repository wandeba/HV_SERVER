const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

class QRTransactionService {
  async processFuelPurchase(transactionData) {
    const { rider_id, station_id, fuel_amount, pos_user } = transactionData;
    
    const result = await pool.query(
      `INSERT INTO fuel_purchases (rider_id, station_id, fuel_amount, pos_user) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [rider_id, station_id, fuel_amount, pos_user]
    );

    return result.rows[0];
  }

  async getStationTransactions(stationId, date) {
    const result = await pool.query(
      `SELECT * FROM fuel_purchases 
       WHERE station_id = $1 AND DATE(created_at) = $2 
       ORDER BY created_at DESC`,
      [stationId, date || new Date().toISOString().split('T')[0]]
    );

    return result.rows;
  }
}

module.exports = new QRTransactionService();
