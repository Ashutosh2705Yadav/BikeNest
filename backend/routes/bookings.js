const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
router.get('/', async (req, res) => {
  const r = await pool.query('SELECT b.*, v.name AS vehicle_name FROM bookings b LEFT JOIN vehicles v ON v.id=b.vehicle_id ORDER BY created_at DESC');
  res.json(r.rows);
});
router.post('/', async (req, res) => {
  const id = uuidv4();
  const { vehicleId, renterName, renterPhone, durationHours, paymentMode } = req.body;
  const vehicle = await pool.query('SELECT * FROM vehicles WHERE id=$1',[vehicleId]);
  if(vehicle.rowCount===0) return res.status(400).json({ message: 'Vehicle not found' });
  if(vehicle.rows[0].available === false) return res.status(400).json({ message: 'Not available' });
  const totalCost = Number(vehicle.rows[0].rate_per_hour || 0) * Number(durationHours || 1);
  await pool.query('INSERT INTO bookings(id,vehicle_id,renter_name,renter_phone,duration_hours,total_cost,payment_mode,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, vehicleId, renterName, renterPhone, durationHours, totalCost, paymentMode, 'ongoing']);
  // mark vehicle unavailable
  await pool.query('UPDATE vehicles SET available=FALSE WHERE id=$1',[vehicleId]);
  const r = await pool.query('SELECT * FROM bookings WHERE id=$1',[id]);
  res.status(201).json(r.rows[0]);
});
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query('UPDATE bookings SET status=$1 WHERE id=$2',[status,id]);
  if(status === 'completed'){
    const b = await pool.query('SELECT vehicle_id FROM bookings WHERE id=$1',[id]);
    if(b.rowCount) await pool.query('UPDATE vehicles SET available=TRUE WHERE id=$1',[b.rows[0].vehicle_id]);
  }
  const r = await pool.query('SELECT * FROM bookings WHERE id=$1',[id]);
  res.json(r.rows[0]);
});
module.exports = router;
