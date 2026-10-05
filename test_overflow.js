const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function checkOverflow(file) {
  const html = fs.readFileSync(file, 'utf8');
  const inject = `
<style>
  .page > div {
    bottom: auto !important;
    height: max-content !important;
  }
</style>
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    const page = document.querySelector('.page');
    const div = document.querySelector('.page > div');
    if (page && div) {
      document.title = 'CONTENT_HEIGHT: ' + div.offsetHeight + ', PAGE_HEIGHT: ' + page.clientHeight + ', DIFF: ' + (page.clientHeight - div.offsetHeight);
    }
  }, 1000);
});
</script>
`;
  const tempFile = 'temp_' + Date.now() + '.html';
  fs.writeFileSync(tempFile, html.replace('</head>', inject + '</head>'));
  
  const args = [
    '--headless=old',
    '--disable-gpu',
    '--virtual-time-budget=2000',
    '--dump-dom',
    'file:///' + path.resolve(tempFile).replace(/\\/g, '/')
  ];
  
  try {
    const out = execFileSync(CHROME, args, { encoding: 'utf8' });
    const match = out.match(/<title>(.*?)<\/title>/);
    console.log(file, match ? match[1] : 'No title');
  } finally {
    fs.unlinkSync(tempFile);
  }
}

checkOverflow('Lettre de motivation FR - Safran AE Ingenieur Mecanique Support Production.dc.html');
checkOverflow('Lettre de motivation FR - Safran ED Ingenieur Systeme Mecatronique.dc.html');
checkOverflow('CV John Hoarau FR - Safran ED Ingenieur Systeme Mecatronique.dc.html');
