import { readFileSync } from "fs";

const staticData = JSON.parse(readFileSync("./static-data.json", "utf8"));

export function getPlayerInfo(id) {
  return staticData.elements.find((element) => element.id === id);
}

export function getTeamInfo(id) {
  return staticData.teams.find((team) => team.id === id);
}

export function playerJsonToMetaData(playerJsonFileName) {
  const playerId = parseInt(playerJsonFileName.match(/(\d+)/)[0]);
  const playerJson = JSON.parse(readFileSync(playerJsonFileName, "utf8"));
  const firstFixture = playerJson.fixtures[0];
  const isHome = firstFixture.is_home;
  const homeTeam = firstFixture.team_h;
  const awayTeam = firstFixture.team_a;

  const player = getPlayerInfo(playerId);
  const team = getTeamInfo(isHome ? homeTeam : awayTeam);
  return { player, team };
}
