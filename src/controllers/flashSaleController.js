const FlashSale = require('../models/FlashSale');
const Item = require('../models/itemModel');
const Transaction = require('../models/Transaction');
const redis = require('redis');
const client = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
const { promisify } = require('util');

client.on('error', (err) => {
    console.log('Redis error:', err);
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Start Flash Sale
exports.startFlashSale = async (req, res) => {
    const { itemId, totalQuantity, startTime } = req.body;

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const flashSale = new FlashSale({
            itemId,
            totalQuantity,
            availableQuantity: totalQuantity,
            startTime,
            endTime: null // Sale ends when stock is depleted
        });

        await flashSale.save();
        await setAsync(`flashSale_${flashSale._id}`, totalQuantity);

        res.status(201).json({ message: 'Flash sale started', saleId: flashSale._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Available Items
exports.getAvailableItems = async (req, res) => {
    const { saleId } = req.query;

    try {
        const flashSale = await FlashSale.findById(saleId);
        if (!flashSale) {
            return res.status(404).json({ message: 'Flash sale not found' });
        }

        res.status(200).json({ itemId: flashSale.itemId, availableQuantity: flashSale.availableQuantity });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Purchase Item
exports.purchaseItem = async (req, res) => {
    const { customerId, saleId, quantity } = req.body;

    try {
        const flashSale = await FlashSale.findById(saleId);
        if (!flashSale) {
            return res.status(404).json({ message: 'Flash sale not found' });
        }

        if (flashSale.availableQuantity < quantity) {
            return res.status(400).json({ message: 'Not enough items in stock' });
        }

        const currentStock = await getAsync(`flashSale_${saleId}`);
        if (currentStock < quantity) {
            return res.status(400).json({ message: 'Not enough items in stock' });
        }

        // Decrement stock in Redis first for concurrency control
        await setAsync(`flashSale_${saleId}`, currentStock - quantity);

        flashSale.availableQuantity -= quantity;
        await flashSale.save();

        const transaction = new Transaction({
            customerId,
            itemId: flashSale.itemId,
            quantity
        });

        await transaction.save();

        res.status(201).json({ message: 'Purchase successful', transactionId: transaction._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// View Transaction History
exports.viewTransactionHistory = async (req, res) => {
    const { customerId } = req.query;

    try {
        const transactions = await Transaction.find({ customerId });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
