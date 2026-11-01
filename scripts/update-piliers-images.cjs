const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace external stock images with rich SENSORIUM photography
  // 1. BIM Slice image in Pillar 4
  const oldBimImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCh6hG-GTAcGkt-1_Mc0B7omj3k5VnRkHtE0P9lJqxBgPjDVxYvhzv84kBdXkpbs6N3Asv8slG2iJgg4QTpE4NM45cHuO7gOS_xPRawgfwbQBiyaP-GVOaLc22Pv6j4XQivKtmlzR5TaNvgG8v4B6jnytgdTm6T5abKTamawJm4T3yuJXi4r6FRp9jIfwcn9KWm6Gi5FrQpp0zpNVl-otPaMAwfAIEDRnjZ_I3zpb4swz_ViG6EoRo';
  if (content.includes(oldBimImg)) {
    content = content.replace(oldBimImg, '/assets/showcase/sensorium-thermal-substation.jpg');
    console.log(`Updated BIM image in ${filePath}`);
  }

  // 2. Add DALI circadian before CityPulse DALI if not already there
  if (!content.includes('sensorium-dali-circadian')) {
    const daliSearch = 'Circadien CityPulse DALI';
    if (content.includes(daliSearch)) {
      const idx = content.indexOf(daliSearch);
      // Find the enclosing div before idx
      const divStart = content.lastIndexOf('<div class="p-space-sm', idx);
      if (divStart !== -1) {
        const previewBlock = '<div class="relative w-full h-24 rounded-lg overflow-hidden flex items-center justify-center bg-surface-container mb-2"><picture><source srcset="/assets/showcase/sensorium-dali-circadian.webp" type="image/webp"><img class="w-full h-full object-cover" alt="DALI-2 Circadian Lux Balancer" src="/assets/showcase/sensorium-dali-circadian.jpg"></picture><div class="absolute bottom-1 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow font-label-sm text-label-sm text-primary font-mono">-42% Shaving</div></div>';
        content = content.slice(0, divStart) + previewBlock + content.slice(divStart);
        console.log(`Added DALI circadian preview in ${filePath}`);
      }
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('public/site/piliers_industriels.html');
if (fs.existsSync('public/site/fr/piliers_industriels.html')) {
  updateFile('public/site/fr/piliers_industriels.html');
}
console.log('Script execution completed.');
