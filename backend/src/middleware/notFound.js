/**
 * notFound.js — 404 catch-all middleware.
 *
 * Mounted AFTER all routes. Catches any request that didn't
 * match a defined route and returns a consistent JSON 404 response.
 */

import { HTTP_STATUS } from '../constants/index.js';

const notFound = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    statusCode: HTTP_STATUS.NOT_FOUND,
  });
};

export default notFound;
