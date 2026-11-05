export interface BannerPoster {
  id: number;
  title: string;
  subtitle: string;
  category: 'supervision' | 'security' | 'compliance' | 'energy' | 'twin' | 'robotics';
  image: string;
  description: string;
  tags: string[];
}

export const SENSORIUM_POSTERS: BannerPoster[] = [

  {
    "id": 1,
    "title": "Plateforme CAFM Futuriste SENSORIUM",
    "subtitle": "Supervision globale, GMAO augmentée et hypervision souveraine",
    "category": "twin",
    "image": "/affiche/plateforme-cafm-futuriste-sensorium.png",
    "description": "Modélisation spatiale unifiée, monitoring temps réel et orchestration intelligente des infrastructures critiques.",
    "tags": [
      "CAFM Pro",
      "Hypervision",
      "IoT"
    ]
  },
  {
    "id": 2,
    "title": "Sécurité Intelligente & Confiance Totale",
    "subtitle": "Architecture Zero-Trust, chiffrement de bout en bout et coffre éphémère",
    "category": "security",
    "image": "/affiche/securite-intelligente-et-confiance-totale.png",
    "description": "Protection périmétrique mTLS, clés cryptographiques session-level, isolation multi-tenant stricte et audit continu.",
    "tags": [
      "Zero-Trust",
      "mTLS",
      "Cyber-Résilience"
    ]
  },
  {
    "id": 3,
    "title": "Infrastructure Cloud Souveraine & Performante",
    "subtitle": "Déploiement multi-cloud hybride, edge computing et haute disponibilité",
    "category": "supervision",
    "image": "/affiche/infrastructure-cloud-souveraine-et-performante.png",
    "description": "Orchestration résiliente sans dépendance externe, latence sub-milliseconde et tolérance aux pannes native.",
    "tags": [
      "Cloud Souverain",
      "Edge AI",
      "Haute Dispo"
    ]
  },
  {
    "id": 4,
    "title": "Plateforme SaaS de Conformité Futuriste",
    "subtitle": "Conformité DORA Art. 24, ISO 27001 et reporting ESG / CSRD Scope 1-3",
    "category": "compliance",
    "image": "/affiche/plateforme-saas-de-conformite-futuriste.png",
    "description": "Génération automatisée de rapports d'audit horodatés cryptographiquement SHA-256 avec archivage probant.",
    "tags": [
      "DORA",
      "ISO 27001",
      "CSRD"
    ]
  },
  {
    "id": 5,
    "title": "Fonctionnalités Puissantes & Gestion Intelligente",
    "subtitle": "Gestion de cycle de vie des actifs industriels et maintenance prédictive IA",
    "category": "supervision",
    "image": "/affiche/fonctionnalites-puissantes-gestion-intelligente-securisee.png",
    "description": "Planification dynamique des interventions, suivi des ordres de travail et optimisation énergétique des parcs CVC.",
    "tags": [
      "GMAO Pro",
      "Actifs 360°",
      "IA Prédictive"
    ]
  },
  {
    "id": 6,
    "title": "SENSORIUM CAFM PRO : Performance Opérationnelle",
    "subtitle": "KPIs consolidés, optimisation des coûts et réduction continue du gaspillage",
    "category": "energy",
    "image": "/affiche/sensorium-cafm-pro-performance-operationnelle.png",
    "description": "Métriques financières et techniques unifiées pour décideurs C-Level et équipes d'exploitation terrain.",
    "tags": [
      "Performance",
      "ROI",
      "Supervision"
    ]
  },
  {
    "id": 7,
    "title": "Plateforme Intelligente SENSORIUM CAFM PRO",
    "subtitle": "Centre de commande tactile et supervision multi-tenants en temps réel",
    "category": "twin",
    "image": "/affiche/plateforme-intelligente-sensorium-cafm-pro.png",
    "description": "Tableau de bord ergonomique unifiant IoT, capteurs de flux et maintenance proactive sur site.",
    "tags": [
      "Cockpit",
      "Multi-Tenants",
      "Live"
    ]
  },
  {
    "id": 8,
    "title": "Supervision Télémétrique & Flux Haute Densité",
    "subtitle": "Ingestion d'événements Kafka en direct et pilotage d'équipements",
    "category": "supervision",
    "image": "/affiche/plateforme-intelligente-sensorium-cafm-pro-1-.png",
    "description": "Surveillance de milliers de points de mesure avec détection automatique d'anomalies par modèles Edge.",
    "tags": [
      "Kafka",
      "IoT Industriel",
      "Télémétrie"
    ]
  },
  {
    "id": 9,
    "title": "Efficience Opérationnelle & Synergie Énergétique",
    "subtitle": "Régulation intelligente des consommations et empreinte carbone minimale",
    "category": "energy",
    "image": "/affiche/sensorium-cafm-pro-performance-operationnelle-1-.png",
    "description": "Algorithmes de pilotage bioclimatique et synchronisation avec les réseaux électriques intelligents.",
    "tags": [
      "Efficience",
      "Smart Grid",
      "Carbone"
    ]
  }
,

  {
    id: 1,
    title: "Centre de Contrôle Opérationnel & Jumeau Numérique",
    subtitle: "Supervision globale et modélisation spatiale 3D unifiée",
    category: "twin",
    image: "/banners/banner-1.png",
    description: "Cartographie interactive des installations critiques, monitoring thermique et alertes proactives.",
    tags: ["Jumeau 3D", "IoT", "Hypervision"]
  },
  {
    id: 2,
    title: "Architecture Zero-Trust & Coffre Éphémère",
    subtitle: "Gouvernance des accès et identités souveraines",
    category: "security",
    image: "/banners/banner-2.png",
    description: "Protection périmétrique mTLS, clés cryptographiques session-level et isolation multi-tenant.",
    tags: ["Zero-Trust", "mTLS", "RBAC"]
  },
  {
    id: 3,
    title: "Tableau de Bord Énergétique & Bilan Carbone",
    subtitle: "Régulation HVAC dynamique et conformité CSRD Scope 1-3",
    category: "energy",
    image: "/banners/banner-3.png",
    description: "Réduction continue de l'empreinte carbone et modélisation prédictive de consommation KWh.",
    tags: ["CSRD", "ESG", "HVAC AI"]
  },
  {
    id: 4,
    title: "Flotte Robotique Autonome & GMAO Connectée",
    subtitle: "Coordination automatique des rondes et des unités de nettoyage",
    category: "robotics",
    image: "/banners/banner-4.png",
    description: "Dispatch automatique des robots industriels selon les flux d'occupation en temps réel.",
    tags: ["Robotics", "GMAO", "SLAM"]
  },
  {
    id: 5,
    title: "Pipeline d'Ingestion Haute Fréquence Kafka & Edge",
    subtitle: "Traitement de plus de 1,4 million d'événements par seconde",
    category: "supervision",
    image: "/banners/banner-5.png",
    description: "Passerelle télémétrique sous latence sub-milliseconde pour capteurs BACnet, Modbus et MQTT.",
    tags: ["Kafka", "Edge", "Temps Réel"]
  },
  {
    id: 6,
    title: "Conformité DORA Art. 24 & Audit Immuable",
    subtitle: "Piste d'audit SHA-256 et résilience opérationnelle numérique",
    category: "compliance",
    image: "/banners/banner-6.png",
    description: "Horodatage inaltérable certifié pour audits réglementaires bancaires et infrastructures critiques.",
    tags: ["DORA", "SHA-256", "Audit"]
  },
  {
    id: 7,
    title: "Matrice d'Habilitations Granulaires & SSO",
    subtitle: "Fédération d'identité SAML 2.0 / OIDC sécurisée",
    category: "security",
    image: "/banners/banner-7.png",
    description: "Gestion unifiée des prestataires, badges virtuels et accès conditionnels contextuels.",
    tags: ["SSO", "IAM", "Sécurité"]
  },
  {
    id: 8,
    title: "Supervision Infrastructure Réseau & Edge Compute",
    subtitle: "Topologie des passerelles et basculement automatique haute disponibilité",
    category: "supervision",
    image: "/banners/banner-8.png",
    description: "Monitoring en direct du maillage réseau, bande passante et état des liens télécoms.",
    tags: ["Mesh", "Réseau", "Disponibilité"]
  },
  {
    id: 9,
    title: "Maintenance Prédictive & Diagnostic IA",
    subtitle: "Détection des anomalies vibratoires et acoustiques des équipements",
    category: "supervision",
    image: "/banners/banner-9.png",
    description: "Algorithmes de détection de dérives mécaniques avant l'apparition de toute panne critique.",
    tags: ["IA Prédictive", "GMAO", "Capteurs"]
  },
  {
    id: 10,
    title: "Plateforme Multi-Sites & Campus Connecté",
    subtitle: "Vue synthétique de patrimoines immobiliers d'envergure",
    category: "supervision",
    image: "/banners/banner-10.png",
    description: "Agrégation multi-filiales, KPI consolidés et benchmark opérationnel en direct.",
    tags: ["Multi-Sites", "Campus", "BIM"]
  },
  {
    id: 11,
    title: "Contrôle Qualité de l'Air & Confort Bioclimatique",
    subtitle: "Sondes CO2, COV, PM2.5 et hygrométrie en salle",
    category: "energy",
    image: "/banners/banner-11.png",
    description: "Optimisation de l'air ambiant et de la productivité des occupants selon les normes WELL.",
    tags: ["Qualité Air", "WELL", "Santé"]
  },
  {
    id: 12,
    title: "Gestion des Déplacements & Détection Impossible Travel",
    subtitle: "IA comportementale pour prévenir l'usurpation d'identifiants",
    category: "security",
    image: "/banners/banner-12.png",
    description: "Blocage immédiat des sessions géographiquement incompatibles sur les interfaces d'administration.",
    tags: ["Cyberdéfense", "Géolocalisation", "Zero-Trust"]
  },
  {
    id: 13,
    title: "Observabilité Industrielle Grafana & Prometheus",
    subtitle: "Métriques avancées de charge serveur et d'ingestion données",
    category: "supervision",
    image: "/banners/banner-13.png",
    description: "Dashboards d'ingénierie temps réel avec alertes Slack, PagerDuty et Webhooks.",
    tags: ["Grafana", "Prometheus", "Métriques"]
  },
  {
    id: 14,
    title: "Plan de Continuité d'Activité TIC & PCA/PRA",
    subtitle: "Simulations de crise et tests de résilience automatisés",
    category: "compliance",
    image: "/banners/banner-14.png",
    description: "Exercices de failover programmés avec génération de comptes-rendus certifiés conformes DORA.",
    tags: ["PCA/PRA", "Résilience", "DORA"]
  },
  {
    id: 15,
    title: "Cockpit Tactile Opérateur & Pilotage Direct",
    subtitle: "Console d'hypervision ergonomique pour PC, tablettes et murs d'écrans",
    category: "twin",
    image: "/banners/banner-15.png",
    description: "Interface fluide à 60 FPS intégrant des commandes interactives de délestage et de verrouillage.",
    tags: ["Cockpit", "Ergonomie", "Pilotage"]
  },
  {
    id: 16,
    title: "Rapports RSE & Efficacité Énergétique ISO 50001",
    subtitle: "Génération de bilans périodiques automatisés",
    category: "energy",
    image: "/banners/banner-16.png",
    description: "Suivi rigoureux des engagements environnementaux et des trajectoires de décarbonation.",
    tags: ["ISO 50001", "RSE", "Énergie"]
  },
  {
    id: 17,
    title: "Cartographie Spatiale des Espaces & Occupation Réelle",
    subtitle: "Flex-office, capteurs de présence infra-rouge et taux d'usage",
    category: "twin",
    image: "/banners/banner-17.png",
    description: "Dimensionnement optimal des surfaces de travail et rationalisation des baux commerciaux.",
    tags: ["Flex-Office", "Capteurs", "Espace"]
  },
  {
    id: 18,
    title: "Chiffrement Matériel & Sécurité des Données au Repos",
    subtitle: "Algorithmes AES-256 GCM et gestion des modules HSM",
    category: "security",
    image: "/banners/banner-18.png",
    description: "Sanctuarisation totale des bases de données et des flux vidéo de vidéosurveillance.",
    tags: ["AES-256", "HSM", "Souveraineté"]
  },
  {
    id: 19,
    title: "Gestion des Prestataires & Badges Dématérialisés",
    subtitle: "Workflow de validation des interventions tierces",
    category: "compliance",
    image: "/banners/banner-19.png",
    description: "Délivrance de QR codes d'accès sécurisés à durée de vie limitée avec géofencing.",
    tags: ["Prestataires", "Accès QR", "Sécurité"]
  },
  {
    id: 20,
    title: "Modélisation Thermique & Régulation des Fluides",
    subtitle: "Gestion automatisée des centrales de traitement d'air et groupes froids",
    category: "energy",
    image: "/banners/banner-20.png",
    description: "Modèles physiques thermodynamiques couplés aux prévisions météorologiques locales.",
    tags: ["CTA", "Thermique", "Climatisation"]
  },
  {
    id: 21,
    title: "Gestion des Défaillances & Escalade d'Alertes",
    subtitle: "Routage intelligent des alarmes selon la criticité des équipements",
    category: "supervision",
    image: "/banners/banner-21.png",
    description: "Notification multicanale (SMS, Push, Appel voix) avec accusé de réception obligatoire.",
    tags: ["Alarmes", "Astreinte", "Workflow"]
  },
  {
    id: 22,
    title: "Archivage Légal et Preuves Numériques",
    subtitle: "Conservation à valeur probante des enregistrements d'incidents",
    category: "compliance",
    image: "/banners/banner-22.png",
    description: "Coffre-fort numérique conforme aux exigences légales de conservation longue durée.",
    tags: ["Archivage", "Preuves", "Légal"]
  },
  {
    id: 23,
    title: "BIM Exploitation & Intégration IFC / Revit",
    subtitle: "Continuité de la maquette numérique de la conception à l'exploitation",
    category: "twin",
    image: "/banners/banner-23.png",
    description: "Synchronisation bidirectionnelle des objets BIM avec les capteurs et fiches d'équipements.",
    tags: ["BIM", "IFC", "Revit"]
  },
  {
    id: 24,
    title: "Sécurité Incendie & Évacuation Connectée",
    subtitle: "Couplage avec les centrales SSI et guidage dynamique d'urgence",
    category: "security",
    image: "/banners/banner-24.png",
    description: "Affichage des cheminements sécurisés et comptage des personnes présentes aux points de rassemblement.",
    tags: ["SSI", "Sécurité Incendie", "Urgence"]
  },
  {
    id: 25,
    title: "Optimisation de l'Éclairage & Luxmétrie Intelligente",
    subtitle: "Gradation automatique DALI selon l'apport de lumière naturelle",
    category: "energy",
    image: "/banners/banner-25.png",
    description: "Réduction jusqu'à 42% des consommations électriques liées aux luminaires tertiaires.",
    tags: ["DALI", "Éclairage", "Smart Grid"]
  },
  {
    id: 26,
    title: "Interopérabilité Universelle & Connecteurs API REST / Webhooks",
    subtitle: "Intégration transparente avec SAP, Salesforce, ServiceNow et ERPs",
    category: "supervision",
    image: "/banners/banner-26.png",
    description: "Catalogue de plus de 120 connecteurs natifs documentés sous OpenAPI v3.",
    tags: ["API", "ERP", "Connecteurs"]
  },
  {
    id: 27,
    title: "Audit de Résilience Cybernétique & Pentest Automatisé",
    subtitle: "Contrôles périodiques des vulnérabilités de l'environnement IoT",
    category: "security",
    image: "/banners/banner-27.png",
    description: "Cartographie des failles potentielles sur les réseaux OT et protocoles industriels.",
    tags: ["Cybersécurité", "OT", "Pentest"]
  },
  {
    id: 28,
    title: "Vision Stratégique 2030 & Écosystème SENSORIUM Sovereign",
    subtitle: "La plateforme européenne de référence pour le bâtiment autonome et durable",
    category: "supervision",
    image: "/banners/banner-28.png",
    description: "Indépendance technologique, hébergement souverain certifié SecNumCloud et conformité RGPD intégrale.",
    tags: ["SecNumCloud", "Souveraineté", "Vision 2030"]
  }

];
