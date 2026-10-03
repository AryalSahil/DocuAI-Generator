import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Compiles a high-resolution, pixel-perfect A4 PDF directly from the active preview DOM element.
 * 
 * @param elementId The DOM element ID containing the compiled template HTML
 * @param filename The target download file name (e.g. "certificate-jenkins.pdf")
 * @param verificationHash Optional verification code/hash to dynamically generate and embed as a QR code
 */
export async function generatePdf(elementId: string, filename: string, verificationHash?: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Target preview element with ID "${elementId}" was not found.`);
  }

  // Backup active responsive styling attributes to restore them post-render
  const originalStyle = element.getAttribute('style') || '';
  const originalWidth = element.style.width;
  const originalHeight = element.style.height;
  const originalTransform = element.style.transform;

  // Force standard desktop A4 screen dimensions (794px width, 1123px height)
  // This guarantees that the PDF is rendered crisp, perfectly aligned, and independent of zoom/device screens.
  element.style.transform = 'none';
  element.style.width = '794px';
  element.style.height = '1123px';
  element.style.maxWidth = 'none';

  // Dynamically generate and append a unique QR code in the corner if requested
  let qrContainer: HTMLDivElement | null = null;
  if (verificationHash) {
    // Check if there is already a QR code inside the DOM (to avoid duplicates)
    const existingQr = element.querySelector('.qr-code-embed-badge');
    if (!existingQr) {
      qrContainer = document.createElement('div');
      qrContainer.className = 'qr-code-embed-badge';
      qrContainer.style.position = 'absolute';
      qrContainer.style.bottom = '24px';
      qrContainer.style.right = '24px';
      qrContainer.style.zIndex = '999';
      qrContainer.style.display = 'flex';
      qrContainer.style.flexDirection = 'column';
      qrContainer.style.alignItems = 'center';
      qrContainer.style.gap = '3px';
      qrContainer.style.background = '#ffffff';
      qrContainer.style.padding = '6px';
      qrContainer.style.borderRadius = '6px';
      qrContainer.style.border = '1px solid #e2e8f0';
      qrContainer.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';

      const qrImg = document.createElement('img');
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(verificationHash)}`;
      qrImg.style.width = '52px';
      qrImg.style.height = '52px';
      qrImg.style.display = 'block';

      const qrLabel = document.createElement('span');
      qrLabel.textContent = 'SECURE VERIFY';
      qrLabel.style.fontSize = '6px';
      qrLabel.style.fontFamily = 'monospace';
      qrLabel.style.fontWeight = 'bold';
      qrLabel.style.color = '#4f46e5';
      qrLabel.style.letterSpacing = '0.5px';

      qrContainer.appendChild(qrImg);
      qrContainer.appendChild(qrLabel);
      element.appendChild(qrContainer);

      // Wait for the QR code image to fully load before rendering the PDF canvas
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => resolve();
        setTimeout(resolve, 1000); // safety fallback timeout
      });
    }
  }

  try {
    // Give browser brief layout paint cycle and image caching time
    await new Promise((resolve) => setTimeout(resolve, 600));

    const canvas = await html2canvas(element, {
      scale: 2.5,          // Retina quality super-sampling
      useCORS: true,       // Critical for cross-origin assets (e.g. API QR code)
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Paint the captured screen canvas cleanly across the A4 page boundaries
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
    const pdfDataUri = pdf.output('datauristring');
    return pdfDataUri;
  } catch (error) {
    console.error('PDF Generation Failed:', error);
    throw error;
  } finally {
    // Clean up dynamic QR code if we added it manually
    if (qrContainer && element.contains(qrContainer)) {
      element.removeChild(qrContainer);
    }

    // Restore the responsive and zoom styles instantly
    element.setAttribute('style', originalStyle);
    element.style.width = originalWidth;
    element.style.height = originalHeight;
    element.style.transform = originalTransform;
  }
}
