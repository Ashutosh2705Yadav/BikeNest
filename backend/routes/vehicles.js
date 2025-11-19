const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");


// ----------------------------------------------------------------------
// GET ALL VEHICLES (do NOT show deleted vehicles)
// ----------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM vehicles WHERE deleted = FALSE ORDER BY name"
    );
    res.json(r.rows);
  } catch (err) {
    console.error("GET vehicles error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------------------------------------------------------------
// GET A SINGLE VEHICLE BY ID
// ----------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const r = await pool.query(
      "SELECT * FROM vehicles WHERE id=$1 AND deleted=FALSE",
      [id]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(r.rows[0]);

  } catch (err) {
    console.error("GET vehicle by ID error:", err);
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
      `INSERT INTO vehicles(id, name, type, model, number_plate, rate_per_hour, image, available, deleted)
       VALUES($1,$2,$3,$4,$5,$6,$7, TRUE, FALSE)`,
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
// UPDATE VEHICLE (any fields)
// ----------------------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const sets = Object.keys(fields)
      .map((k, i) => `${k}=$${i + 2}`)
      .join(", ");

    const vals = Object.values(fields);

    await pool.query(`UPDATE vehicles SET ${sets} WHERE id=$1`, [
      id,
      ...vals,
    ]);

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

    const v = await pool.query(
      "SELECT available FROM vehicles WHERE id=$1 AND deleted=FALSE",
      [id]
    );

    if (v.rowCount === 0)
      return res.status(404).json({ error: "Vehicle not found" });

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
// SOFT DELETE VEHICLE (fix: never delete from DB → just hide it)
// ----------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // instead of DELETE → soft delete
    await pool.query("UPDATE vehicles SET deleted = TRUE WHERE id = $1", [id]);

    res.json({ message: "Vehicle deleted successfully." });

  } catch (err) {
    console.error("DELETE vehicle error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;