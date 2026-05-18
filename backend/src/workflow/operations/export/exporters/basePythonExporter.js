import path from 'path';
import fs from 'fs/promises';
import { getAbsolutePath } from '../../../../services/storageService.js';
import { PythonBridge } from '../pythonBridge.js';
import logger from '../../../../utils/logger.js';

export class BasePythonExporter {
  constructor(name, extension, scriptName, successMessage) {
    this.name = name;
    this.extension = extension;
    this.scriptName = scriptName;
    this.successMessage = successMessage;
  }

  async export(document, tempDirPath, timeoutMs) {
    const pdfPath = getAbsolutePath(document.storagePath);
    const outputFilename = `output.${this.extension}`;
    const outputPath = path.join(tempDirPath, outputFilename);
    const scriptPath = path.join(process.cwd(), 'src', 'workflow', 'operations', 'export', 'helpers', this.scriptName);

    logger.debug(`[${this.name}] Reconstructing layout for ${document.originalName}`);
    
    // Execute python helper
    await PythonBridge.executeHelper(scriptPath, [pdfPath, outputPath], timeoutMs);

    // Read the generated file
    const outputBuffer = await fs.readFile(outputPath);
    const downloadBufferBase64 = outputBuffer.toString('base64');
    const baseName = document.originalName.replace(/\.pdf$/i, '');

    return {
      downloadData: {
        downloadFilename: `${baseName}_Exported.${this.extension}`,
        downloadBufferBase64: downloadBufferBase64,
      },
      data: {
        message: this.successMessage
      }
    };
  }
}
