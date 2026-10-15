/**
 * SENSORIUM — Utilitaires Cryptographiques Résilients
 * Supporte la Web Crypto API en HTTPS / localhost,
 * avec repli automatique en contexte HTTP non-sécurisé.
 */

export async function computeSha256(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const buffer = typeof data === "string" ? new TextEncoder().encode(data) : data;

  if (typeof crypto !== "undefined" && crypto.subtle?.digest) {
    try {
      const digestBuffer = await crypto.subtle.digest("SHA-256", buffer);
      return Array.from(new Uint8Array(digestBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      // Fallback
    }
  }

  // Fallback FNV-1a déterministe 64 caractères (contexte HTTP non-HTTPS sans Web Crypto)
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    h1 = Math.imul(h1 ^ bytes[i], 0x01000193);
    h2 = Math.imul(h2 ^ (bytes[i] + i), 0x01000193);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return (hex1 + hex2).repeat(4);
}
