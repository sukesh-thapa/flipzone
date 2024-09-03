const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../server');

const Item = require('../models/Item');
const FlashSale = require('../models/FlashSale');

// Connect to a test database
beforeAll(async () => {
  const url = `mongodb://127.0.0.1/flipzon_test_db`;
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Clear data after each test
afterEach(async () => {
  await Item.deleteMany();
  await FlashSale.deleteMany();
});

// Disconnect from the test database
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Flash Sale API', () => {

  it('should create a new item', async () => {
    const newItem = { name: 'iPhone 15', price: 999, stock: 1000 };

    const response = await supertest(app)
      .post('/items')
      .send(newItem)
      .expect(201);

    // Verify the response body
    expect(response.body.name).toBe(newItem.name);
    expect(response.body.price).toBe(newItem.price);
    expect(response.body.stock).toBe(newItem.stock);

    // Verify the item is saved in the database
    const item = await Item.findOne({ name: newItem.name });
    expect(item).toBeTruthy();
  });

  it('should fetch all items', async () => {
    // Create some items
    await Item.create([
      { name: 'iPhone 15', price: 999, stock: 1000 },
      { name: 'iPhone 14', price: 899, stock: 500 },
    ]);

    const response = await supertest(app)
      .get('/items')
      .expect(200);

    // Verify the response body
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe('iPhone 15');
    expect(response.body[1].name).toBe('iPhone 14');
  });

  it('should start a flash sale', async () => {
    // First, create an item
    const item = await Item.create({ name: 'iPhone 15', price: 999, stock: 1000 });

    // Start a flash sale for the item
    const flashSaleData = {
      itemId: item._id,
      startTime: new Date(),
      duration: 3600, // 1 hour
      quantity: 100,
    };

    const response = await supertest(app)
      .post('/flashsales')
      .send(flashSaleData)
      .expect(201);

    // Verify the response body
    expect(response.body.itemId).toBe(item._id.toString());
    expect(response.body.quantity).toBe(flashSaleData.quantity);

    // Verify the flash sale is saved in the database
    const flashSale = await FlashSale.findOne({ itemId: item._id });
    expect(flashSale).toBeTruthy();
  });
});
