import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import logger from '../../../../utils/logger.js';

// The base export temp directory: storage/exports/temp/
const getBaseTempDir = () => path.join(process.cwd(), 'storage', 'exports', 'temp');

export class TemporaryDirectoryManager {
  /**
   * Creates an isolated temporary directory for an export job.
   * @returns {Promise<{ dirPath: string, jobId: string, cleanup: () => Promise<void> }>}
   */
  static async createIsolatedJobContext() {
    const jobId = crypto.randomUUID();
    const dirPath = path.join(getBaseTempDir(), jobId);

    try {
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug(`[TempManager] Created isolated export context for job ${jobId}`);
      
      const cleanup = async () => {
        try {
          await fs.rm(dirPath, { recursive: true, force: true });
          logger.debug(`[TempManager] Cleaned up export context for job ${jobId}`);
        } catch (err) {
          logger.error(`[TempManager] Failed to cleanup export context ${jobId}: ${err.message}`);
        }
      };

      return { dirPath, jobId, cleanup };
    } catch (err) {
      logger.error(`[TempManager] Failed to create export context: ${err.message}`);
      throw new Error(`System Error: Unable to create temporary export environment.`);
    }
  }
}
