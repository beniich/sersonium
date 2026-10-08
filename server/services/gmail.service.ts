/**
 * SENSORIUM - Gmail API & Google OAuth Client Service
 * Service d'authentification et de messagerie via l'API Gmail
 */
import { googleAuthConfig } from '../config/google-auth.config.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  bodyHtml: string;
  from?: string;
}

export class GmailService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = googleAuthConfig.clientId;
    this.clientSecret = googleAuthConfig.clientSecret;
    this.redirectUri = process.env.NODE_ENV === 'production' 
      ? googleAuthConfig.redirectUris.production 
      : googleAuthConfig.redirectUris.development;
  }

  /**
   * Génère l'URL d'autorisation Google OAuth 2.0 pour authentifier l'utilisateur
   * ou demander les permissions de l'API Gmail
   */
  public getAuthorizationUrl(includeGmailScope: boolean = false, state?: string): string {
    const scopes = [
      ...googleAuthConfig.scopes.auth,
      ...(includeGmailScope ? googleAuthConfig.scopes.gmail : [])
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline', // Permet d'obtenir un refresh_token
      prompt: 'consent',
      ...(state ? { state } : {})
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Échange le code d'autorisation Google contre un Access Token et un Refresh Token
   */
  public async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    id_token: string;
    token_type: string;
  }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Google OAuth token exchange failed: ${errBody}`);
    }

    return await response.json() as any;
  }

  /**
   * Récupère le profil Google d'un utilisateur à partir de son Access Token
   */
  public async getUserProfile(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    picture: string;
    verified_email: boolean;
  }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user profile from Google');
    }

    return await response.json() as any;
  }

  /**
   * Envoi d'un email souverain via l'API Gmail REST (v1)
   * Format MIME base64url standard requis par Google
   */
  public async sendEmailViaGmailApi(accessToken: string, options: SendEmailOptions): Promise<{ id: string; threadId: string }> {
    const fromAddress = options.from || process.env.EMAIL_FROM || 'SENSORIUM <contact@cloudindustrie.com>';
    
    // Construction du message MIME RFC 2822
    const str = [
      `From: ${fromAddress}`,
      `To: ${options.to}`,
      `Subject: =?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.bodyHtml
    ].join('\r\n');

    // Encodage Base64URL sécurisé (sans +, / ni =)
    const encodedMail = Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedMail
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail API send failed: ${err}`);
    }

    return await response.json() as any;
  }
}

export const gmailService = new GmailService();
