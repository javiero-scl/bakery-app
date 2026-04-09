const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  raw_material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
  quantity: { type: Number, required: true, min: 0 },
  total_cost: { type: Number, required: true, min: 0 },
  purchase_date: { type: String, required: true }, // ISO date string YYYY-MM-DD
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Purchase', purchaseSchema);
