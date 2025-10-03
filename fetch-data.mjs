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

    fs.writeFile(`player_${id}.json`, JSON.stringify(json), (error) => {
      if (error) {
        console.log(`Error when saving player ${id}`, error);
      }
    });
  } catch (error) {
    console.log(`Error when fetching player ${id}`, error);
  }
});
