import { exec, spawn } from 'child_process';
import logger from '../utils/logger.js';

/**
 * Helper to check if a CLI command exists and succeeds
 */
const checkCommand = (cmd) => {
  return new Promise((resolve) => {
    exec(cmd, (error) => {
      resolve(!error);
    });
  });
};



/**
 * Verifies the availability of required native dependencies.
 * Logs warnings if missing, but does not crash the app.
 */
export const verifyDependencies = async () => {
  logger.info('[DependencyVerification] Checking native dependencies...');

  // 1. Check LibreOffice
  const sofficeCmd = process.platform === 'win32' ? 'soffice' : 'soffice';
  const hasLibreOffice = await checkCommand(`${sofficeCmd} --version`);
  if (!hasLibreOffice) {
    logger.warn('[DependencyVerification] ⚠️ LibreOffice (soffice) is not available in PATH. Office document conversion to PDF will fail.');
  }

  // 2. Check qpdf
  const hasQpdf = await checkCommand('qpdf --version');
  if (!hasQpdf) {
    logger.warn('[DependencyVerification] ⚠️ qpdf is not available in PATH. Security features (Password Protection, Permissions) will fail.');
  }

  // 3. Check Poppler (pdftocairo or pdftoppm)
  // node-poppler uses pdftocairo
  const hasPoppler = await checkCommand('pdftocairo -v');
  if (!hasPoppler) {
    logger.warn('[DependencyVerification] ⚠️ Poppler (pdftocairo) is not available in PATH. Image export (PPTX, Images) will fail.');
  }

  logger.info('[DependencyVerification] Dependency check complete.');
};

export default { verifyDependencies };
