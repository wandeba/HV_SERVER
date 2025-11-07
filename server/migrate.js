
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');

    // Create riders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS riders (
        id SERIAL PRIMARY KEY,
        rider_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        boda_plate TEXT NOT NULL,
        wallet_balance DECIMAL(10,2) DEFAULT 0.00,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create fuel_stations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fuel_stations (
        id SERIAL PRIMARY KEY,
        station_id TEXT UNIQUE NOT NULL,
        station_name TEXT NOT NULL,
        location TEXT,
        airtel_money_number TEXT,
        contact_person TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create fuel_purchases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fuel_purchases (
        id SERIAL PRIMARY KEY,
        rider_id TEXT NOT NULL,
        station_id TEXT NOT NULL,
        fuel_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'completed',
        pos_user TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Insert sample data
    await pool.query(`
      INSERT INTO riders (rider_id, full_name, phone_number, boda_plate, wallet_balance) 
      VALUES 
        ('RDR001', 'John Mugisha', '+256712345678', 'UAB123A', 25000),
        ('RDR002', 'Peter Okello', '+256723456789', 'UCD456B', 15000)
      ON CONFLICT (rider_id) DO NOTHING
    `);

    await pool.query(`
      INSERT INTO fuel_stations (station_id, station_name, location, airtel_money_number) 
      VALUES 
        ('STN001', 'City Fuel Kampala', 'Kampala Road', '+256772345678'),
        ('STN002', 'Shell Entebbe', 'Entebbe Road', '+256783456789')
      ON CONFLICT (station_id) DO NOTHING
    `);

    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
