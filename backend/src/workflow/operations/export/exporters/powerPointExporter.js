import { BasePythonExporter } from './basePythonExporter.js';

export class PowerPointExporter extends BasePythonExporter {
  constructor() {
    super(
      'PowerPointExporter',
      'pptx',
      'pdf_to_pptx.py',
      'Exported successfully as a high-fidelity editable PowerPoint presentation.'
    );
  }
}
