const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'bikenest_jwt_secret';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const r = await pool.query('SELECT * FROM admins WHERE username=$1',[username]);
  if(r.rowCount===0) return res.status(401).json({ message: 'Invalid' });
  const ok = await bcrypt.compare(password, r.rows[0].password_hash);
  if(!ok) return res.status(401).json({ message: 'Invalid' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '8h' });
  res.json({ token });
});

function auth(req, res, next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ message: 'No token' });
  const token = h.split(' ')[1];
  try{ const decoded = jwt.verify(token, SECRET); req.user = decoded; next(); }catch(e){ return res.status(401).json({ message: 'Invalid' }); }
}

router.post('/vehicle', auth, async (req, res) => {
  const { name, type, ratePerHour, image } = req.body;
  const id = require('uuid').v4();
  await pool.query('INSERT INTO vehicles(id,name,type,rate_per_hour,image,available) VALUES($1,$2,$3,$4,$5,TRUE)', [id,name,type,ratePerHour,image]);
  const r = await pool.query('SELECT * FROM vehicles WHERE id=$1',[id]);
  res.status(201).json(r.rows[0]);
});

router.get('/bookings', auth, async (req, res) => {
  const r = await pool.query('SELECT b.*, v.name AS vehicle_name FROM bookings b LEFT JOIN vehicles v ON v.id=b.vehicle_id ORDER BY created_at DESC');
  res.json(r.rows);
});

module.exports = router;
