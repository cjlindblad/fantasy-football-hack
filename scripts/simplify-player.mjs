import fs from "fs";
import path from "path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const argId = process.argv[2] ? String(process.argv[2]).trim() : "1";
if (!/^\d+$/.test(argId)) {
  console.error("Usage: node scripts/simplify-player.mjs <playerId>");
  process.exit(1);
}

const source = path.join(root, `player_${argId}.json`);
const target = path.join(root, `player_${argId}_simple.json`);

const keep = new Set([
  "key_passes",
  "goals_scored",
  "assists",
  "clearances_blocks_interceptions",
  "winning_goals",
  "clean_sheets",
  "minutes",
  "fixture",
  "total_points",
]);

function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  }
  return out;
}

function simplifyHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.map((h) => pick(h, keep));
}

try {
  const raw = fs.readFileSync(source, "utf8");
  const json = JSON.parse(raw);
  const history = simplifyHistory(json.history);
  const out = { history };
  fs.writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${target} with ${history.length} entries`);
} catch (err) {
  console.error("Failed to simplify player json", err);
  process.exit(1);
}


