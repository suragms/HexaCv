import { Resume } from '@shared/types';

/**
 * Export resume to PDF
 * Note: In production, you would use jsPDF + html2canvas
 * For now, this is a placeholder that uses browser print functionality
 */
export async function exportResumeToPDF(resumeElement: HTMLElement, fileName: string = 'resume.pdf') {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    // Clone the resume element
    const clonedElement = resumeElement.cloneNode(true) as HTMLElement;

    // Write content to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${fileName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.5;
              color: #1f2937;
              background: white;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            @page {
              margin: 0.5in;
              size: letter;
            }
          </style>
        </head>
        <body>
          ${clonedElement.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

/**
 * Generate a downloadable PDF using canvas rendering
 * This is an alternative approach that doesn't require user interaction
 */
export async function generatePDFFromHTML(
  htmlElement: HTMLElement,
  fileName: string = 'resume.pdf'
): Promise<void> {
  try {
    // Check if jsPDF is available
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Render HTML to canvas
    const canvas = await html2canvas(htmlElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions
    const imgWidth = pageWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add image to PDF, handling multiple pages if needed
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    // Download the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    // Fallback to print dialog
    window.print();
  }
}

/**
 * Create a blob URL for the PDF
 */
export async function createPDFBlob(htmlElement: HTMLElement): Promise<Blob> {
  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Render HTML to canvas
    const canvas = await html2canvas(htmlElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    // Convert to blob
    return pdf.output('blob') as Blob;
  } catch (error) {
    console.error('Failed to create PDF blob:', error);
    throw error;
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export resume to DOCX (Microsoft Word format via styled HTML-mime-type envelope)
 */
export async function exportResumeToDOCX(element: HTMLElement, fileName: string = 'resume.docx') {
  try {
    const contentHtml = element.innerHTML;
    
    // CSS that Word will parse and apply to match our emerald ATS single-column design
    const css = `
      @page {
        size: 8.5in 11in;
        margin: 0.5in;
      }
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.3;
        color: #1f2937;
      }
      h1 {
        font-size: 22pt;
        font-weight: bold;
        color: #065f46;
        text-align: center;
        margin-bottom: 2pt;
        margin-top: 0px;
      }
      p {
        font-size: 10pt;
        margin-top: 2pt;
        margin-bottom: 2pt;
        color: #1f2937;
      }
      a {
        color: #047857;
        text-decoration: none;
      }
      hr {
        border: none;
        border-top: 2px solid #047857;
        margin-top: 6pt;
        margin-bottom: 8pt;
      }
      h2 {
        font-size: 10pt;
        font-weight: bold;
        color: #047857;
        text-transform: uppercase;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1pt;
        margin-top: 12pt;
        margin-bottom: 6pt;
      }
      h3 {
        font-size: 10pt;
        font-weight: bold;
        color: #111827;
        margin: 0;
      }
      ul {
        margin-top: 2pt;
        margin-bottom: 4pt;
        padding-left: 15pt;
      }
      li {
        font-size: 9.5pt;
        margin-bottom: 2pt;
        color: #374151;
      }
      .text-emerald-800 {
        color: #065f46 !important;
      }
      .text-emerald-700 {
        color: #047857 !important;
      }
      .text-emerald-600 {
        color: #059669 !important;
      }
      .text-gray-900 {
        color: #111827 !important;
      }
      .text-gray-800 {
        color: #1f2937 !important;
      }
      .text-gray-700 {
        color: #374151 !important;
      }
      .text-gray-600 {
        color: #4b5563 !important;
      }
      .text-gray-500 {
        color: #6b7280 !important;
      }
      .italic {
        font-style: italic;
      }
      .font-bold {
        font-weight: bold;
      }
      .uppercase {
        text-transform: uppercase;
      }
    `;

    const htmlString = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${fileName}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            ${css}
          </style>
        </head>
        <body>
          <div class="WordSection1">
            ${contentHtml}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlString], {
      type: 'application/msword;charset=utf-8'
    });

    const finalFileName = fileName.endsWith('.doc') || fileName.endsWith('.docx') ? fileName : `${fileName}.doc`;
    downloadBlob(blob, finalFileName);
  } catch (error) {
    console.error('Failed to export DOCX:', error);
    throw error;
  }
}
