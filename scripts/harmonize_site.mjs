import fs from "fs";
import path from "path";

const standardFooter = `<footer class="w-full bg-surface-container-low text-on-surface-variant mt-space-xl shadow-[0_-1px_12px_rgba(0,0,0,0.03)]"><div class="w-full px-margin py-space-xl"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-lg pb-space-xl"><div class="lg:col-span-2 flex flex-col gap-space-md"><div class="flex items-center gap-space-sm"><svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;flex-shrink:0;border-radius:12px;background:linear-gradient(135deg,#1c1c1f 0%,#0e0e11 55%,#050507 100%);border:1px solid rgba(255,255,255,0.14);box-shadow:0 4px 16px rgba(0,0,0,0.55);"><defs><linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#F5D061"/><stop offset="100%" stop-color="#E5A93B"/></linearGradient><radialGradient id="sc2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#D97706"/></radialGradient></defs><path d="M32 10L52 21.5V42.5L32 54L12 42.5V21.5L32 10Z" stroke="url(#sg2)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="32" r="14" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="32" cy="32" r="9" stroke="url(#sg2)" stroke-width="2"/><circle cx="32" cy="32" r="4.5" fill="url(#sc2)"/><circle cx="32" cy="14" r="2.2" fill="#FFF"/><circle cx="46" cy="41" r="2.2" fill="#FFF"/><circle cx="18" cy="41" r="2.2" fill="#FFF"/></svg><span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Sensorium Spider Twin</span></div><p class="font-body-md text-body-md text-on-surface-variant max-w-md">Plateforme CAFM de nouvelle génération unifiant jumeaux spatiaux 3D, pilotage énergétique ultra-précis et optimisation prédictive du patrimoine bâti.</p><div class="flex items-center gap-space-xs mt-space-xs"><div class="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm"><span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>ISO 27001 Certified</div><div class="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm"><span class="w-2 h-2 rounded-full bg-primary"></span>SOC 2 Type II</div><div class="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm"><span class="w-2 h-2 rounded-full bg-secondary-container"></span>RGPD / HDS Ready</div></div></div><div class="flex flex-col gap-space-sm"><span class="font-title-md text-title-md text-on-surface font-semibold">Solutions CAFM</span><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/jumeau_numerique_3d.html" data-path="3d-digital-twin">Jumeau Numérique 3D</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/benefices_roi.html" data-path="benefices-roi">Performance Énergétique &amp; ROI</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/piliers_industriels.html" data-path="piliers">Gestion Technique des Bâtiments</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/solutions.html" data-path="solutions">Télémétrie &amp; Capteurs IoT</a></div><div class="flex flex-col gap-space-sm"><span class="font-title-md text-title-md text-on-surface font-semibold">Entreprise &amp; Valeur</span><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/temoignages.html" data-path="temoignages">Retours d'Expérience</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/tarifs.html" data-path="tarifs">Plans &amp; Déploiement</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/demo.html" data-path="demander-une-demo">Réserver une Démonstration</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="/site/authentification.html" data-path="demarrer-essai-gratuit">Accès Sandbox Immédiat</a></div><div class="flex flex-col gap-space-sm"><span class="font-title-md text-title-md text-on-surface font-semibold">Contact &amp; Sécurité</span><p class="font-body-sm text-body-sm text-on-surface-variant">Hub Opérations: Tour Spider, 42 Esp. de La Défense, Paris</p><a class="font-label-md text-label-md text-on-surface font-medium hover:text-primary transition-colors" href="mailto:telemetry@sensorium.com">telemetry@sensorium.com</a><a class="font-label-md text-label-md text-on-surface font-medium hover:text-primary transition-colors" href="tel:+33189714000">+33 (0)1 89 71 40 00</a><div class="mt-space-xs p-space-sm rounded-lg bg-surface-container-high"><span class="font-label-sm text-label-sm block text-on-surface-variant uppercase">Temps Réel Télémesure</span><span class="font-label-md text-label-md text-secondary font-semibold">99.98% SLA Haute Dispo</span></div></div></div><div class="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-high/40 p-space-md rounded-xl"><div class="flex items-center gap-space-md"><span class="font-label-sm text-label-sm text-on-surface-variant">© 2025 Sensorium Spider CAFM Systems. Tous droits réservés.</span></div><div class="flex items-center gap-space-lg font-body-sm text-body-sm text-on-surface-variant flex-wrap"><a class="hover:text-on-surface transition-colors" href="/site/securite.html" data-path="securite">Sécurité &amp; Souveraineté</a><a class="hover:text-primary font-semibold transition-colors text-primary" href="/site/developers.html" data-path="developers">API &amp; Développeurs</a><a class="hover:text-on-surface transition-colors" href="/site/regles.html" data-path="regles">Politique de Confidentialité</a><a class="hover:text-on-surface transition-colors" href="/site/conditions.html" data-path="conditions">Conditions d'Utilisation</a><a class="hover:text-on-surface transition-colors" href="/site/mentions-legales.html" data-path="mentions-legales">Mentions Légales</a><a class="hover:text-on-surface transition-colors" href="/site/regles.html#cookies" data-path="regles">Paramètres Cookies</a></div></div></div></footer>`;

