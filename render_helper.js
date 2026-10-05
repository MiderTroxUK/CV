const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function renderPdf(htmlRelPath, pdfRelPath) {
  const htmlAbs = path.resolve(__dirname, htmlRelPath);
  const pdfAbs = path.resolve(__dirname, pdfRelPath);
  const fileUrl = 'file:///' + htmlAbs.replace(/\\/g, '/');

  console.log(`Rendering PDF: ${htmlRelPath} -> ${pdfRelPath}`);
  const args = [
    '--headless=old',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfAbs}`,
    fileUrl
  ];

  execFileSync(CHROME, args, { stdio: 'inherit' });
  
  const content = fs.readFileSync(pdfAbs).toString('latin1');
  const pages = (content.match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`Successfully generated ${pdfRelPath} (Page count: ${pages}, Size: ${content.length} bytes)`);
  return { pdfAbs, pages, size: content.length };
}

function renderScreenshot(htmlRelPath, imgRelPath, width = 1200, height = 1600) {
  const htmlAbs = path.resolve(__dirname, htmlRelPath);
  const imgAbs = path.resolve(__dirname, imgRelPath);
  const fileUrl = 'file:///' + htmlAbs.replace(/\\/g, '/');

  console.log(`Rendering Screenshot: ${htmlRelPath} -> ${imgRelPath} (${width}x${height})`);
  const args = [
    '--headless=old',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--screenshot=${imgAbs}`,
    fileUrl
  ];

  execFileSync(CHROME, args, { stdio: 'inherit' });
  const stat = fs.statSync(imgAbs);
  console.log(`Successfully generated ${imgRelPath} (Size: ${stat.size} bytes)`);
  return { imgAbs, size: stat.size };
}

function inspectPdf(pdfRelPath) {
  const pdfAbs = path.resolve(__dirname, pdfRelPath);
  const buf = fs.readFileSync(pdfAbs);
  const str = buf.toString('latin1');
  const pages = (str.match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`Inspecting ${pdfRelPath}: ${buf.length} bytes, ${pages} page(s)`);
}

function buildAll() {
  console.log('=== RENDERING CV ===');
  const cvPdf = renderPdf('CV John Hoarau FR - SIAe Ingenieur Structure.dc.html', 'CV - John Hoarau - SIAe Ingenieur Structure.pdf');
  const cvImg = renderScreenshot('CV John Hoarau FR - SIAe Ingenieur Structure.dc.html', 'screenshots/siae-structure-cv.png');
  inspectPdf('CV - John Hoarau - SIAe Ingenieur Structure.pdf');

  console.log('\n=== RENDERING COVER LETTER ===');
  const lmPdf = renderPdf('Lettre de motivation FR - SIAe Ingenieur Structure.dc.html', 'Lettre de motivation - John Hoarau - SIAe Ingenieur Structure.pdf');
  const lmImg = renderScreenshot('Lettre de motivation FR - SIAe Ingenieur Structure.dc.html', 'screenshots/siae-structure-lm.png');
  inspectPdf('Lettre de motivation - John Hoarau - SIAe Ingenieur Structure.pdf');

  console.log('\n=== SUMMARY ===');
  console.log(`CV PDF pages: ${cvPdf.pages} (Expected: 1)`);
  console.log(`LM PDF pages: ${lmPdf.pages} (Expected: 1)`);
  
  if (cvPdf.pages !== 1 || lmPdf.pages !== 1) {
    console.error('ERROR: PAGE COUNT VIOLATION DETECTED!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Both documents fit strictly on exactly 1 page.');
  }
}

function buildSafran() {
  console.log('=== RENDERING SAFRAN ED CV ===');
  const cvPdf = renderPdf('CV John Hoarau FR - Safran ED Ingenieur Systeme Mecatronique.dc.html', 'CV - John Hoarau - Safran ED Ingenieur Systeme Mecatronique.pdf');
  const cvImg = renderScreenshot('CV John Hoarau FR - Safran ED Ingenieur Systeme Mecatronique.dc.html', 'screenshots/safran-ed-cv.png');
  inspectPdf('CV - John Hoarau - Safran ED Ingenieur Systeme Mecatronique.pdf');

  console.log('\n=== RENDERING SAFRAN ED COVER LETTER ===');
  const lmPdf = renderPdf('Lettre de motivation FR - Safran ED Ingenieur Systeme Mecatronique.dc.html', 'Lettre de motivation - John Hoarau - Safran ED Ingenieur Systeme Mecatronique.pdf');
  const lmImg = renderScreenshot('Lettre de motivation FR - Safran ED Ingenieur Systeme Mecatronique.dc.html', 'screenshots/safran-ed-lm.png');
  inspectPdf('Lettre de motivation - John Hoarau - Safran ED Ingenieur Systeme Mecatronique.pdf');

  console.log('\n=== SUMMARY SAFRAN ED ===');
  console.log(`CV PDF pages: ${cvPdf.pages} (Expected: 1)`);
  console.log(`LM PDF pages: ${lmPdf.pages} (Expected: 1)`);
  
  if (cvPdf.pages !== 1 || lmPdf.pages !== 1) {
    console.error('ERROR: PAGE COUNT VIOLATION DETECTED FOR SAFRAN!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Both Safran documents fit strictly on exactly 1 page.');
  }
}

function buildSafranAE() {
  console.log('=== RENDERING SAFRAN AIRCRAFT ENGINES COVER LETTER ===');
  const lmPdf = renderPdf('Lettre de motivation FR - Safran AE Ingenieur Mecanique Support Production.dc.html', 'Lettre de motivation - John Hoarau - Safran AE Ingenieur Mecanique Support Production.pdf');
  const lmImg = renderScreenshot('Lettre de motivation FR - Safran AE Ingenieur Mecanique Support Production.dc.html', 'screenshots/safran-ae-mecanique-lm.png');
  inspectPdf('Lettre de motivation - John Hoarau - Safran AE Ingenieur Mecanique Support Production.pdf');

  console.log('\n=== SUMMARY SAFRAN AIRCRAFT ENGINES ===');
  console.log(`LM PDF pages: ${lmPdf.pages} (Expected: 1)`);
  
  if (lmPdf.pages !== 1) {
    console.error('ERROR: PAGE COUNT VIOLATION DETECTED FOR SAFRAN AIRCRAFT ENGINES!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Safran Aircraft Engines cover letter fits strictly on exactly 1 page.');
  }
}

module.exports = { renderPdf, renderScreenshot, inspectPdf, buildAll, buildSafran, buildSafranAE };

if (require.main === module) {
  const target = process.argv[2];
  if (target === 'safran') {
    buildSafran();
  } else if (target === 'safran-ae') {
    buildSafranAE();
  } else if (target === 'siae') {
    buildAll();
  } else {
    buildSafran();
    buildSafranAE();
    buildAll();
  }
}
