import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hache un mot de passe en clair à l'aide de scrypt avec un sel aléatoire de 16 octets.
 * Format retourné : "<saltHex>:<hashHex>"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Vérifie un mot de passe en clair par rapport à son hash scrypt stocké.
 * Utilise crypto.timingSafeEqual pour neutraliser les attaques temporelles (timing attacks).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;

    const originalBuffer = Buffer.from(originalHash, "hex");
    const derivedKey = (await scryptAsync(password, salt, originalBuffer.length)) as Buffer;

    return crypto.timingSafeEqual(originalBuffer, derivedKey);
  } catch (err) {
    console.error("[PasswordService] Erreur lors de la vérification:", err);
    return false;
  }
}

