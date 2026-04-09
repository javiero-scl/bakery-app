const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_name: { type: String, required: true, trim: true },
  user_email: { type: String, required: true, trim: true, lowercase: true },
  user_state: { type: String, default: 'active' },
  appwrite_id: { type: String, trim: true }, // Vínculo al $id de Appwrite Auth
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
