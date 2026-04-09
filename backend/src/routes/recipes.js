const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

const populateRecipe = (query) =>
  query
    .populate('product_id', 'name')
    .populate('raw_material_id', 'name')
    .populate('unit_id', 'name abbreviation');

const toFrontend = (r) => {
  const obj = r.toObject ? r.toObject() : r;
  obj.product_name = obj.product_id?.name || '';
  obj.raw_material_name = obj.raw_material_id?.name || '';
  obj.unit = obj.unit_id;
  return obj;
};

// GET /api/recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await populateRecipe(Recipe.find().sort({ created_at: -1 }));
    res.json(recipes.map(toFrontend));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recipes
router.post('/', async (req, res) => {
  try {
    const recipe = new Recipe({
      product_id: req.body.product_id,
      raw_material_id: req.body.raw_material_id,
      required_quantity: req.body.required_quantity,
      unit_id: req.body.unit_id,
    });
    const saved = await recipe.save();
    const populated = await populateRecipe(Recipe.findById(saved._id));
    res.status(201).json(toFrontend(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/recipes/:id
router.put('/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndUpdate(req.params.id, {
      required_quantity: req.body.required_quantity,
      unit_id: req.body.unit_id,
    });
    const updated = await populateRecipe(Recipe.findById(req.params.id));
    if (!updated) return res.status(404).json({ message: 'Receta no encontrada' });
    res.json(toFrontend(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });
    res.json({ message: 'Receta eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
