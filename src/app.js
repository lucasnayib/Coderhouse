const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { create } = require('express-handlebars');

const connectDatabase = require('./config/database');
const productRouter = require('./routes/products.router');
const cartRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const app = express();

const hbs = create({ defaultLayout: 'main', layoutsDir: path.join(__dirname, 'views/layouts') });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  if (!app.locals.dbConnection) {
    try {
      app.locals.dbConnection = await connectDatabase({});
    } catch (error) {
      return next(error);
    }
  }
  return next();
});

app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({ status: 'error', message: err.message || 'Unexpected error' });
  }
  return res.status(status).render('error', { message: err.message || 'Unexpected error' });
});

module.exports = app;
