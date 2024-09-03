const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    transactionTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