// Script helper pour injecter le bouton de thème dans le header des pages HTML
const themeToggleScript = `
<script id="sensorium-theme-handler">
(function() {
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
    }
    var toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = isDark 
        ? '<span class="material-symbols-outlined text-[20px] text-amber-400">light_mode</span>' 
        : '<span class="material-symbols-outlined text-[20px] text-slate-700">dark_mode</span>';
      toggleBtn.title = isDark ? 'Passer en Mode Clair' : 'Passer en Mode Sombre';
    }
  }

  var savedTheme = localStorage.getItem('cafm_theme');
  var isDark = savedTheme ? savedTheme === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme(isDark);

  window.addEventListener('DOMContentLoaded', function() {
    var headerActions = document.querySelector('header .flex.items-center.gap-2.sm\\\\:gap-3');
    if (headerActions && !document.getElementById('theme-toggle-btn')) {
      var btn = document.createElement('button');
      btn.id = 'theme-toggle-btn';
      btn.type = 'button';
      btn.className = 'p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer shadow-sm border border-surface-variant/40';
      btn.setAttribute('aria-label', 'Basculer le thème');
      btn.innerHTML = document.documentElement.classList.contains('dark')
        ? '<span class="material-symbols-outlined text-[20px] text-amber-400">light_mode</span>' 
        : '<span class="material-symbols-outlined text-[20px] text-slate-700">dark_mode</span>';
      btn.title = document.documentElement.classList.contains('dark') ? 'Passer en Mode Clair' : 'Passer en Mode Sombre';
      
      btn.addEventListener('click', function() {
        var currentIsDark = document.documentElement.classList.contains('dark');
        var newIsDark = !currentIsDark;
        localStorage.setItem('cafm_theme', newIsDark ? 'dark' : 'light');
        localStorage.setItem('cafm_theme_mode', newIsDark ? 'dark' : 'light');
        applyTheme(newIsDark);
      });
      
      headerActions.insertBefore(btn, headerActions.firstChild);
    }
  });
})();
</script>
`;

const dir = path.join(process.cwd(), "public", "site");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html") && f !== "sensorium_brand_logo.html");

let updated = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // 1. Remplacement ou insertion du footer
  if (content.includes("<footer")) {
    const footerRegex = /<footer[\s\S]*?<\/footer>/i;
    content = content.replace(footerRegex, standardFooter);
  }

  // 2. Injection du gestionnaire de thème clair/sombre si absent
  if (!content.includes('id="sensorium-theme-handler"')) {
    content = content.replace("</body>", themeToggleScript + "\n</body>");
  }

  fs.writeFileSync(filePath, content, "utf-8");
  updated++;
}

console.log(`Successfully updated and harmonized ${updated} HTML pages.`);
