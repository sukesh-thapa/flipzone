const express = require('express');
const router = express.Router();
const flashSaleController = require('../controllers/flashSaleController');

// Start Flash Sale (Admin Only)
router.post('/start', flashSaleController.startFlashSale);

// Get Available Items
router.get('/items', flashSaleController.getAvailableItems);

// Purchase Item
router.post('/purchase', flashSaleController.purchaseItem);

// View Transaction History
router.get('/transactions', flashSaleController.viewTransactionHistory);

module.exports = router;
