import base64
import os
import subprocess

def main():
    print("Reading logo assets...")
    with open('d:/Cura/Cura Logo.svg', 'rb') as f:
        svg_b64 = base64.b64encode(f.read()).decode('utf-8')
    with open('d:/Cura/cura_harmony_logo_1791226392255.jpg', 'rb') as f:
        jpg_b64 = base64.b64encode(f.read()).decode('utf-8')

    html_path = 'd:/Cura/CURA_System_Architecture_Specification.html'
    pdf_path = 'd:/Cura/CURA_System_Architecture_Specification.pdf'

    print("Embedding assets into HTML...")
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('__SVG_B64__', svg_b64)
    content = content.replace('__JPG_B64__', jpg_b64)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Compiling to PDF using Microsoft Edge...")
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if not os.path.exists(edge_path):
        edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

    cmd = [
        edge_path,
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={pdf_path}',
        f'file:///{html_path.replace("\\\\", "/")}'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(pdf_path):
        print(f"SUCCESS! PDF created at: {pdf_path}")
        print(f"File size: {os.path.getsize(pdf_path):,} bytes")
    else:
        print(f"FAILED! Return code: {res.returncode}")
        print("Stderr:", res.stderr)

if __name__ == '__main__':
    main()
