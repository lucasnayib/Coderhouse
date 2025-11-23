const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const router = express.Router();

router.get('/products', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const cartId = req.query.cartId;

    const filter = {};
    if (query) {
      if (query === 'available' || query === 'unavailable') {
        filter.status = query === 'available';
      } else {
        filter.category = query;
      }
    }

    const sortOption = {};
    if (sort === 'asc') {
      sortOption.price = 1;
    } else if (sort === 'desc') {
      sortOption.price = -1;
    }

    const result = await Product.paginate(filter, {
      limit,
      page,
      sort: Object.keys(sortOption).length ? sortOption : undefined,
      lean: true
    });

    res.render('products', {
      products: result.docs,
      cartId,
      pagination: {
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        sort,
        query,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).render('products', { products: [], message: 'Producto no encontrado' });
    }
    res.render('productDetail', { product, cartId: req.query.cartId });
  } catch (error) {
    next(error);
  }
});

router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) {
      return res.status(404).render('cart', { products: [], message: 'Carrito no encontrado' });
    }
    res.render('cart', { cart, products: cart.products });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
