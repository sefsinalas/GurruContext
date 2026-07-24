export interface Guess {
  word: string;
  rank: number;
  similarity: number; // 0 to 1
  timestamp: number;
}

export interface GameData {
  gameId: number;
  date: string; // YYYY-MM-DD
  secretHash: string; // SHA-256 of lowercase secret word
  secretLength: number;
  category: string; // e.g. "Naturaleza", "Objetos", "Conceptos"
  ranks: Record<string, number>; // word -> rank (1 to N)
  totalWords: number;
  topWordsPreview?: { word: string; rank: number }[]; // optional obfuscated
}

export interface GameState {
  gameId: number;
  date: string;
  guesses: Guess[];
  isSolved: boolean;
  bestRank: number | null;
  startTime: number;
  endTime?: number;
  hintsUsed: number;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  totalGuesses: number;
  guessDistribution: {
    green: number;  // 1-300
    yellow: number; // 301-1500
    red: number;    // 1501+
  };
  lastPlayedDate?: string;
}

export type SortMode = 'rank' | 'order';
