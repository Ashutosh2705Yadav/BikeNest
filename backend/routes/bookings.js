const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// GET ALL BOOKINGS
router.get("/", async (req, res) => {
  const r = await pool.query(`
    SELECT b.*, v.name AS vehicle_name
    FROM bookings b
    LEFT JOIN vehicles v ON v.id=b.vehicle_id
    ORDER BY b.created_at DESC
  `);
  res.json(r.rows);
});

// CREATE NEW BOOKING (FIXED!)
router.post("/", async (req, res) => {
  try {
    const id = uuidv4();
    const { vehicle_id, customerName, phone, startDate, endDate } = req.body;

    const vehicle = await pool.query("SELECT * FROM vehicles WHERE id=$1", [
      vehicle_id,
    ]);

    if (vehicle.rowCount === 0)
      return res.status(400).json({ message: "Vehicle not found" });

    const rate = Number(vehicle.rows[0].rate_per_hour || 0);

    const d1 = new Date(startDate);
    const d2 = new Date(endDate);

    const days = Math.max(
      1,
      Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
    );

    const totalCost = rate * 24 * days;

    // Insert booking
    await pool.query(
      `INSERT INTO bookings(id,vehicle_id,renter_name,renter_phone,duration_hours,total_cost,payment_mode,status)
       VALUES($1,$2,$3,$4,$5,$6,'cash','active')`,
      [id, vehicle_id, customerName, phone, days * 24, totalCost]
    );

    // Mark vehicle unavailable
    await pool.query("UPDATE vehicles SET available=FALSE WHERE id=$1", [
      vehicle_id,
    ]);

    res.json({ message: "Booking created successfully", id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// MARK RETURN
router.put("/:id/return", async (req, res) => {
  const id = req.params.id;

  await pool.query("UPDATE bookings SET status='completed' WHERE id=$1", [id]);

  const vehicle = await pool.query("SELECT vehicle_id FROM bookings WHERE id=$1", [
    id,
  ]);

  if (vehicle.rowCount > 0) {
    await pool.query("UPDATE vehicles SET available=TRUE WHERE id=$1", [
      vehicle.rows[0].vehicle_id,
    ]);
  }

  res.json({ message: "Returned" });
});

module.exports = router;