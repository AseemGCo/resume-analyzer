import mammoth from 'mammoth';
// Import the library implementation directly to skip pdf-parse's index.js,
// which runs a debug test-file read on import and throws ENOENT under ESM.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extract raw text from an uploaded resume file (Multer memory-storage object).
 * Supports PDF (pdf-parse) and DOCX (mammoth).
 *
 * @param {{ originalname?: string, mimetype?: string, buffer: Buffer }} file
 * @returns {Promise<string>} extracted plain text
 */
export async function extractText(file) {
  const name = (file.originalname || '').toLowerCase();
  const mime = file.mimetype || '';

  if (name.endsWith('.pdf') || mime === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  const isDocx =
    name.endsWith('.docx') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}
