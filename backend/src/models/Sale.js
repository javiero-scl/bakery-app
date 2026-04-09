const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity_sold: { type: Number, required: true, min: 0 },
  unit_sale_price: { type: Number, required: true, min: 0 },
  weighted_average_cost_at_sale: { type: Number, default: 0 },
  sale_date: { type: String, required: true }, // ISO date string YYYY-MM-DD
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Sale', saleSchema);
