import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Load rows from disk if `data.json` exists, otherwise seed default rows and persist.
 * @returns {Array<{id:string, name:string, category:string, value:number, createdAt:string}>}
 */
function initializeRows() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.items)) return parsed.items;
    } catch (err) {
      console.error('Kunde inte läsa data.json, initierar med standarddata:', err);
    }
  }
  /** @type {Array<{id:string, name:string, category:string, value:number, createdAt:string}>} */
  const seeded = [];
  for (let i = 1; i <= 8; i++) {
    seeded.push({
      id: genId(),
      name: `Item ${i}`,
      category: ['A', 'B', 'C'][i % 3],
      value: Math.floor(Math.random() * 1000),
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    });
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2));
  } catch (err) {
    console.error('Kunde inte skriva initial data till data.json:', err);
  }
  return seeded;
}

function persistRows(rows) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Kunde inte spara data till data.json:', err);
  }
}

/** @type {Array<{id:string, name:string, category:string, value:number, createdAt:string}>} */
let rows = initializeRows();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/data', (req, res) => {
  const { q, sort, dir } = req.query;
  let data = [...rows];
  if (q && typeof q === 'string') {
    const needle = q.toLowerCase();
    data = data.filter(r => r.name.toLowerCase().includes(needle) || r.category.toLowerCase().includes(needle));
  }
  if (sort && typeof sort === 'string') {
    const direction = (dir === 'desc') ? -1 : 1;
    data.sort((a, b) => {
      const av = a[sort]; const bv = b[sort];
      if (av === bv) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return av > bv ? direction : -direction;
    });
  }
  res.json({ items: data });
});

app.post('/api/data', (req, res) => {
  const { name, category, value } = req.body || {};
  if (!name || !category || typeof value !== 'number') {
    return res.status(400).json({ error: 'name, category, value required' });
  }
  const row = { id: genId(), name: String(name), category: String(category), value: Number(value), createdAt: new Date().toISOString() };
  rows.push(row);
  persistRows(rows);
  res.status(201).json(row);
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

app.listen(PORT, () => { console.log(`Server listening on http://localhost:${PORT}`); });
