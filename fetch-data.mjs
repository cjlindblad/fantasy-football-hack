import fs from "fs";

const API_BASE_URL = "https://fantasy.allsvenskan.se/api/element-summary";
const ids = Array.from({ length: 1000 }).map((_, i) => i + 1);

ids.forEach(async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();

    // Pretty-print JSON (2 spaces) so files are readable in VCS and editors
    fs.writeFile(`player_${id}.json`, JSON.stringify(json, null, 2), (error) => {
      if (error) {
        console.log(`Error when saving player ${id}`, error);
      }
    });
  } catch (error) {
    console.log(`Error when fetching player ${id}`, error);
  }
});
