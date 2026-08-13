/**
 * services/conversionService.js
 * 
 * Handles routing files to appropriate converters to generate a PDF.
 * Uses Microsoft Office COM Automation on Windows for DOCX, PPTX, XLSX.
 */

import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';
import os from 'os';
import logger from '../utils/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'];
const WORD_EXTENSIONS = ['doc', 'docx'];
const PPT_EXTENSIONS = ['ppt', 'pptx'];
const EXCEL_EXTENSIONS = ['xls', 'xlsx'];

/**
 * Converts Office documents to PDF using LibreOffice (cross-platform)
 */
const convertViaLibreOffice = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const outDir = path.dirname(outputPath);
    
    // LibreOffice on Linux/macOS is usually 'soffice'. On Windows it can also be 'soffice' if added to PATH.
    const sofficeCmd = 'soffice';
    
    // soffice --headless --convert-to pdf --outdir <dir> <file>
    const args = [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', outDir,
      inputPath
    ];

    logger.debug(`[ConversionService] Spawning LibreOffice (soffice)`);
    const proc = spawn(sofficeCmd, args);

    let stderr = '';
    proc.stderr.on('data', data => { stderr += data.toString(); });
    let stdout = '';
    proc.stdout.on('data', data => { stdout += data.toString(); });

    proc.on('close', async (code) => {
      if (code !== 0) {
        logger.error(`[ConversionService] LibreOffice conversion failed: ${stderr || stdout}`);
        return reject(new Error(`LibreOffice conversion failed. Is LibreOffice installed? Error: ${stderr || stdout}`));
      }
      
      const baseName = path.basename(inputPath, path.extname(inputPath));
      const loOutputPath = path.join(outDir, `${baseName}.pdf`);
      
      if (loOutputPath !== outputPath) {
        try {
          await fs.rename(loOutputPath, outputPath);
        } catch (renameErr) {
          logger.error(`[ConversionService] Failed to rename LibreOffice output: ${renameErr.message}`);
          return reject(new Error('Failed to complete conversion due to file system error.'));
        }
      }
      resolve();
    });

    proc.on('error', err => {
      logger.error(`[ConversionService] Failed to spawn soffice: ${err.message}`);
      reject(new Error('Failed to run LibreOffice. Ensure soffice is in your PATH.'));
    });
  });
};

/**
 * Converts an image to a PDF using pdf-lib
 */
const convertImageToPdf = async (inputPath, outputPath, ext) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = await fs.readFile(inputPath);
    let image;
    
    if (ext === 'png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (ext === 'jpg' || ext === 'jpeg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      throw new Error(`Image extension ${ext} not natively supported by pdf-lib yet.`);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
  } catch (err) {
    logger.error(`[ConversionService] Image conversion failed: ${err.message}`);
    throw err;
  }
};

/**
 * Converts an uploaded file to PDF if necessary.
 * 
 * @param {string} tempPath The absolute path to the uploaded file in temp/
 * @param {string} originalName The original filename
 * @returns {Promise<{ convertedPath: string } | null>} Returns the new temp path if converted, or null if it was already a PDF.
 */
export const convertToPdf = async (tempPath, originalName) => {
  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  
  if (ext === 'pdf') {
    return null; // No conversion needed
  }

  const outputDir = os.tmpdir();
  const outputFileName = `${crypto.randomUUID()}.pdf`;
  const convertedPath = path.join(outputDir, outputFileName);

  if (WORD_EXTENSIONS.includes(ext)) {
    logger.info(`[ConversionService] Converting Word document ${originalName} to PDF...`);
    await convertViaLibreOffice(tempPath, convertedPath);
    return { convertedPath };
  }
  
  if (PPT_EXTENSIONS.includes(ext)) {
    logger.info(`[ConversionService] Converting PowerPoint ${originalName} to PDF...`);
    await convertViaLibreOffice(tempPath, convertedPath);
    return { convertedPath };
  }
  
  if (EXCEL_EXTENSIONS.includes(ext)) {
    logger.info(`[ConversionService] Converting Excel ${originalName} to PDF...`);
    await convertViaLibreOffice(tempPath, convertedPath);
    return { convertedPath };
  }
  
  if (IMAGE_EXTENSIONS.includes(ext)) {
    logger.info(`[ConversionService] Converting image ${originalName} to PDF...`);
    await convertImageToPdf(tempPath, convertedPath, ext);
    return { convertedPath };
  }

  throw new Error(`Unsupported file format: ${ext}`);
};

export default { convertToPdf };
