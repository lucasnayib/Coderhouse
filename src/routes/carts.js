const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

const ensureCart = async (cid, withPopulate = false) => {
  const query = withPopulate ? Cart.findById(cid).populate('products.product') : Cart.findById(cid);
  const cart = await query;
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }
  return cart;
};

router.post('/', async (req, res, next) => {
  try {
    const cart = await Cart.create({ products: [] });
    return res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await ensureCart(req.params.cid, true);
    return res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.post('/:cid/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    const cart = await ensureCart(req.params.cid);
    const existing = cart.products.find((item) => item.product.toString() === req.params.pid);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: product._id, quantity: 1 });
    }
    await cart.save();
    return res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await ensureCart(req.params.cid);
    cart.products = cart.products.filter((item) => item.product.toString() !== req.params.pid);
    await cart.save();
    return res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.put('/:cid', async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', message: 'products must be an array' });
    }

    const cart = await ensureCart(req.params.cid);
    const formattedProducts = [];
    for (const item of products) {
      if (!item.product) continue;
      const exists = await Product.exists({ _id: item.product });
      if (!exists) continue;
      formattedProducts.push({ product: item.product, quantity: Math.max(item.quantity || 1, 1) });
    }

    cart.products = formattedProducts;
    await cart.save();
    return res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const parsedQuantity = parseInt(quantity, 10);
    if (!parsedQuantity || parsedQuantity < 1) {
      return res.status(400).json({ status: 'error', message: 'quantity must be greater than 0' });
    }

    const cart = await ensureCart(req.params.cid);
    const productIndex = cart.products.findIndex((item) => item.product.toString() === req.params.pid);
    if (productIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'Product not found in cart' });
    }

    cart.products[productIndex].quantity = parsedQuantity;
    await cart.save();
    return res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await ensureCart(req.params.cid);
    cart.products = [];
    await cart.save();
    return res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
