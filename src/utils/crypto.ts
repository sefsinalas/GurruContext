/**
 * Normalizes a Spanish word: removes extra spaces, converts to lowercase,
 * and optionally removes diacritics for flexible matching.
 */
export function normalizeWord(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents for uniform matching
    .replace(/[^a-zñ]/g, ""); // keep valid Spanish letters
}

/**
 * Computes SHA-256 hash of a string using Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  const normalized = normalizeWord(message);
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Synchronous hash function for fallback / fast deterministic seeds.
 */
export function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}
