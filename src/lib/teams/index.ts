import { TeamDefinition, TeamId } from "./types";
import townsfolk from "./definition/townsfolk";
import outsider from "./definition/outsider";
import minion from "./definition/minion";
import demon from "./definition/demon";

export type { TeamDefinition, TeamId } from "./types";

const TEAMS: Record<TeamId, TeamDefinition> = {
    townsfolk,
    outsider,
    minion,
    demon,
};

export function getTeam(teamId: TeamId): TeamDefinition {
    return TEAMS[teamId];
}

export function getAllTeams(): TeamDefinition[] {
    return Object.values(TEAMS);
}

export function isGoodTeam(teamId: TeamId): boolean {
    return teamId === "townsfolk" || teamId === "outsider";
}

export function isEvilTeam(teamId: TeamId): boolean {
    return teamId === "minion" || teamId === "demon";
}
