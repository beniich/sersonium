import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_DIR = join(__dirname, '..', 'public', 'site');

const EXCLUDE = new Set(['digital_twin_lifecycle.png']);

async function main() {
  console.log('\n🖼️  SENSORIUM — Conversion PNG -> WebP (qualite 80%)\n');

  const files = await readdir(SITE_DIR);
  const pngFiles = files.filter(f => extname(f).toLowerCase() === '.png' && !EXCLUDE.has(f));

  if (pngFiles.length === 0) { console.log('Aucun PNG a convertir.'); return; }

  let totalSavedKb = 0;

  for (const file of pngFiles) {
    const inputPath = join(SITE_DIR, file);
    const outputName = basename(file, '.png') + '.webp';
    const outputPath = join(SITE_DIR, outputName);
    try {
      const before = Math.round((await stat(inputPath)).size / 1024);
      await sharp(inputPath).webp({ quality: 80, effort: 4 }).toFile(outputPath);
      const after = Math.round((await stat(outputPath)).size / 1024);
      const saved = before - after;
      totalSavedKb += saved;
      console.log(`  ✅ ${file.padEnd(35)} ${String(before).padStart(6)} KB -> ${String(after).padStart(6)} KB  (-${Math.round(saved/before*100)}%)`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }

  console.log(`\n  📊 Total economise : ${Math.round(totalSavedKb)} KB (${(totalSavedKb/1024).toFixed(1)} MB)\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
