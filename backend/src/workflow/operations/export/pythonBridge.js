import logger from '../../../utils/logger.js';
import { DependencyManager } from './managers/dependencyManager.js';
import { PythonEnv } from '../../../utils/pythonEnv.js';

export class PythonBridge {
  /**
   * Safely executes a Python helper script using PythonEnv and argument arrays.
   * @param {string} scriptPath - Absolute path to the python script
   * @param {string[]} args - Array of arguments to pass to the script
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<string>} Standard output from the script
   */
  static async executeHelper(scriptPath, args, timeoutMs) {
    // 1. Verify dependencies before running any python code
    await DependencyManager.verifyDependencies();

    logger.debug(`[PythonBridge] Executing script: ${scriptPath} with timeout ${timeoutMs}ms`);

    try {
      // 2. Safely execute using PythonEnv
      const { stdout, stderr } = await PythonEnv.exec([scriptPath, ...args], {
        timeout: timeoutMs,
        killSignal: 'SIGKILL'
      });

      if (stderr && stderr.trim().length > 0) {
        logger.warn(`[PythonBridge] Script produced stderr (might be warnings): ${stderr.trim()}`);
      }

      return stdout;
    } catch (err) {
      // 3. Handle errors and timeouts gracefully
      let errorMessage = 'An unknown error occurred during conversion.';
      
      if (err.killed) {
        errorMessage = 'Conversion timed out. The document may be too complex or too large.';
        logger.error(`[PythonBridge] Execution timed out after ${timeoutMs}ms`);
      } else if (err.code) {
        errorMessage = `The underlying conversion engine failed (Exit Code: ${err.code}).`;
        logger.error(`[PythonBridge] Execution failed with code ${err.code}: ${err.message}`);
      } else {
        errorMessage = `Conversion failed due to a system error.`;
        logger.error(`[PythonBridge] Execution error: ${err.message}`);
      }

      throw new Error(`Export failed: ${errorMessage}`);
    }
  }
}
