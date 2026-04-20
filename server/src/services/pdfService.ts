import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const generatePdf = async (state: string, data: any) => {
  const templatePath = path.join(__dirname, `../templates/${state.toLowerCase()}.html`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template for ${state} not found`);
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  // Simple template interpolation
  Object.keys(data).forEach(key => {
    const value = data[key];
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(placeholder, typeof value === 'string' ? value : JSON.stringify(value));
  });

  // Inject current date and organizer if missing
  if (html.includes('{{formationDate}}')) {
    html = html.replace(/{{formationDate}}/g, new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }));
  }
  if (html.includes('{{organizerName}}')) {
    html = html.replace(/{{organizerName}}/g, data.members?.[0]?.fullName || 'Authorized Person');
  }

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letters',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' }
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return Buffer.from('PDF Generation Mockup - Puppeteer requires Chromium installation in environment');
  }
};
