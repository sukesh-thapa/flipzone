const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
});

// Check if the model already exists, if not, create a new on
module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);

