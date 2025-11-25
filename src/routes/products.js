const express = require('express');
const Product = require('../models/Product');
const { paginateProducts } = require('../services/productService');

const router = express.Router();

const buildPaginationLink = (req, targetPage, params) => {
  if (!targetPage) return null;
  const urlParams = new URLSearchParams({
    limit: params.limit,
    page: targetPage,
  });

  if (req.query.sort) urlParams.set('sort', req.query.sort);
  if (req.query.query) urlParams.set('query', req.query.query);

  return `${req.protocol}://${req.get('host')}${req.baseUrl}?${urlParams.toString()}`;
};

router.get('/', async (req, res, next) => {
  try {
    const { limit, page, sort, query } = req.query;
    const result = await paginateProducts({ limit, page, sort, query });

    return res.json({
      status: 'success',
      payload: result.products,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: buildPaginationLink(req, result.prevPage, result),
      nextLink: buildPaginationLink(req, result.nextPage, result),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    return res.json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
