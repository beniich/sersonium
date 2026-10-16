import admin from 'firebase-admin';
import { signAccessToken, signRefreshToken, getRefreshTokenCookieOptions, REFRESH_TOKEN_COOKIE_NAME } from '../config/jwt.js';
import { rawPrisma as prisma } from '../db/prisma.js';
import { UserPayload, RoleType, SubscriptionTierType } from '../types/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (requires serviceAccountKey.json or FIREBASE_* env vars)
let firebaseAdminReady = false;
try {
  const existingApps = admin.apps ?? [];
  if (existingApps.length === 0) {
    const serviceAccountPath = path.resolve(__dirname, '../../config/firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      firebaseAdminReady = true;
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      firebaseAdminReady = true;
    } else {
      console.warn("[Firebase Admin] No credentials found (serviceAccount.json or FIREBASE_* env vars). Firebase login disabled — fallback to email/password only.");
    }
  } else {
    firebaseAdminReady = true;
  }
} catch (error) {
  console.warn("[Firebase Admin] Initialization skipped:", (error as Error).message);
}

export class AuthService {
  /**
   * Hybrid Login Process:
   * 1. Verify Firebase Token
   * 2. Find user in Sensorium DB
   * 3. Generate internal JWT session tokens
   */
  async loginWithFirebase(firebaseToken: string) {
    if (!firebaseAdminReady) {
      throw new Error("Firebase Admin SDK non configuré. Utilisez la connexion email/mot de passe.");
    }
    try {
      // 1. Verify identity via Firebase
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const firebaseUid = decodedToken.uid;
      const email = decodedToken.email;

      if (!firebaseUid || !email) throw new Error('Invalid Firebase Token');

      // 2. Find user in our database
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        include: { organization: true },
      });

      // If user is not found by firebaseUid, try by email and link them
      let targetUser = user;
      if (!targetUser) {
        targetUser = await prisma.user.findUnique({
          where: { email },
          include: { organization: true }
        });
        
        if (targetUser) {
          // Link firebase account to existing user
          targetUser = await prisma.user.update({
            where: { email },
            data: { firebaseUid },
            include: { organization: true }
          });
        } else {
          throw new Error('User not registered in Sensorium. Please contact your admin.');
        }
      }

      const userPayload: UserPayload = {
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role as RoleType,
        tenantId: targetUser.tenantId,
        organizationName: targetUser.organization.name,
        subscriptionTier: (targetUser.organization.plan.toLowerCase() as SubscriptionTierType) || "free"
      };

      // 3. Generate Sensorium JWT
      const accessToken = signAccessToken(userPayload);
      const { token: refreshToken } = signRefreshToken(userPayload);

      return {
        accessToken,
        refreshToken,
        user: userPayload
      };
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Biometric / Passkey unlock (Simulation)
   */
  async verifyBiometricSession(userId: string, signature: string): Promise<boolean> {
    console.log(`Verifying biometric signature for user ${userId}`);
    return true; // Simulation
  }
}

export const authService = new AuthService();
