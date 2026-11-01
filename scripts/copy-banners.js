import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('public', 'banners');

for (let i = 1; i <= 28; i++) {
  const folder = path.join(baseDir, `high_resolution_enterprise_visual_banner_16_9_format_for_sensorium_cafm_pro_${i}`);
  const src = path.join(folder, 'screen.png');
  const dest = path.join(baseDir, `banner-${i}.png`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied banner-${i}.png (${(fs.statSync(dest).size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.warn(`File not found: ${src}`);
  }
}
