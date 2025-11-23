const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.post('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    const existingItem = cart.products.find((item) => item.product.toString() === req.params.pid);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await cart.save();
    await cart.populate('products.product');
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    const updatedProducts = cart.products.filter((item) => item.product.toString() !== req.params.pid);
    cart.products = updatedProducts;
    await cart.save();
    await cart.populate('products.product');

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.put('/:cid', async (req, res, next) => {
  try {
    const items = req.body.products || [];
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    cart.products = items.map((item) => ({ product: item.product, quantity: item.quantity || 1 }));
    await cart.save();
    await cart.populate('products.product');

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ status: 'error', message: 'Quantity must be greater than 0' });
    }
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    const item = cart.products.find((product) => product.product.toString() === req.params.pid);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Product not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('products.product');

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    cart.products = [];
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
