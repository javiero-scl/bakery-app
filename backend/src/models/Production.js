const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity_produced: { type: Number, required: true, min: 0 },
  unit_production_cost: { type: Number, default: 0 },
  production_date: { type: String, required: true }, // ISO date string YYYY-MM-DD
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Production', productionSchema);
