import { RoleDefinition, RoleId } from "./types";
import Imp from "./definition/imp";
import Villager from "./definition/villager";
// Trouble Brewing
import Washerwoman from "./definition/trouble-brewing/washerwoman";
import Librarian from "./definition/trouble-brewing/librarian";
import Investigator from "./definition/trouble-brewing/investigator";
import Chef from "./definition/trouble-brewing/chef";
import Empath from "./definition/trouble-brewing/empath";
import Monk from "./definition/trouble-brewing/monk";
import Soldier from "./definition/trouble-brewing/soldier";

export const ROLES: Record<RoleId, RoleDefinition> = {
    imp: Imp,
    villager: Villager,
    washerwoman: Washerwoman,
    librarian: Librarian,
    investigator: Investigator,
    chef: Chef,
    empath: Empath,
    monk: Monk,
    soldier: Soldier,
};

// Scripts define which roles are in each edition
export type ScriptId = "trouble-brewing";

export const SCRIPTS: Record<ScriptId, { name: string; roles: RoleId[] }> = {
    "trouble-brewing": {
        name: "Trouble Brewing",
        roles: ["washerwoman", "librarian", "investigator", "chef", "empath", "monk", "soldier", "villager", "imp"],
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

export * from "./types";
