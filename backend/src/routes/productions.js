const express = require('express');
const router = express.Router();
const Production = require('../models/Production');

const toFrontend = (p) => {
  const obj = p.toObject ? p.toObject() : p;
  obj.product_name = obj.product_id?.name || '';
  return obj;
};

// GET /api/productions
router.get('/', async (req, res) => {
  try {
    const productions = await Production.find()
      .populate('product_id', 'name')
      .sort({ created_at: -1 });
    res.json(productions.map(toFrontend));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/productions
router.post('/', async (req, res) => {
  try {
    const production = new Production({
      product_id: req.body.product_id,
      quantity_produced: req.body.quantity_produced,
      production_date: req.body.production_date,
    });
    const saved = await production.save();
    const populated = await Production.findById(saved._id).populate('product_id', 'name');
    res.status(201).json(toFrontend(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/productions/:id
router.put('/:id', async (req, res) => {
  try {
    await Production.findByIdAndUpdate(req.params.id, {
      quantity_produced: req.body.quantity_produced,
      production_date: req.body.production_date,
    });
    const updated = await Production.findById(req.params.id).populate('product_id', 'name');
    if (!updated) return res.status(404).json({ message: 'Producción no encontrada' });
    res.json(toFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/productions/:id
router.delete('/:id', async (req, res) => {
  try {
    const production = await Production.findByIdAndDelete(req.params.id);
    if (!production) return res.status(404).json({ message: 'Producción no encontrada' });
    res.json({ message: 'Producción eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
