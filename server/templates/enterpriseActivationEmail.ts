/**
 * Sensorium Enterprise - Email Templates
 * Design: High-Tech Sovereign B2B (Dark Slate #0f172a, Emerald #10b981, Monospace Key Block)
 */

export interface EnterpriseActivationEmailData {
  clientName: string;
  activationKey: string;
  terminalModel?: string;
  supportEmail?: string;
  locale: 'fr' | 'en';
}

export function generateEnterpriseActivationEmail(data: EnterpriseActivationEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const isFr = data.locale === 'fr';
  const supportEmail = data.supportEmail || 'support.enterprise@sensorium.io';
  const terminalModel = data.terminalModel || 'Silicium X1 NPU';

  const subject = isFr
    ? '🗝️ Activation de votre Licence Intelligence Artificielle Souveraine — Sensorium Enterprise'
    : '🗝️ Activation of your Sovereign AI License — Sensorium Enterprise';

  const text = isFr
    ? `SENSORIUM ENTERPRISE — L'Activation Souveraine

Cher ${data.clientName},

Nous avons le plaisir de vous confirmer l'activation de votre extension Souveraineté IA pour votre infrastructure Sensorium.

Votre abonnement Enterprise vous donne désormais accès au déploiement d'un Modèle de Langage Large (LLM) directement sur votre terminal physique. Cette technologie vous permet de traiter vos données les plus sensibles en mode 100% Offline, garantissant une confidentialité absolue et une latence minimale.

VOTRE CLÉ D'ACTIVATION :
${data.activationKey}

GUIDE D'ACTIVATION RAPIDE :
1. Connexion Matérielle : Reliez votre terminal physique Sensorium à votre ordinateur via le câble USB-C fourni.
2. Accès Application : Lancez le Sensorium Launcher ou connectez-vous à votre interface de pilotage.
3. Déploiement : Rendez-vous dans l'onglet "Souveraineté IA", saisissez votre clé et cliquez sur "Installer le Modèle".

L'installation du moteur d'IA et du modèle quantifié prendra quelques minutes. Une fois terminée, la LED de votre terminal passera au Vert Pulsant, indiquant que l'IA est opérationnelle en mode local.

SÉCURITÉ & CONFIDENTIALITÉ :
Conformément à notre charte de souveraineté, aucune donnée traitée par le LLM local ne quitte votre terminal (${terminalModel}).
Support dédié : ${supportEmail}

L'Équipe Sensorium
L'intelligence décentralisée, la souveraineté absolue.`
    : `SENSORIUM ENTERPRISE — The Sovereign Activation

Dear ${data.clientName},

We are pleased to confirm the activation of your AI Sovereignty extension for your Sensorium infrastructure.

Your Enterprise subscription now grants you access to the deployment of a Large Language Model (LLM) directly onto your physical terminal. This technology allows you to process your most sensitive data in 100% Offline mode, ensuring absolute confidentiality and minimum latency.

YOUR ACTIVATION KEY:
${data.activationKey}

QUICK ACTIVATION GUIDE:
1. Hardware Connection: Connect your Sensorium physical terminal to your computer using the provided USB-C cable.
2. App Access: Launch the Sensorium Launcher or log into your control interface.
3. Deployment: Go to the "AI Sovereignty" tab, enter your key, and click "Install Model".

The installation of the AI engine and the quantized model will take a few minutes. Once completed, your terminal LED will turn Pulsing Green, indicating that the AI is operational in local mode.

SECURITY & PRIVACY:
In accordance with our sovereignty charter, no data processed by the local LLM ever leaves your terminal (${terminalModel}).
Dedicated Support: ${supportEmail}

The Sensorium Team
Decentralized Intelligence, Absolute Sovereignty.`;

  const html = `<!DOCTYPE html>
<html lang="${isFr ? 'fr' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0f19;
      padding: 40px 0;
    }
    .main-container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
    }
    .header-bar {
      height: 4px;
      background: linear-gradient(90deg, #10b981 0%, #059669 50%, #064e3b 100%);
    }
    .header-content {
      padding: 36px 40px 24px 40px;
      border-bottom: 1px solid #1e293b;
      background: radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
    }
    .brand-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #10b981;
      background-color: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 14px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 6px 0;
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
    .body-content {
      padding: 36px 40px;
      line-height: 1.65;
    }
    .salutation {
      font-size: 16px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 18px;
    }
    p {
      margin: 0 0 16px 0;
      color: #cbd5e1;
      font-size: 14px;
    }
    .highlight-strong {
      color: #f8fafc;
      font-weight: 600;
    }
    .key-card {
      margin: 28px 0;
      background: #090d16;
      border: 1px solid #334155;
      border-left: 4px solid #10b981;
      border-radius: 8px;
      padding: 20px 24px;
      text-align: center;
    }
    .key-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .key-value {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #34d399;
      background: #020617;
      border: 1px dashed #1e293b;
      padding: 12px 16px;
      border-radius: 6px;
      display: inline-block;
      user-select: all;
    }
    .key-hint {
      margin-top: 10px;
      font-size: 12px;
      color: #64748b;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #e2e8f0;
      margin: 28px 0 16px 0;
      display: flex;
      align-items: center;
    }
    .step-box {
      margin-bottom: 14px;
      background: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 14px 18px;
    }
    .step-number {
      font-weight: 700;
      color: #10b981;
      font-size: 13px;
      margin-right: 6px;
    }
    .step-title {
      font-weight: 600;
      color: #f1f5f9;
      font-size: 13px;
    }
    .step-desc {
      font-size: 13px;
      color: #94a3b8;
      margin: 4px 0 0 0;
    }
    .led-notice {
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 14px 18px;
      margin-top: 20px;
      font-size: 12.5px;
      color: #a7f3d0;
    }
    .led-dot {
      display: inline-block;
      width: 9px;
      height: 9px;
      background-color: #10b981;
      border-radius: 50%;
      margin-right: 8px;
      box-shadow: 0 0 8px #10b981;
    }
    .guarantee-box {
      border-top: 1px solid #1e293b;
      padding-top: 24px;
      margin-top: 32px;
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer {
      background-color: #0b0f19;
      border-top: 1px solid #1e293b;
      padding: 28px 40px;
      text-align: center;
    }
    .footer-signature {
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 4px;
    }
    .footer-tagline {
      font-size: 12px;
      font-style: italic;
      color: #64748b;
      margin-bottom: 16px;
    }
    .footer-support {
      font-size: 12px;
      color: #475569;
    }
    .footer-support a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-container">
      <div class="header-bar"></div>
      
      <!-- HEADER -->
      <div class="header-content">
        <span class="brand-badge">Enterprise Sovereign Tier</span>
        <h1 class="brand-title">SENSORIUM</h1>
        <p class="brand-subtitle">${isFr ? 'Haute Sécurité & Intelligence Décentralisée' : 'High Security & Decentralized Intelligence'}</p>
      </div>

      <!-- BODY -->
      <div class="body-content">
        <div class="salutation">
          ${isFr ? `Cher ${data.clientName},` : `Dear ${data.clientName},`}
        </div>

        <p>
          ${isFr
            ? `Nous avons le plaisir de vous confirmer l'activation de votre extension <span class="highlight-strong">Souveraineté IA</span> pour votre infrastructure Sensorium.`
            : `We are pleased to confirm the activation of your <span class="highlight-strong">AI Sovereignty</span> extension for your Sensorium infrastructure.`}
        </p>

        <p>
          ${isFr
            ? `Votre abonnement <span class="highlight-strong">Enterprise</span> vous donne désormais accès au déploiement d'un Modèle de Langage Large (LLM) directement sur votre terminal physique. Cette technologie vous permet de traiter vos données les plus sensibles en mode <span class="highlight-strong">100% Offline</span>, garantissant une confidentialité absolue et une latence minimale.`
            : `Your <span class="highlight-strong">Enterprise</span> subscription now grants you access to the deployment of a Large Language Model (LLM) directly onto your physical terminal. This technology allows you to process your most sensitive data in <span class="highlight-strong">100% Offline mode</span>, ensuring absolute confidentiality and minimum latency.`}
        </p>

        <!-- ACTIVATION KEY CARD -->
        <div class="key-card">
          <div class="key-label">${isFr ? "Votre Clé d'Activation Souveraine" : 'Your Sovereign Activation Key'}</div>
          <div class="key-value">${data.activationKey}</div>
          <div class="key-hint">
            ${isFr ? 'Copiez et collez cette clé dans votre application ou terminal' : 'Copy and paste this key into your application or terminal'}
          </div>
        </div>

        <!-- QUICK START GUIDE -->
        <div class="section-title">
          ${isFr ? "🛠️ Guide d'Activation Rapide" : '🛠️ Quick Activation Guide'}
        </div>

        <div class="step-box">
          <span class="step-number">01</span>
          <span class="step-title">${isFr ? 'Connexion Matérielle' : 'Hardware Connection'}</span>
          <div class="step-desc">
            ${isFr
              ? 'Reliez votre terminal physique Sensorium à votre station via le câble USB-C fourni.'
              : 'Connect your Sensorium physical terminal to your workstation using the provided USB-C cable.'}
          </div>
        </div>

        <div class="step-box">
          <span class="step-number">02</span>
          <span class="step-title">${isFr ? 'Accès Application' : 'Application Access'}</span>
          <div class="step-desc">
            ${isFr
              ? 'Lancez le <em>Sensorium Launcher</em> ou connectez-vous à votre interface de pilotage.'
              : 'Launch the <em>Sensorium Launcher</em> or log into your control dashboard.'}
          </div>
        </div>

        <div class="step-box">
          <span class="step-number">03</span>
          <span class="step-title">${isFr ? 'Déploiement' : 'Deployment'}</span>
          <div class="step-desc">
            ${isFr
              ? `Rendez-vous dans l'onglet <strong>"Souveraineté IA"</strong>, saisissez votre clé et cliquez sur <strong>"Installer le Modèle"</strong>.`
              : `Navigate to the <strong>"AI Sovereignty"</strong> tab, enter your key, and click <strong>"Install Model"</strong>.`}
          </div>
        </div>

        <!-- LED STATUS NOTICE -->
        <div class="led-notice">
          <span class="led-dot"></span>
          <strong>${isFr ? 'Indicateur Matériel :' : 'Hardware Indicator:'}</strong>
          ${isFr
            ? `L'installation prendra quelques minutes. Une fois finalisée, la LED passera au <strong>Vert Pulsant</strong> (Inférer Local), confirmant l'autonomie totale.`
            : `The installation takes a few minutes. Once completed, the terminal LED turns <strong>Pulsing Green</strong> (Local Inference), confirming absolute autonomy.`}
        </div>

        <!-- SOVEREIGNTY GUARANTEE -->
        <div class="guarantee-box">
          <strong>${isFr ? 'Sécurité & Confidentialité :' : 'Security & Privacy:'}</strong><br>
          ${isFr
            ? `Conformément à notre charte de souveraineté, aucune donnée traitée par le LLM local ne quitte votre terminal physique (${terminalModel}). Le processus d'installation et de quantisation est crypté de bout en bout.`
            : `In accordance with our sovereignty charter, no data processed by the local LLM ever leaves your physical terminal (${terminalModel}). The installation and quantization pipeline is end-to-end encrypted.`}
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-signature">${isFr ? "L'Équipe Sensorium" : 'The Sensorium Team'}</div>
        <div class="footer-tagline">
          ${isFr ? "L'intelligence décentralisée, la souveraineté absolue." : 'Decentralized Intelligence, Absolute Sovereignty.'}
        </div>
        <div class="footer-support">
          ${isFr ? 'Assistance dédiée Ingénierie :' : 'Dedicated Engineering Support:'} 
          <a href="mailto:${supportEmail}">${supportEmail}</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}
