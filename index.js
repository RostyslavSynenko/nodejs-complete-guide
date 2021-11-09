const path = require('path');

const express = require('express');

const errorController = require('./controllers/error');

const adminRouter = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use(shopRoutes);

app.use(errorController.getPageNotFound);

app.listen(3000, () => console.log('Server running on port 3000'));
