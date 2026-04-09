const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');

// GET /api/units
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find().sort({ name: 1 });
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/units
router.post('/', async (req, res) => {
  try {
    const unit = new Unit({ name: req.body.name, abbreviation: req.body.abbreviation });
    const newUnit = await unit.save();
    res.status(201).json(newUnit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/units/:id
router.put('/:id', async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, abbreviation: req.body.abbreviation },
      { new: true, runValidators: true }
    );
    if (!unit) return res.status(404).json({ message: 'Unidad no encontrada' });
    res.json(unit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/units/:id
router.delete('/:id', async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unidad no encontrada' });
    res.json({ message: 'Unidad eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
