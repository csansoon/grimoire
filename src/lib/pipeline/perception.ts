import { GameState, PlayerState } from "../types";
import { getRole } from "../roles/index";
import { getEffect } from "../effects";
import { isEvilTeam, TeamId } from "../teams";
import { Perception, PerceptionContext } from "./types";

/**
 * Determine how a target player is perceived by an observer player.
 *
 * Starts with the target's actual role/team/alignment, then applies
 * any perception modifiers from the target's active effects.
 *
 * This is the core abstraction that decouples information-gathering roles
 * from roles that alter their own perception (Recluse, Spy, etc.).
 *
 * @param targetPlayer  - The player being observed
 * @param observerPlayer - The player whose information ability is querying
 * @param context - What aspect is being queried: "alignment", "team", or "role"
 * @param state - Current game state
 * @returns The (possibly modified) perception of the target player
 */
export function perceive(
    targetPlayer: PlayerState,
    observerPlayer: PlayerState,
    context: PerceptionContext,
    state: GameState,
): Perception {
    const role = getRole(targetPlayer.roleId);
    const team = role?.team ?? "townsfolk";

    let perception: Perception = {
        roleId: targetPlayer.roleId,
        team,
        alignment: isEvilTeam(team) ? "evil" : "good",
    };

    // Collect and apply perception modifiers from the target's effects
    for (const effectInstance of targetPlayer.effects) {
        const effectDef = getEffect(effectInstance.type);
        if (!effectDef?.perceptionModifiers) continue;

        for (const modifier of effectDef.perceptionModifiers) {
            // Check if this modifier applies to the current context
            const contexts = Array.isArray(modifier.context)
                ? modifier.context
                : [modifier.context];
            if (!contexts.includes(context)) continue;

            // Check if this modifier is restricted to specific observer roles
            if (modifier.observerRoles) {
                if (!modifier.observerRoles.includes(observerPlayer.roleId))
                    continue;
            }

            // Apply the modification
            perception = modifier.modify(
                perception,
                targetPlayer,
                observerPlayer,
                state,
                effectInstance.data,
            );
        }
    }

    return perception;
}

/**
 * Check whether a player could potentially register as a given team.
 *
 * Returns true if the player has any active effect whose `canRegisterAs.teams`
 * includes the target team. This is used by narrator-setup UIs (e.g., Investigator)
 * to allow players with misregistration effects (e.g., Recluse) as valid picks
 * without requiring the narrator to pre-configure the effect's perceiveAs data.
 *
 * This does NOT check the player's actual team or current perception — use
 * `perceive()` for that. This only checks static declarations on effects.
 */
export function canRegisterAsTeam(player: PlayerState, team: TeamId): boolean {
    for (const effectInstance of player.effects) {
        const effectDef = getEffect(effectInstance.type);
        if (effectDef?.canRegisterAs?.teams?.includes(team)) return true;
    }
    return false;
}
