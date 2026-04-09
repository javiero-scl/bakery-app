const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
