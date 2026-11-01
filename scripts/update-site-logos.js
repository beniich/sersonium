import fs from 'fs';
import path from 'path';

const siteDir = path.resolve('public', 'site');
const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));
let count = 0;

for (const file of files) {
  const filePath = path.join(siteDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Insert or update favicon link
  if (!content.includes('/logo-icon.png')) {
    if (content.includes('<head>')) {
      content = content.replace(
        '<head>',
        '<head><link rel="icon" type="image/png" href="/logo-icon.png"><link rel="apple-touch-icon" href="/logo-icon.png">'
      );
      changed = true;
    }
  }

  // Update header SVG logo to official logo if present
  if (content.includes('href="/site/accueil.html" class="flex items-center gap-3 text-inherit no-underline shrink-0 group">')) {
    // Replace SVG inside logo link with clean logo-icon img
    const regexLogo = /<a href="\/site\/accueil\.html" class="flex items-center gap-3 text-inherit no-underline shrink-0 group">\s*<svg[\s\S]*?<\/svg>/;
    if (regexLogo.test(content)) {
      content = content.replace(
        regexLogo,
        `<a href="/site/accueil.html" class="flex items-center gap-3 text-inherit no-underline shrink-0 group"><div class="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0"><img src="/logo-icon.png" alt="SENSORIUM Icon" class="w-full h-full object-contain"></div>`
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
}

console.log(`Updated logos & favicons across ${count} vitrine HTML pages.`);
