/**
 * SENSORIUM — Utilitaires Cryptographiques Souverains (RFC 6234 / FIPS 180-4)
 * Conforme DORA / ANSSI : Exige la Web Crypto API en contexte sécurisé (HTTPS ou localhost).
 * En contexte HTTP non-sécurisé, l'opération est explicitement rejetée pour garantir
 * qu'aucune empreinte non conforme ne puisse être falsifiée ou validée.
 */

export async function computeSha256(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const buffer = typeof data === "string" ? new TextEncoder().encode(data) : data;

  if (typeof crypto !== "undefined" && crypto.subtle?.digest) {
    const digestBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digestBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Rejet explicite pour conformité DORA / ANSSI : interdiction d'émettre un faux hash en HTTP
  throw new Error(
    "Environnement non sécurisé : Web Crypto API (crypto.subtle) indisponible. " +
    "HTTPS ou localhost est strictement obligatoire pour générer ou vérifier une empreinte cryptographique certifiée SHA-256 (DORA / RFC 6234)."
  );
}

