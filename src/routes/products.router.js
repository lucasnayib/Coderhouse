const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

const buildLink = (req, page) => {
  const { protocol } = req;
  const host = req.get('host');
  const url = new URL(`${protocol}://${host}${req.baseUrl}${req.path}`);
  const searchParams = new URLSearchParams(req.query);
  searchParams.set('page', page);
  url.search = searchParams.toString();
  return url.toString();
};

router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

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

    const payload = {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(req, result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(req, result.nextPage) : null
    };

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true, runValidators: true }).lean();
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', payload: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:pid', async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid).lean();
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', payload: deleted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
