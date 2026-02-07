/**
 * Registration utilities — generic helpers for the registration system.
 *
 * Roles that can register differently (via `registration` config on their
 * RoleDefinition) are handled generically. No role here is referenced by
 * name — everything is driven by the declarative RegistrationConfig.
 */

import { PlayerState } from "../types";
import { TeamId } from "../teams/types";
import { RoleDefinition } from "./types";

// ============================================================================
// ALIGNMENT REGISTRATION
// ============================================================================

/**
 * Check whether a role has alignment registration
 * (i.e., the Narrator can choose if this player registers as evil).
 */
export function hasAlignmentRegistration(role: RoleDefinition): boolean {
    return role.registration?.canRegisterAsEvil ?? false;
}

/**
 * Determine if a player is perceived as evil, considering registration overrides.
 *
 * @param role         The player's RoleDefinition
 * @param player       The player state
 * @param overrides    Narrator-chosen overrides: playerId → registersAsEvil
 */
export function isPerceivedEvil(
    role: RoleDefinition,
    player: PlayerState,
    overrides?: Record<string, boolean>
): boolean {
    // If this role has alignment registration and an override was provided, use it
    if (
        role.registration?.canRegisterAsEvil &&
        overrides?.[player.id] !== undefined
    ) {
        return overrides[player.id];
    }

    // Default: check actual team
    return role.team === "minion" || role.team === "demon";
}

/**
 * Filter a list of players to those whose roles have alignment registration.
 */
export function filterPlayersWithAlignmentRegistration(
    players: PlayerState[],
    getRoleFn: (roleId: string) => RoleDefinition | undefined
): PlayerState[] {
    return players.filter((p) => {
        const role = getRoleFn(p.roleId);
        return role ? hasAlignmentRegistration(role) : false;
    });
}

// ============================================================================
// TEAM REGISTRATION
// ============================================================================

/**
 * Check if a role can register as a specific team type
 * (either naturally or via registration config).
 */
export function canRegisterAsTeam(
    role: RoleDefinition,
    team: TeamId
): boolean {
    // Natural match
    if (role.team === team) return true;
    // Registration override
    return role.registration?.canRegisterAsTeams?.includes(team) ?? false;
}

// ============================================================================
// ROLE REGISTRATION (for role-revealing abilities)
// ============================================================================

/**
 * Check if a role has role registration
 * (i.e., the Narrator can choose a different role to display).
 */
export function hasRoleRegistration(role: RoleDefinition): boolean {
    return role.registration?.canAppearAsDifferentRole ?? false;
}

/**
 * Get the list of roles a player with role registration can appear as.
 * Returns their own role first, then all roles from their `canRegisterAsTeams`.
 */
export function getPossibleDisplayRoles(
    ownRole: RoleDefinition,
    allRoles: RoleDefinition[]
): RoleDefinition[] {
    if (!ownRole.registration?.canAppearAsDifferentRole) {
        return [ownRole];
    }

    const teams = ownRole.registration.canRegisterAsTeams ?? [];
    const extraRoles = allRoles.filter(
        (r) => r.id !== ownRole.id && teams.includes(r.team)
    );

    return [ownRole, ...extraRoles];
}
