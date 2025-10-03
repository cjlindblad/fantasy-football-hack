# Simple Data Webapp

Enkel webbapp för att visa och lägga till rader i en tabell.

## Kom igång

1. Installera beroenden:

```bash
npm install
```

2. Starta utvecklingsservern:

```bash
npm run dev
```

Öppna sedan `http://localhost:3000` i webbläsaren.

## API

- GET `/api/data` – Hämta rader
  - Query-parametrar: `q` (sök), `sort` (t.ex. `name`, `category`, `value`, `createdAt`), `dir` (`asc`|`desc`)
- POST `/api/data` – Lägg till rad
  - Body (JSON): `{ name: string, category: string, value: number }`

## Data

Just nu används en in-memory lista (försvinner vid omstart). Vi kan lägga till beständig lagring (fil/SQLite) vid behov.
