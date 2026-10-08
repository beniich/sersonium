/**
 * SENSORIUM - Configuration Google OAuth 2.0 & Gmail API
 * Domaine de production : https://sersonium.cloudindustrie.com
 */

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUris: {
    production: string;
    development: string;
    firebaseHandler: string;
  };
  authorizedOrigins: string[];
  scopes: {
    auth: string[];
    gmail: string[];
  };
}

export const googleAuthConfig: GoogleAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  
  redirectUris: {
    // URL de rappel serveur en production
    production: "https://sersonium.cloudindustrie.com/api/v1/auth/google/callback",
    // URL de rappel en dev local
    development: "http://localhost:3000/api/v1/auth/google/callback",
    // Handler Firebase Auth (pour signInWithPopup / signInWithRedirect)
    firebaseHandler: "https://sersonium.firebaseapp.com/__/auth/handler"
  },

  authorizedOrigins: [
    "https://sersonium.cloudindustrie.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ],

  scopes: {
    // Scopes minimaux requis pour l'identification de l'utilisateur
    auth: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ],
    // Scopes optionnels pour l'API Gmail (envoi d'alertes & notifications DORA)
    gmail: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly"
    ]
  }
};
