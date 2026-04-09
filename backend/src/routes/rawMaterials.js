const express = require('express');
const router = express.Router();
const RawMaterial = require('../models/RawMaterial');

// GET /api/raw-materials - Populate unit data
router.get('/', async (req, res) => {
  try {
    const rawMaterials = await RawMaterial.find()
      .populate('unit_id', 'name abbreviation')
      .sort({ created_at: -1 });

    // Rename populated field to match frontend shape: unit_id stays as ref, add 'unit'
    const result = rawMaterials.map(rm => {
      const obj = rm.toObject();
      obj.unit = obj.unit_id;  // populated Unit object
      return obj;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/raw-materials
router.post('/', async (req, res) => {
  try {
    const rm = new RawMaterial({ name: req.body.name, unit_id: req.body.unit_id });
    const newRm = await rm.save();
    const populated = await newRm.populate('unit_id', 'name abbreviation');
    const obj = populated.toObject();
    obj.unit = obj.unit_id;
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/raw-materials/:id
router.put('/:id', async (req, res) => {
  try {
    const rm = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, unit_id: req.body.unit_id },
      { new: true, runValidators: true }
    ).populate('unit_id', 'name abbreviation');

    if (!rm) return res.status(404).json({ message: 'Materia prima no encontrada' });
    const obj = rm.toObject();
    obj.unit = obj.unit_id;
    res.json(obj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/raw-materials/:id
router.delete('/:id', async (req, res) => {
  try {
    const rm = await RawMaterial.findByIdAndDelete(req.params.id);
    if (!rm) return res.status(404).json({ message: 'Materia prima no encontrada' });
    res.json({ message: 'Materia prima eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
