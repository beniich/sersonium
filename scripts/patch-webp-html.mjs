/**
 * SENSORIUM — Patch HTML pour images WebP avec fallback PNG (Axe 7)
 * Remplace chaque <img src="xxx.png"> par <picture><source srcset="xxx.webp"...><img...></picture>
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const SITE_DIR = join(__dirname.replace(/\\/g, '/').replace(/\/$/, ''), '..', 'public', 'site');

// Images converties en WebP
const WEBP_IMAGES = [
  'accueil', 'architecture', 'authentification', 'benefices_roi',
  'demo', 'esg_carbon', 'jumeau_numerique_3d', 'piliers_industriels',
  'sensorium_brand_logo', 'solutions', 'tarifs', 'temoignages'
];

function patchHtml(html, imageName) {
  // Remplace <img src="/site/IMAGE.png"... ou "IMAGE.png"... par <picture> avec fallback
  const pngPatterns = [
    // <img ... src="/site/IMAGE.png" ...>
    new RegExp(`(<img\\s[^>]*src=["'][^"']*\\/${imageName}\\.png["'][^>]*>)`, 'gi'),
    // <img ... src="IMAGE.png" ...>
    new RegExp(`(<img\\s[^>]*src=["']${imageName}\\.png["'][^>]*>)`, 'gi'),
  ];

  let patched = html;
  for (const pattern of pngPatterns) {
    patched = patched.replace(pattern, (match) => {
      // Evite le double-wrapping
      if (patched.includes(`source srcset="${imageName}.webp"`) ||
          patched.includes(`source srcset="/site/${imageName}.webp"`)) {
        return match;
      }
      // Determine le srcset avec le bon chemin
      const srcMatch = match.match(/src=["']([^"']+)["']/i);
      if (!srcMatch) return match;
      const srcPath = srcMatch[1];
      const webpPath = srcPath.replace(`${imageName}.png`, `${imageName}.webp`);
      return `<picture><source srcset="${webpPath}" type="image/webp">${match}</picture>`;
    });
  }
  return patched;
}

async function main() {
  console.log('\n🔄 SENSORIUM — Patch HTML WebP avec fallback PNG\n');

  const files = await readdir(SITE_DIR);
  const htmlFiles = files.filter(f => extname(f) === '.html');

  let totalPatched = 0;
  let totalReplacements = 0;

  for (const file of htmlFiles) {
    const filePath = join(SITE_DIR, file);
    let html = await readFile(filePath, 'utf-8');
    let original = html;

    for (const imgName of WEBP_IMAGES) {
      html = patchHtml(html, imgName);
    }

    if (html !== original) {
      await writeFile(filePath, html, 'utf-8');
      totalPatched++;
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ⏭️  ${file} (aucune image PNG directe)`);
    }
  }

  console.log(`\n  📊 ${totalPatched}/${htmlFiles.length} fichiers HTML patchés\n`);
}

main().catch(e => { console.error('Erreur:', e); process.exit(1); });
