import logger from '../../../../utils/logger.js';
import { PythonEnv } from '../../../../utils/pythonEnv.js';

export class DependencyManager {
  static _isVerified = false;
  static _verificationError = null;

  /**
   * Verifies that Python and required helper packages are installed and compatible.
   * Returns a meaningful workflow error if validation fails.
   */
  static async verifyDependencies() {
    if (this._isVerified) return;
    if (this._verificationError) {
      throw new Error(this._verificationError);
    }

    try {
      // Create a small python script that imports required modules
      // and verifies their presence.
      const verifyScript = `
import sys
try:
    import pdf2docx
    import fitz # PyMuPDF
    import pptx # python-pptx
    print("OK")
except ImportError as e:
    print(f"MISSING_PACKAGE: {e}")
    sys.exit(1)
`;

      const { stdout } = await PythonEnv.exec(['-c', verifyScript]);
      
      if (stdout.trim() === 'OK') {
        this._isVerified = true;
        logger.info('[ExportEngine] Python Bridge dependencies verified successfully.');
      } else {
        throw new Error(stdout.trim());
      }
    } catch (err) {
      this._verificationError = 'Required export conversion dependencies are missing. Ensure Python, pdf2docx, PyMuPDF, and python-pptx are installed.';
      logger.error(`[ExportEngine] Dependency Verification Failed: ${err.message}`);
      throw new Error(this._verificationError);
    }
  }
}
