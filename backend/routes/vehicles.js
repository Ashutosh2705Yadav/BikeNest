const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
router.get('/', async (req, res) => {
  const r = await pool.query('SELECT * FROM vehicles ORDER BY name');
  res.json(r.rows);
});
router.post('/', async (req, res) => {
  const id = uuidv4();
  const { name, type, model, number_plate, rate_per_hour, image } = req.body;
  await pool.query(`INSERT INTO vehicles(id,name,type,model,number_plate,rate_per_hour,image,available) VALUES($1,$2,$3,$4,$5,$6,$7,TRUE)`,
    [id,name,type,model,number_plate,rate_per_hour,image]);
  const r = await pool.query('SELECT * FROM vehicles WHERE id=$1',[id]);
  res.status(201).json(r.rows[0]);
});
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const sets = Object.keys(fields).map((k,i)=>`${k}=$${i+2}`).join(', ');
  const vals = Object.values(fields);
  await pool.query(`UPDATE vehicles SET ${sets} WHERE id=$1`, [id, ...vals]);
  const r = await pool.query('SELECT * FROM vehicles WHERE id=$1',[id]);
  res.json(r.rows[0]);
});
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM vehicles WHERE id=$1',[id]);
  res.json({ message: 'Deleted' });
});
module.exports = router;
