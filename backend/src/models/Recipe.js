const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  raw_material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
  required_quantity: { type: Number, required: true, min: 0 },
  unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Recipe', recipeSchema);
