import type { GameState, UserStats } from '../types/game';

const STATS_KEY = 'gurru_user_stats';

const DEFAULT_STATS: UserStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalGuesses: 0,
  guessDistribution: {
    green: 0,
    yellow: 0,
    red: 0
  }
};

export function getGameStateKey(dateStr: string): string {
  return `gurru_game_state_${dateStr}`;
}

export function loadGameState(dateStr: string): GameState | null {
  try {
    const raw = localStorage.getItem(getGameStateKey(dateStr));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading game state:', e);
    return null;
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(getGameStateKey(state.date), JSON.stringify(state));
  } catch (e) {
    console.error('Error saving game state:', e);
  }
}

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading user stats:', e);
    return DEFAULT_STATS;
  }
}

export function recordGameWin(dateStr: string, totalGuesses: number, guessesBreakdown: { green: number; yellow: number; red: number }): UserStats {
  const stats = loadUserStats();

  if (stats.lastPlayedDate === dateStr && stats.gamesWon > 0) {
    // Already recorded win for today
    return stats;
  }

  const isConsecutive = stats.lastPlayedDate
    ? isNextDay(stats.lastPlayedDate, dateStr)
    : true;

  stats.gamesPlayed += 1;
  stats.gamesWon += 1;
  stats.currentStreak = isConsecutive ? stats.currentStreak + 1 : 1;
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.totalGuesses += totalGuesses;
  stats.guessDistribution.green += guessesBreakdown.green;
  stats.guessDistribution.yellow += guessesBreakdown.yellow;
  stats.guessDistribution.red += guessesBreakdown.red;
  stats.lastPlayedDate = dateStr;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving user stats:', e);
  }

  return stats;
}

function isNextDay(prevDate: string, currentDate: string): boolean {
  try {
    const d1 = new Date(prevDate);
    const d2 = new Date(currentDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    return diffDays === 1;
  } catch {
    return false;
  }
}
