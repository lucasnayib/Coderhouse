const Product = require('../models/Product');

const parsePaginationParams = ({ limit = 10, page = 1 }) => {
  const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  return { limit: parsedLimit, page: parsedPage };
};

const buildFilter = (query) => {
  if (!query) return {};

  const normalized = String(query).toLowerCase();
  if (['available', 'true', 'disponible'].includes(normalized)) {
    return { status: true };
  }
  if (['unavailable', 'false', 'agotado'].includes(normalized)) {
    return { status: false };
  }

  return { category: query };
};

const buildSort = (sort) => {
  if (!sort) return {};
  const normalized = String(sort).toLowerCase();
  if (normalized === 'asc') return { price: 1 };
  if (normalized === 'desc') return { price: -1 };
  return {};
};

const paginateProducts = async ({ limit, page, sort, query }) => {
  const { limit: cleanLimit, page: cleanPage } = parsePaginationParams({ limit, page });
  const filter = buildFilter(query);
  const sortOption = buildSort(sort);
  const skip = (cleanPage - 1) * cleanLimit;

  const [products, totalDocs] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(cleanLimit),
    Product.countDocuments(filter),
  ]);

  const totalPages = totalDocs > 0 ? Math.ceil(totalDocs / cleanLimit) : 0;
  const hasPrevPage = cleanPage > 1;
  const hasNextPage = totalPages > 0 && cleanPage < totalPages;

  return {
    products,
    totalDocs,
    totalPages,
    page: cleanPage,
    limit: cleanLimit,
    hasPrevPage,
    hasNextPage,
    prevPage: hasPrevPage ? cleanPage - 1 : null,
    nextPage: hasNextPage ? cleanPage + 1 : null,
  };
};

module.exports = {
  paginateProducts,
  buildFilter,
  buildSort,
};
