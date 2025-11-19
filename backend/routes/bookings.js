const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// GET all bookings
router.get("/", async (req, res) => {
  const r = await pool.query(`
    SELECT b.*, v.name AS vehicle_name
    FROM bookings b
    LEFT JOIN vehicles v ON v.id = b.vehicle_id
    ORDER BY b.created_at DESC
  `);
  res.json(r.rows);
});

// CREATE BOOKING (IMPORTANT FIX)
// CREATE BOOKING (FINAL FIXED)
router.post("/", async (req, res) => {
  try {
    const { vehicleId, renterName, renterPhone, durationHours, paymentMode } = req.body;

    if (!vehicleId) return res.status(400).json({ message: "vehicleId missing" });

    const vehicle = await pool.query("SELECT * FROM vehicles WHERE id=$1 AND deleted=false", [vehicleId]);

    if (vehicle.rowCount === 0)
      return res.status(400).json({ message: "Vehicle not found" });

    if (!vehicle.rows[0].available)
      return res.status(400).json({ message: "Not available" });

    const id = uuidv4();
    const totalCost = Number(vehicle.rows[0].rate_per_hour) * Number(durationHours || 1);

    await pool.query(
      `INSERT INTO bookings(id, vehicle_id, renter_name, renter_phone, duration_hours, total_cost, payment_mode, status)
       VALUES($1,$2,$3,$4,$5,$6,$7,'active')`,
      [id, vehicleId, renterName, renterPhone, durationHours, totalCost, paymentMode]
    );

    // mark vehicle unavailable
    await pool.query("UPDATE vehicles SET available=false WHERE id=$1", [vehicleId]);

    res.json({ message: "Booking created", id });

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// MARK RETURNED
router.put("/:id/return", async (req, res) => {
  const { id } = req.params;

  await pool.query("UPDATE bookings SET status='completed' WHERE id=$1", [id]);

  const b = await pool.query("SELECT vehicle_id FROM bookings WHERE id=$1", [id]);
  await pool.query("UPDATE vehicles SET available=true WHERE id=$1", [b.rows[0].vehicle_id]);

  res.json({ message: "Returned" });
});

module.exports = router;