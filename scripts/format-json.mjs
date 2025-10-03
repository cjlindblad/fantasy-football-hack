import fs from "fs";
import path from "path";

const workspaceDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function isPlayerJson(filename) {
  return /^player_\d+\.json$/.test(filename);
}

function formatJsonFile(filePath) {
  return new Promise((resolve) => {
    fs.readFile(filePath, "utf8", (readError, data) => {
      if (readError) {
        console.error(`Failed to read ${filePath}`, readError);
        return resolve(false);
      }
      try {
        const parsed = JSON.parse(data);
        const pretty = JSON.stringify(parsed, null, 2) + "\n";
        fs.writeFile(filePath, pretty, (writeError) => {
          if (writeError) {
            console.error(`Failed to write ${filePath}`, writeError);
            return resolve(false);
          }
          resolve(true);
        });
      } catch (parseError) {
        console.error(`Invalid JSON in ${filePath}`, parseError);
        resolve(false);
      }
    });
  });
}

function listPlayerJsonFiles(dirPath) {
  return new Promise((resolve) => {
    fs.readdir(dirPath, { withFileTypes: true }, (error, entries) => {
      if (error) {
        console.error(`Failed to list directory ${dirPath}`, error);
        return resolve([]);
      }
      const files = entries
        .filter((e) => e.isFile() && isPlayerJson(e.name))
        .map((e) => path.join(dirPath, e.name));
      resolve(files);
    });
  });
}

async function main() {
  const root = workspaceDir;
  const files = await listPlayerJsonFiles(root);
  if (files.length === 0) {
    console.log("No player_*.json files found.");
    return;
  }
  let successCount = 0;
  for (const file of files) {
    const ok = await formatJsonFile(file);
    if (ok) successCount += 1;
  }
  console.log(`Formatted ${successCount}/${files.length} player JSON files.`);
}

main();


