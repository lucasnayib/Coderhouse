const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { paginateProducts } = require('../services/productService');

const router = express.Router();

const buildViewLink = (basePath, targetPage, params) => {
  if (!targetPage) return null;
  const urlParams = new URLSearchParams({
    ...params,
    page: targetPage,
  });
  return `${basePath}?${urlParams.toString()}`;
};

router.get('/', (req, res) => res.redirect('/products'));

router.get('/products', async (req, res, next) => {
  try {
    const { limit, page, sort, query, cid } = req.query;
    const result = await paginateProducts({ limit, page, sort, query });
    const baseParams = {};
    if (limit) baseParams.limit = limit;
    if (sort) baseParams.sort = sort;
    if (query) baseParams.query = query;
    if (cid) baseParams.cid = cid;

    res.render('index', {
      title: 'Productos',
      products: result.products.map((product) => ({ ...product.toObject(), cid })),
      pagination: {
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: buildViewLink('/products', result.prevPage, baseParams),
        nextLink: buildViewLink('/products', result.nextPage, baseParams),
      },
      sort,
      query,
      limit: limit || 10,
      cartId: cid || '',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).render('error', { message: 'Producto no encontrado' });
    }

    res.render('product', {
      title: product.title,
      product: product.toObject(),
      cartId: req.query.cid || '',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) {
      return res.status(404).render('error', { message: 'Carrito no encontrado' });
    }

    res.render('cart', {
      title: 'Carrito',
      cart: cart.toObject(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
