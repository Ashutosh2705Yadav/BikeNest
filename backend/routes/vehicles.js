const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");


// ----------------------------------------------------------------------
// GET ALL VEHICLES
// ----------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM vehicles ORDER BY name");
    res.json(r.rows);
  } catch (err) {
    console.error("GET vehicles error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------------------------------------------------------------
// ADD NEW VEHICLE
// ----------------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const id = uuidv4();
    const { name, type, model, number_plate, rate_per_hour, image } = req.body;

    await pool.query(
      `INSERT INTO vehicles(id, name, type, model, number_plate, rate_per_hour, image, available)
       VALUES($1,$2,$3,$4,$5,$6,$7, TRUE)`,
      [id, name, type, model, number_plate, rate_per_hour, image]
    );

    const r = await pool.query("SELECT * FROM vehicles WHERE id=$1", [id]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error("POST vehicle error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------------------------------------------------------------
// UPDATE VEHICLE FIELDS
// ----------------------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const sets = Object.keys(fields)
      .map((k, i) => `${k}=$${i + 2}`)
      .join(", ");

    const vals = Object.values(fields);

    await pool.query(`UPDATE vehicles SET ${sets} WHERE id=$1`, [id, ...vals]);

    const r = await pool.query("SELECT * FROM vehicles WHERE id=$1", [id]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error("UPDATE vehicle error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------------------------------------------------------------
// TOGGLE AVAILABILITY
// ----------------------------------------------------------------------
router.put("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    const v = await pool.query("SELECT available FROM vehicles WHERE id=$1", [id]);
    if (v.rowCount === 0) return res.status(404).json({ error: "Vehicle not found" });

    const newStatus = !v.rows[0].available;

    await pool.query("UPDATE vehicles SET available=$1 WHERE id=$2", [
      newStatus,
      id,
    ]);

    const r = await pool.query("SELECT * FROM vehicles WHERE id=$1", [id]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error("Toggle availability error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------------------------------------------------------------
// SAFE DELETE VEHICLE (avoid crash from FK constraints)
// ----------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the vehicle is used in bookings
    const bookingCheck = await pool.query(
      "SELECT * FROM bookings WHERE vehicle_id=$1",
      [id]
    );

    if (bookingCheck.rowCount > 0) {
      // Instead of deleting → mark unavailable
      await pool.query("UPDATE vehicles SET available=FALSE WHERE id=$1", [id]);

      return res.json({
        message:
          "Vehicle has bookings, so it was marked unavailable instead of deleting.",
      });
    }

    // Safe delete
    await pool.query("DELETE FROM vehicles WHERE id=$1", [id]);

    res.json({ message: "Vehicle deleted successfully." });
  } catch (err) {
    console.error("DELETE vehicle error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;