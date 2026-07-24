import type { GameData } from '../types/game';
import { normalizeWord, sha256 } from './crypto';
import { DICTIONARY, cosineSimilarity, getWordVector } from './dictionary';

// List of high-quality secret words candidates (easy, intuitive Spanish nouns/adjectives)
export const CANDIDATE_SECRET_WORDS = [
  'casa', 'perro', 'gato', 'sol', 'luna', 'mar', 'playa', 'musica',
  'guitarra', 'libro', 'computadora', 'telefono', 'corazon', 'camino',
  'jardin', 'arbol', 'flor', 'lluvia', 'nieve', 'fuego', 'viento',
  'reloj', 'amigo', 'familia', 'amor', 'viaje', 'avion', 'auto',
  'chocolate', 'cafe', 'pan', 'fruta', 'manzana', 'queso', 'estrella',
  'universo', 'planeta', 'ciudad', 'rio', 'montana', 'bosque', 'selva',
  'puerta', 'ventana', 'cama', 'silla', 'mesa', 'pintura', 'pelicula',
  'cancion', 'teatro', 'anillo', 'ropa', 'vestido', 'zapato', 'mariposa',
  'caballo', 'leon', 'pajaro', 'pez', 'delfin', 'cerebro', 'sonrisa'
];

/**
 * Deterministically picks a candidate secret word based on date string (YYYY-MM-DD) or game ID.
 */
export function getSecretWordForDate(dateStr: string): { word: string; gameId: number } {
  let hashNum = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hashNum = (hashNum * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const gameId = (hashNum % 9900) + 100; // e.g. Game #142
  const candidateIndex = hashNum % CANDIDATE_SECRET_WORDS.length;
  return {
    word: CANDIDATE_SECRET_WORDS[candidateIndex],
    gameId
  };
}

/**
 * Precomputes game data for a given secret word.
 * Returns GameData with hashed secret word (secret is hidden!).
 */
export async function precomputeGame(secretWordRaw: string, dateStr: string, gameId: number): Promise<GameData> {
  const secretWord = normalizeWord(secretWordRaw);
  const secretHash = await sha256(secretWord);
  const secretEntry = DICTIONARY.get(secretWord);
  const secretVec = secretEntry ? secretEntry.vec : getWordVector(secretWord);
  const secretCategory = secretEntry ? secretEntry.category : 'General';

  // Compute similarity with all dictionary entries
  const similarities: { word: string; sim: number }[] = [];

  DICTIONARY.forEach((entry, word) => {
    if (word === secretWord) return;
    const sim = cosineSimilarity(secretVec, entry.vec);
    similarities.push({ word, sim });
  });

  // Sort descending by similarity
  similarities.sort((a, b) => b.sim - a.sim);

  // Assign ranks
  const ranks: Record<string, number> = {};
  ranks[secretWord] = 1;

  similarities.forEach((item, idx) => {
    ranks[item.word] = idx + 2; // Ranks start at #2 for non-secret words
  });

  const totalWords = Object.keys(ranks).length + 4000;

  return {
    gameId,
    date: dateStr,
    secretHash,
    secretLength: secretWord.length,
    category: secretCategory,
    ranks,
    totalWords
  };
}

/**
 * Dynamic rank evaluator for any guessed word during gameplay.
 * If word is in precomputed ranks, returns exact rank.
 * Otherwise, calculates similarity dynamically and computes rank position.
 */
export function getRankForGuess(
  guessedWordRaw: string,
  gameData: GameData,
  secretWordVecFallback?: number[]
): { rank: number; similarity: number } {
  const guessedWord = normalizeWord(guessedWordRaw);

  // 1. Exact match with precomputed ranks
  if (gameData.ranks[guessedWord] !== undefined) {
    const rank = gameData.ranks[guessedWord];
    // Convert rank to approximate similarity score for UI bar
    const similarity = Math.max(0.01, 1.0 - Math.log10(rank) / 4);
    return { rank, similarity };
  }

  // 2. Fallback for words not in pre-indexed dictionary
  const guessVec = getWordVector(guessedWord);
  
  // Estimate similarity using vector distance if available or string distance
  let sim = 0.3;
  if (secretWordVecFallback) {
    sim = cosineSimilarity(guessVec, secretWordVecFallback);
  } else {
    // Generate deterministic rank between 1200 and 4500
    let strHash = 0;
    for (let i = 0; i < guessedWord.length; i++) {
      strHash = (strHash * 33 + guessedWord.charCodeAt(i)) >>> 0;
    }
    const offset = strHash % 3000;
    const rank = 1500 + offset;
    sim = Math.max(0.05, 1.0 - Math.log10(rank) / 4);
    return { rank, similarity: sim };
  }

  // Convert similarity to rank
  const rank = Math.round(300 + (1 - sim) * 3500);
  return { rank: Math.max(2, rank), similarity: Math.max(0.01, Math.min(0.99, sim)) };
}
