import sys
from pdf2docx import Converter

def convert_pdf_to_docx(pdf_path, docx_path):
    cv = None
    try:
        # Initializing the converter
        cv = Converter(pdf_path)
        # Convert all pages
        cv.convert(docx_path, start=0, end=None)
        print("SUCCESS")
    except Exception as e:
        # Print the exception string so Node.js can log it securely (without exposing raw stack traces to the user directly, the node bridge intercepts this)
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)
    finally:
        if cv:
            cv.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdf_to_docx.py <input.pdf> <output.docx>", file=sys.stderr)
        sys.exit(1)

    pdf_file = sys.argv[1]
    docx_file = sys.argv[2]
    
    convert_pdf_to_docx(pdf_file, docx_file)
