import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/env.js';
import logger from './logger.js';
import DocumentSession from '../models/DocumentSession.js';
import Document from '../models/Document.js';
import DocumentVersion from '../models/DocumentVersion.js';
import DocumentIntelligence from '../models/DocumentIntelligence.js';
import { getAbsolutePath } from '../services/storageService.js';

export async function wipeAllData() {
  try {
    logger.info('[Cleanup] Wiping all data from MongoDB...');
    await DocumentSession.deleteMany({});
    await Document.deleteMany({});
    await DocumentVersion.deleteMany({});
    await DocumentIntelligence.deleteMany({});
    logger.info('[Cleanup] MongoDB cleared.');

    logger.info('[Cleanup] Wiping local storage files...');
    const subdirs = ['originals', 'processed', 'thumbnails', 'temp'];
    
    for (const subdir of subdirs) {
      const dirPath = getAbsolutePath(subdir);
      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          if (file !== '.gitkeep') {
            await fs.unlink(path.join(dirPath, file));
          }
        }
      } catch (err) {
        if (err.code !== 'ENOENT') logger.warn(`[Cleanup] Error clearing ${subdir}: ${err.message}`);
      }
    }
    logger.info('[Cleanup] Local storage cleared.');

    logger.info('[Cleanup] Wiping ChromaDB collections...');
    try {
      const res = await fetch(`${config.chroma.url}/api/v1/collections`);
      if (res.ok) {
        const collections = await res.json();
        for (const col of collections) {
          const colIdentifier = col.name || col.id;
          if (colIdentifier) {
            await fetch(`${config.chroma.url}/api/v1/collections/${colIdentifier}`, { method: 'DELETE' });
          }
        }
      }
    } catch(err) {
      logger.warn('[Cleanup] Error wiping ChromaDB: ' + err.message);
    }
    logger.info('[Cleanup] ChromaDB cleared.');

  } catch (error) {
    logger.error(`[Cleanup] Error during wipe: ${error.message}`);
  }
}
