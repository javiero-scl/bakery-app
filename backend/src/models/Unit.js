const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  abbreviation: { type: String, trim: true, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Unit', unitSchema);
