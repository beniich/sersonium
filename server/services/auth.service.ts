import admin from 'firebase-admin';
import { signAccessToken, signRefreshToken, getRefreshTokenCookieOptions, REFRESH_TOKEN_COOKIE_NAME } from '../config/jwt.js';
import { rawPrisma as prisma } from '../db/prisma.js';
import { UserPayload, RoleType, SubscriptionTierType } from '../types/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (requires serviceAccountKey.json or equivalent env vars)
try {
  if (!admin.apps.length) {
    const serviceAccountPath = path.resolve(__dirname, '../../config/firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    } else {
      console.warn("Firebase Admin SDK: 'firebase-service-account.json' not found. Using default application credentials if available.");
      admin.initializeApp();
    }
  }
} catch (error) {
  console.error("Firebase Admin initialization failed", error);
}

export class AuthService {
  /**
   * Hybrid Login Process:
   * 1. Verify Firebase Token
   * 2. Find user in Sensorium DB
   * 3. Generate internal JWT session tokens
   */
  async loginWithFirebase(firebaseToken: string) {
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
