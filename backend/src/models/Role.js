const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  rol_name: { type: String, required: true, trim: true },
  rol_state: { type: String, default: 'active' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Role', roleSchema);
