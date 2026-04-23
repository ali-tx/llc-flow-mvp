import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const STATE_TEMPLATE_MAP: Record<string, string> = {
  DE: 'de',
  WY: 'wy',
  CA: 'ca',
};

export const generatePdf = async (state: string, data: any): Promise<Buffer> => {
  const stateKey = state.toUpperCase();
  const templateName = STATE_TEMPLATE_MAP[stateKey] || 'de';
  const templatePath = path.join(__dirname, `../templates/${templateName}.html`);

  // Fallback to DE if specific state template missing
  const resolvedPath = fs.existsSync(templatePath)
    ? templatePath
    : path.join(__dirname, '../templates/de.html');

  let html = fs.readFileSync(resolvedPath, 'utf8');

  // Interpolate all {{ key }} placeholders
  const formattedDate = data.formationDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const replacements: Record<string, string> = {
    businessName: data.businessName || 'Your Company LLC',
    state: data.state || 'Delaware',
    stateAbbr: data.stateAbbr || 'DE',
    principalOfficeAddress: data.principalOfficeAddress || '',
    registeredAgentName: data.registeredAgentName || 'Northwest Registered Agent',
    registeredAgentAddress: data.registeredAgentAddress || '8 The Green, Ste B, Dover, DE 19901',
    authorizedSignerName: data.authorizedSignerName || data.members?.[0]?.name || 'Authorized Person',
    authorizedSignerTitle: data.authorizedSignerTitle || 'Managing Member',
    organizerName: data.authorizedSignerName || data.members?.[0]?.name || 'Authorized Person',
    formationDate: formattedDate,
    memberNames: Array.isArray(data.members)
      ? data.members.map((m: any) => m.name).join(', ')
      : '',
  };

  Object.entries(replacements).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('[pdfService] Puppeteer error:', error);
    // Return a minimal PDF placeholder
    return Buffer.from('%PDF-1.4 placeholder - install Chromium for real PDFs');
  }
};
