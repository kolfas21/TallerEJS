const express = require('express');
const morgan = require('morgan');
const path = require('path');
const productsRouter = require('./routes/products');


const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/products', productsRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
