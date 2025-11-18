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

// MARK RETURNED
router.put("/:id/return", async (req, res) => {
  const { id } = req.params;

  // update booking status
  await pool.query("UPDATE bookings SET status='completed' WHERE id=$1", [id]);

  // fetch vehicle id
  const b = await pool.query("SELECT vehicle_id FROM bookings WHERE id=$1", [id]);
  if (b.rowCount) {
    await pool.query("UPDATE vehicles SET available=TRUE WHERE id=$1", [
      b.rows[0].vehicle_id,
    ]);
  }

  const updated = await pool.query("SELECT * FROM bookings WHERE id=$1", [id]);
  res.json(updated.rows[0]);
});

module.exports = router;