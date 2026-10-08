import fs from 'fs';
import path from 'path';

const siteDir = path.resolve('public/site');
const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));

const mapping = {
  'accueil': '/site/accueil.html',
  'architecture': '/site/architecture.html',
  'authentification': '/site/authentification.html',
  'connexion': '/site/authentification.html',
  'demarrer-essai-gratuit': '/site/authentification.html',
  'benefices-roi': '/site/benefices_roi.html',
  'benefices_roi': '/site/benefices_roi.html',
  'demo': '/site/demo.html',
  'demander-une-demo': '/site/demo.html',
  'digital-twin-lifecycle': '/site/digital_twin_lifecycle.html',
  'digital_twin_lifecycle': '/site/digital_twin_lifecycle.html',
  'esg-carbon': '/site/esg_carbon.html',
  'esg-and-carbon': '/site/esg_carbon.html',
  'esg_carbon': '/site/esg_carbon.html',
  '3d-digital-twin': '/site/jumeau_numerique_3d.html',
  'jumeau_numerique_3d': '/site/jumeau_numerique_3d.html',
  'piliers': '/site/piliers_industriels.html',
  'piliers_industriels': '/site/piliers_industriels.html',
  '6-core-pillars': '/site/piliers_industriels.html',
  'sector_solutions': '/site/sector_solutions.html',
  'solutions': '/site/solutions.html',
  'tarifs': '/site/tarifs.html',
  'pricing': '/site/tarifs.html',
  'temoignages': '/site/temoignages.html',
  'cockpit': '/dashboard',
  'grafana-observability': '/dashboard'
};

const scriptToInject = `
<script id="sensorium-navigation-bridge">
(function() {
  var pathMap = ${JSON.stringify(mapping)};
  
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-path]');
    if (!el) return;
    var target = el.getAttribute('data-path');
    if (!target) return;
    
    e.preventDefault();
    if (pathMap[target]) {
      window.location.href = pathMap[target];
    } else if (target === 'cockpit' || target === 'overview') {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/site/' + target + '.html';
    }
  });

  // Assurer la redirection automatique de tous les boutons Cockpit / Dashboard vers /dashboard
  document.querySelectorAll('a, button').forEach(function(btn) {
    var text = (btn.textContent || '').trim().toLowerCase();
    if (text.includes('cockpit') || text.includes('execute override') || text.includes('launch cockpit')) {
      if (!btn.getAttribute('href') || btn.getAttribute('href') === '#') {
        btn.setAttribute('href', '/dashboard');
        btn.onclick = function(ev) {
          ev.preventDefault();
          window.location.href = '/dashboard';
        };
      }
    }
  });
})();
</script>
`;

let updatedCount = 0;
for (const file of files) {
  const fullPath = path.join(siteDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes('id="sensorium-navigation-bridge"')) {
    if (content.includes('</body>')) {
      content = content.replace('</body>', scriptToInject + '\n</body>');
    } else {
      content += scriptToInject;
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    updatedCount++;
  }
}
console.log(`Injected navigation bridge script into ${updatedCount} files.`);
