/**
 * routes/health.js — Health check endpoint.
 *
 * GET /api/health
 *
 * Used by load balancers, monitoring systems, and the frontend
 * to verify the API server is alive and responsive.
 */

import { Router } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    status: 'healthy',
    service: 'AI PDF Studio API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

export default router;
