const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

const toFrontend = (p) => {
  const obj = p.toObject ? p.toObject() : p;
  obj.raw_material_name = obj.raw_material_id?.name || '';
  obj.unit_abbreviation = obj.raw_material_id?.unit_id?.abbreviation || '';
  return obj;
};

// GET /api/purchases
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate({ path: 'raw_material_id', select: 'name unit_id', populate: { path: 'unit_id', select: 'name abbreviation' } })
      .sort({ purchase_date: -1 });
    res.json(purchases.map(toFrontend));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/purchases
router.post('/', async (req, res) => {
  try {
    const purchase = new Purchase({
      raw_material_id: req.body.raw_material_id,
      quantity: req.body.quantity,
      total_cost: req.body.total_cost,
      purchase_date: req.body.purchase_date,
    });
    const saved = await purchase.save();
    const populated = await Purchase.findById(saved._id)
      .populate({ path: 'raw_material_id', select: 'name unit_id', populate: { path: 'unit_id', select: 'name abbreviation' } });
    res.status(201).json(toFrontend(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/purchases/:id
router.put('/:id', async (req, res) => {
  try {
    await Purchase.findByIdAndUpdate(req.params.id, {
      quantity: req.body.quantity,
      total_cost: req.body.total_cost,
      purchase_date: req.body.purchase_date,
    });
    const updated = await Purchase.findById(req.params.id)
      .populate({ path: 'raw_material_id', select: 'name unit_id', populate: { path: 'unit_id', select: 'name abbreviation' } });
    if (!updated) return res.status(404).json({ message: 'Compra no encontrada' });
    res.json(toFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/purchases/:id
router.delete('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ message: 'Compra no encontrada' });
    res.json({ message: 'Compra eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
