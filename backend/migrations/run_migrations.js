const pool = require('../config/db');
(async ()=>{
  try{
    await pool.query(`CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      model TEXT,
      number_plate TEXT,
      rate_per_hour NUMERIC DEFAULT 0,
      image TEXT,
      available BOOLEAN DEFAULT TRUE
    );`);
    await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT REFERENCES vehicles(id),
      renter_name TEXT,
      renter_phone TEXT,
      duration_hours INTEGER,
      total_cost NUMERIC,
      payment_mode TEXT,
      status TEXT DEFAULT 'ongoing',
      created_at TIMESTAMP DEFAULT now()
    );`);
    await pool.query(`CREATE TABLE IF NOT EXISTS admins (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL
    );`);
    const res = await pool.query("SELECT username FROM admins WHERE username='admin'") ;
    if(res.rowCount === 0){
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO admins(username, password_hash) VALUES($1,$2)', ['admin', hash]);
      console.log('Seeded admin user: admin / admin123');
    }
    console.log('Migrations completed');
    process.exit(0);
  }catch(err){
    console.error('Migration failed', err);
    process.exit(1);
  }
})();
