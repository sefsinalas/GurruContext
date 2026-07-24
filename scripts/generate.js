import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sha256Sync(str) {
  return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
}

// Candidates for secret words
const CANDIDATE_WORDS = [
  'casa', 'perro', 'gato', 'sol', 'luna', 'mar', 'playa', 'musica',
  'guitarra', 'libro', 'computadora', 'telefono', 'corazon', 'camino',
  'jardin', 'arbol', 'flor', 'lluvia', 'nieve', 'fuego', 'viento',
  'reloj', 'amigo', 'familia', 'amor', 'viaje', 'avion', 'auto',
  'chocolate', 'cafe', 'pan', 'fruta', 'manzana', 'queso', 'estrella',
  'universo', 'planeta', 'ciudad', 'rio', 'montana', 'bosque', 'selva',
  'puerta', 'ventana', 'cama', 'silla', 'mesa', 'pintura', 'pelicula',
  'cancion', 'teatro', 'anillo', 'ropa', 'vestido', 'zapato', 'mariposa'
];

console.log('⚡ Pre-calculando juegos diarios para GurruContexto...');

const gamesDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

// Generate dates starting today
const today = new Date();
const gamesMap = {};

for (let i = 0; i < 60; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() + i);
  const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
  const candidate = CANDIDATE_WORDS[i % CANDIDATE_WORDS.length];
  const secretHash = sha256Sync(candidate);
  
  gamesMap[dateStr] = {
    gameId: 100 + i,
    date: dateStr,
    secretHash: secretHash,
    secretLength: candidate.length,
    category: 'Español'
  };
}

fs.writeFileSync(path.join(gamesDir, 'games.json'), JSON.stringify(gamesMap, null, 2));
console.log('✅ Archivo public/data/games.json generado con exito!');
