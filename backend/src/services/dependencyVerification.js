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
 * Helper to check if a Windows COM Object is registered
 */
const checkComObject = (comName) => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      return resolve(false);
    }
    
    const ps = `
      try {
        $obj = New-Object -ComObject ${comName}
        if ($obj -ne $null) {
          try { $obj.Quit() } catch {}
          exit 0
        }
      } catch {
        exit 1
      }
      exit 1
    `;
    
    const args = ['-ExecutionPolicy', 'Bypass', '-NoProfile', '-NonInteractive', '-Command', ps];
    const proc = spawn('powershell.exe', args);
    proc.on('close', code => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
};

/**
 * Verifies the availability of required native dependencies.
 * Logs warnings if missing, but does not crash the app.
 */
export const verifyDependencies = async () => {
  logger.info('[DependencyVerification] Checking native dependencies...');

  // 1. Check Microsoft Office (Word, PPT, Excel)
  const hasWord = await checkComObject('Word.Application');
  if (!hasWord) {
    logger.warn('[DependencyVerification] ⚠️ Microsoft Word (COM) is not available. DOC/DOCX conversion to PDF will fail.');
  }

  const hasPPT = await checkComObject('PowerPoint.Application');
  if (!hasPPT) {
    logger.warn('[DependencyVerification] ⚠️ Microsoft PowerPoint (COM) is not available. PPT/PPTX conversion to PDF will fail.');
  }

  const hasExcel = await checkComObject('Excel.Application');
  if (!hasExcel) {
    logger.warn('[DependencyVerification] ⚠️ Microsoft Excel (COM) is not available. XLS/XLSX conversion to PDF will fail.');
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
