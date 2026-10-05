import os
import re

site_dir = r"C:\Users\pc gold\projet dash\Adash pull XXXXXXXXXXXXX\SENSORIUM\sersonium\public\site"
files = [f for f in os.listdir(site_dir) if f.endswith(".html")]

mappings = [
    (r'data-path=["\']solutions["\']\s+href=["\']#?["\']', 'href="/site/solutions.html" data-path="solutions"'),
    (r'href=["\']#?["\']\s+data-path=["\']solutions["\']', 'href="/site/solutions.html" data-path="solutions"'),

    (r'data-path=["\']benefices-roi["\']\s+href=["\']#?["\']', 'href="/site/benefices_roi.html" data-path="benefices-roi"'),
    (r'href=["\']#?["\']\s+data-path=["\']benefices-roi["\']', 'href="/site/benefices_roi.html" data-path="benefices-roi"'),

    (r'data-path=["\']piliers["\']\s+href=["\']#?["\']', 'href="/site/piliers_industriels.html" data-path="piliers"'),
    (r'href=["\']#?["\']\s+data-path=["\']piliers["\']', 'href="/site/piliers_industriels.html" data-path="piliers"'),

    (r'data-path=["\']temoignages["\']\s+href=["\']#?["\']', 'href="/site/temoignages.html" data-path="temoignages"'),
    (r'href=["\']#?["\']\s+data-path=["\']temoignages["\']', 'href="/site/temoignages.html" data-path="temoignages"'),

    (r'data-path=["\']tarifs["\']\s+href=["\']#?["\']', 'href="/site/tarifs.html" data-path="tarifs"'),
    (r'href=["\']#?["\']\s+data-path=["\']tarifs["\']', 'href="/site/tarifs.html" data-path="tarifs"'),

    (r'data-path=["\']connexion["\']\s+href=["\']#?["\']', 'href="/site/authentification.html" data-path="connexion"'),
    (r'href=["\']#?["\']\s+data-path=["\']connexion["\']', 'href="/site/authentification.html" data-path="connexion"'),

    (r'data-path=["\']demander-une-demo["\']\s+href=["\']#?["\']', 'href="/site/demo.html" data-path="demander-une-demo"'),
    (r'href=["\']#?["\']\s+data-path=["\']demander-une-demo["\']', 'href="/site/demo.html" data-path="demander-une-demo"'),

    (r'data-path=["\']demarrer-essai-gratuit["\']\s+href=["\']#?["\']', 'href="/site/authentification.html" data-path="demarrer-essai-gratuit"'),
    (r'href=["\']#?["\']\s+data-path=["\']demarrer-essai-gratuit["\']', 'href="/site/authentification.html" data-path="demarrer-essai-gratuit"'),
]

for f in files:
    path = os.path.join(site_dir, f)
    with open(path, "r", encoding="utf-8", errors="ignore") as fp:
        html = fp.read()

    for pattern, repl in mappings:
        html = re.sub(pattern, repl, html)

    # Make brand logo link to /site/accueil.html or /site/index.html
    html = re.sub(
        r'(<div class="flex items-center gap-space-sm">)(\s*<img[^>]+>)(\s*<div class="flex flex-col">)',
        r'<a href="/site/index.html" class="flex items-center gap-space-sm text-inherit no-underline">\2\3</a>',
        html
    )

    # Add quick link to "Cockpit App" in the header if not present
    if '/dashboard' not in html:
        # replace the person icon with direct link to Dashboard / Cockpit
        html = html.replace(
            '<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div>',
            '<a href="/dashboard" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow hover:opacity-90 ml-space-xs" title="Ouvrir le Cockpit"><span class="material-symbols-outlined text-[16px]">speed</span><span>Cockpit</span></a>'
        )

    with open(path, "w", encoding="utf-8") as fp:
        fp.write(html)

print(f"Successfully processed {len(files)} landing pages with direct navigation links!")
