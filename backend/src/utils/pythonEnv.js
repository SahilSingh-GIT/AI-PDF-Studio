import { spawn } from 'child_process';
import path from 'path';

/**
 * pythonEnv.js
 * 
 * Manages the isolated Python virtual environment specifically for
 * running layout-preserving document exports (Word, PowerPoint).
 */
export class PythonEnv {
  static get pythonPath() {
    // Isolated virtual environment path
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      return path.join(process.cwd(), 'venv', 'Scripts', 'python.exe');
    }
    return path.join(process.cwd(), 'venv', 'bin', 'python');
  }

  /**
   * Safely spawns the isolated python executable with the given arguments.
   * 
   * @param {string[]} args Arguments to pass to python
   * @param {Object} options Execution options
   * @returns {Promise<{stdout: string, stderr: string}>}
   */
  static async exec(args, options = {}) {
    return new Promise((resolve, reject) => {
      const timeoutMs = options.timeout || 30000;
      const killSignal = options.killSignal || 'SIGKILL';
      
      const proc = spawn(this.pythonPath, args, { cwd: process.cwd() });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      let timeoutId = null;
      if (timeoutMs) {
        timeoutId = setTimeout(() => {
          proc.kill(killSignal);
          reject({ killed: true, code: null, message: `Execution timed out after ${timeoutMs}ms` });
        }, timeoutMs);
      }
      
      proc.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        if (code !== 0) {
          reject({ code, message: stderr || stdout });
        } else {
          resolve({ stdout, stderr });
        }
      });
      
      proc.on('error', (err) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject({ code: null, message: err.message });
      });
    });
  }
}
