const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

const toFrontend = (s) => {
  const obj = s.toObject ? s.toObject() : s;
  obj.product_name = obj.product_id?.name || '';
  return obj;
};

// GET /api/sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('product_id', 'name')
      .sort({ sale_date: -1 });
    res.json(sales.map(toFrontend));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sales
router.post('/', async (req, res) => {
  try {
    const sale = new Sale({
      product_id: req.body.product_id,
      quantity_sold: req.body.quantity_sold,
      unit_sale_price: req.body.unit_sale_price,
      sale_date: req.body.sale_date,
    });
    const saved = await sale.save();
    const populated = await Sale.findById(saved._id).populate('product_id', 'name');
    res.status(201).json(toFrontend(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/sales/:id
router.put('/:id', async (req, res) => {
  try {
    await Sale.findByIdAndUpdate(req.params.id, {
      quantity_sold: req.body.quantity_sold,
      unit_sale_price: req.body.unit_sale_price,
      sale_date: req.body.sale_date,
    });
    const updated = await Sale.findById(req.params.id).populate('product_id', 'name');
    if (!updated) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(toFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/sales/:id
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json({ message: 'Venta eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
