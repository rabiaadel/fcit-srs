import PyPDF2
import sys

def extract_text(pdf_path):
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ''
            for i, page in enumerate(reader.pages):
                text += f"--- PAGE {i+1} ---\n"
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    text = extract_text("AI_Level1 (1)_merged.pdf")
    with open("pdf_output.txt", "w", encoding="utf-8") as out:
        out.write(text)
    print("Done")
