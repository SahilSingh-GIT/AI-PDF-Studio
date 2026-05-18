import { rgb, StandardFonts, degrees } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { getAbsolutePath } from '../services/storageService.js';

// Helper to convert hex to rgb for pdf-lib (e.g. '#fbbf24' -> {r,g,b})
const hexToRgb = (hex) => {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(cleanHex.substring(0, 2), 16) / 255,
    g: parseInt(cleanHex.substring(2, 4), 16) / 255,
    b: parseInt(cleanHex.substring(4, 6), 16) / 255
  };
};

/**
 * OverlayRenderer
 * 
 * Takes a pdf-lib PDFDocument instance and an array of overlay objects,
 * and stamps them onto the document pages in z-order (array order).
 * 
 * Overlay Schema:
 * {
 *   id: string,
 *   type: 'text' | 'image' | 'highlight' | 'delete',
 *   pageIndex: number, (1-indexed)
 *   x: number, y: number, width: number, height: number, rotation: number,
 *   style: { color, fontSize, opacity },
 *   content: { text, imagePath }
 * }
 */
export const OverlayRenderer = {
  applyOverlays: async (pdfDoc, overlays) => {
    if (!overlays || overlays.length === 0) return;

    // Pre-embed standard fonts
    const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();

    for (const overlay of overlays) {
      const pageIndex = (overlay.pageIndex || 1) - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) continue;
      
      const page = pages[pageIndex];
      const { type, x, y, width, height, rotation, style = {}, content = {} } = overlay;
      
      const colorRGB = hexToRgb(style.color);
      const pdfColor = rgb(colorRGB.r, colorRGB.g, colorRGB.b);
      const opacity = style.opacity !== undefined ? style.opacity : 1;
      
      const bgColorRGB = hexToRgb(style.bgColor);
      const hasBgColor = style.bgColor && style.bgColor !== 'transparent';
      const pdfBgColor = hasBgColor ? rgb(bgColorRGB.r, bgColorRGB.g, bgColorRGB.b) : null;
      
      // Calculate rotation in degrees (if any)
      const rotate = degrees(rotation || 0);

      switch (type) {
        case 'text':
          if (content.text) {
            const fontSize = style.fontSize || 16;
            
            // Draw background rectangle if specified
            if (hasBgColor) {
              page.drawRectangle({
                x,
                y,
                width,
                height,
                color: pdfBgColor,
                opacity,
                rotate
              });
            }

            // Note: y in pdf-lib is bottom-left of the text baseline
            // But we treat y as bottom-left of the bounding box.
            // We'll add fontSize to approximate baseline
            page.drawText(content.text, {
              x: x + 4, // 4pt padding to match frontend 'p-1' (4px approx)
              y: y + (height - fontSize) / 2 + fontSize * 0.2, // rough vertical centering approximation
              size: fontSize,
              font: fontHelvetica,
              color: pdfColor,
              opacity,
              rotate
            });
          }
          break;

        case 'highlight':
          // We use drawRectangle with blending mode multiply or just opacity
          page.drawRectangle({
            x,
            y,
            width,
            height,
            color: pdfColor,
            opacity: opacity || 0.3,
            rotate
          });
          break;

        case 'delete':
          // Draw redaction rectangle using bgColor (default white)
          page.drawRectangle({
            x,
            y,
            width,
            height,
            color: pdfBgColor || rgb(1, 1, 1),
            opacity: opacity,
            rotate
          });
          break;

        case 'image':
          if (content.imagePath) {
            try {
              const absolutePath = getAbsolutePath(content.imagePath);
              const imageBytes = await fs.readFile(absolutePath);
              let embeddedImage;
              
              const ext = path.extname(content.imagePath).toLowerCase();
              if (ext === '.png') {
                embeddedImage = await pdfDoc.embedPng(imageBytes);
              } else if (ext === '.jpg' || ext === '.jpeg') {
                embeddedImage = await pdfDoc.embedJpg(imageBytes);
              }

              if (embeddedImage) {
                page.drawImage(embeddedImage, {
                  x,
                  y,
                  width,
                  height,
                  opacity,
                  rotate
                });
              }
            } catch (err) {
              console.error(`[OverlayRenderer] Failed to embed image ${content.imagePath}:`, err);
            }
          }
          break;

        default:
          console.warn(`[OverlayRenderer] Unknown overlay type: ${type}`);
          break;
      }
    }
  }
};
