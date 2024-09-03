const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    totalQuantity: { type: Number, required: true },
    availableQuantity: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date }
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);
