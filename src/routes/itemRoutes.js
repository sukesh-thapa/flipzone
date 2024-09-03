const express = require('express');
const router = express.Router();
const Item = require('../models/itemModel');

// GET all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find(); // Fetch all items from the database
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create a new item
router.post('/', async (req, res) => {
    const { name, price, stock } = req.body; // Extract item details from request body

    // Validate the input
    if (!name || !price || !stock) {
        return res.status(400).json({ message: 'Name, price, and stock are required' });
    }

    const newItem = new Item({
        name,
        price,
        stock,
    });

    try {
        const savedItem = await newItem.save(); // Save the new item to the database
        res.status(201).json(savedItem); // Respond with the created item
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
