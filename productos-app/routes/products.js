const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsPath = path.join(__dirname, '../data/products.json');

router.get('/', (req, res) => {
  const minPrice = parseFloat(req.query.min_price) || 0;

  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }

    let products = JSON.parse(data);
    products = products.filter(product => product.product_price > minPrice);

    res.render('products', { products, minPrice });
  });
});

module.exports = router;
