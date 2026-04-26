import pdfplumber

pdf = pdfplumber.open('bylaw-2024.pdf')
print(f"Total pages: {len(pdf.pages)}\n")

# Extract and save all text to a file
with open('extracted_pdf_content.txt', 'w', encoding='utf-8') as f:
    for i, page in enumerate(pdf.pages):
        f.write(f"\n\n{'='*80}\nPAGE {i+1}\n{'='*80}\n\n")
        text = page.extract_text()
        if text:
            f.write(text)
        else:
            f.write("[No text content on this page]")

print("PDF content extracted and saved to 'extracted_pdf_content.txt'")
