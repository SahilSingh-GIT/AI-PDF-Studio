import { BasePythonExporter } from './basePythonExporter.js';

export class WordExporter extends BasePythonExporter {
  constructor() {
    super(
      'WordExporter',
      'docx',
      'pdf_to_docx.py',
      'Exported successfully as a high-fidelity editable Word Document.'
    );
  }
}
