import { RoleDefinition, RoleId } from "./types";
import Imp from "./definition/Imp";
import Villager from "./definition/Villager";
// Trouble Brewing
import Washerwoman from "./definition/trouble-brewing/Washerwoman";
import Librarian from "./definition/trouble-brewing/Librarian";
import Investigator from "./definition/trouble-brewing/Investigator";
import Chef from "./definition/trouble-brewing/Chef";
import Empath from "./definition/trouble-brewing/Empath";
import Monk from "./definition/trouble-brewing/Monk";
import Soldier from "./definition/trouble-brewing/Soldier";
import FortuneTeller from "./definition/trouble-brewing/FortuneTeller";
import Undertaker from "./definition/trouble-brewing/Undertaker";
import Ravenkeeper from "./definition/trouble-brewing/Ravenkeeper";
import Virgin from "./definition/trouble-brewing/Virgin";
import Slayer from "./definition/trouble-brewing/Slayer";
import Mayor from "./definition/trouble-brewing/Mayor";
import Saint from "./definition/trouble-brewing/Saint";

export const ROLES: Record<RoleId, RoleDefinition> = {
    imp: Imp,
    villager: Villager,
    washerwoman: Washerwoman,
    librarian: Librarian,
    investigator: Investigator,
    chef: Chef,
    empath: Empath,
    fortune_teller: FortuneTeller,
    undertaker: Undertaker,
    monk: Monk,
    ravenkeeper: Ravenkeeper,
    soldier: Soldier,
    virgin: Virgin,
    slayer: Slayer,
    mayor: Mayor,
    saint: Saint,
};

// Scripts define which roles are in each edition
export type ScriptId = "trouble-brewing";

export const SCRIPTS: Record<ScriptId, { name: string; roles: RoleId[] }> = {
    "trouble-brewing": {
        name: "Trouble Brewing",
        roles: [
            "washerwoman",
            "librarian",
            "investigator",
            "chef",
            "empath",
            "fortune_teller",
            "undertaker",
            "monk",
            "ravenkeeper",
            "soldier",
            "virgin",
            "slayer",
            "mayor",
            "saint",
            "villager",
            "imp",
        ],
    },
};

// Get all roles sorted by night order (roles that wake at night)
export function getNightOrderRoles(): RoleDefinition[] {
    return Object.values(ROLES)
        .filter((role) => role.nightOrder !== null)
        .sort((a, b) => (a.nightOrder ?? 0) - (b.nightOrder ?? 0));
}

export function getRole(roleId: string): RoleDefinition | undefined {
    return ROLES[roleId as RoleId];
}

export function getAllRoles(): RoleDefinition[] {
    return Object.values(ROLES);
}

// ============================================================================
// ROLE DISTRIBUTION RECOMMENDATION
// ============================================================================

export type RoleDistribution = {
    townsfolk: number;
    outsider: number;
    minion: number;
    demon: number;
};

/**
 * Returns the official BotC recommended role distribution for a given player count.
 * Based on the standard distribution table:
 * 5: 3/0/1/1, 6: 3/1/1/1, 7: 5/0/1/1, 8: 5/1/1/1, 9: 5/2/1/1,
 * 10: 7/0/2/1, 11: 7/1/2/1, 12: 7/2/2/1, 13: 9/0/3/1, etc.
 */
export function getRecommendedDistribution(
    playerCount: number
): RoleDistribution | null {
    if (playerCount < 5) return null;

    const demon = 1;
    let minion: number;
    let outsider: number;

    if (playerCount <= 6) {
        minion = 1;
        outsider = playerCount - 5;
    } else {
        const k = Math.floor((playerCount - 7) / 3);
        minion = 1 + k;
        outsider = (playerCount - 7) % 3;
    }

    const townsfolk = playerCount - demon - minion - outsider;

    return { townsfolk, outsider, minion, demon };
}

export * from "./types";
