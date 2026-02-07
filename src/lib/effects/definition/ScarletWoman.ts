import { EffectDefinition } from "../types";
import {
    IntentHandler,
    KillIntent,
    ExecuteIntent,
} from "../../pipeline/types";
import { getRole } from "../../roles";
import { hasEffect, getAlivePlayers } from "../../types";

/**
 * Scarlet Woman effect handler.
 *
 * When the Demon dies (via kill or execution) and there are 5 or more
 * alive non-Traveller players, the Scarlet Woman becomes the Demon.
 * The handler allows the kill/execution to proceed but piggybacks
 * a role change onto the state changes.
 *
 * Priority 15: runs AFTER protection handlers (Safe at 10) so that
 * if the kill is prevented, this handler never executes. If the kill
 * is allowed, the Scarlet Woman transforms.
 */
const scarletWomanHandler: IntentHandler = {
    intentType: ["kill", "execute"],
    priority: 15,
    appliesTo: (intent, effectPlayer, state) => {
        // Get the target of the intent
        let targetId: string;
        if (intent.type === "kill") {
            targetId = (intent as KillIntent).targetId;
        } else if (intent.type === "execute") {
            targetId = (intent as ExecuteIntent).playerId;
        } else {
            return false;
        }

        // The target must be a Demon
        const target = state.players.find((p) => p.id === targetId);
        if (!target) return false;
        const targetRole = getRole(target.roleId);
        if (targetRole?.team !== "demon") return false;

        // The Scarlet Woman (effect holder) must be alive
        if (hasEffect(effectPlayer, "dead")) return false;

        // The Scarlet Woman must not be the target themselves
        if (effectPlayer.id === targetId) return false;

        // 5+ alive players (Travellers don't count — none exist yet)
        const aliveCount = getAlivePlayers(state).length;
        return aliveCount >= 5;
    },
    handle: (intent, effectPlayer, state) => {
        // Determine the demon's role so the SW inherits it
        let targetId: string;
        if (intent.type === "kill") {
            targetId = (intent as KillIntent).targetId;
        } else {
            targetId = (intent as ExecuteIntent).playerId;
        }

        const target = state.players.find((p) => p.id === targetId)!;

        return {
            action: "allow",
            stateChanges: {
                entries: [
                    {
                        type: "role_changed",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.scarlet_woman.history.becameDemon",
                                params: {
                                    player: effectPlayer.id,
                                    role: target.roleId,
                                },
                            },
                        ],
                        data: {
                            playerId: effectPlayer.id,
                            fromRole: effectPlayer.roleId,
                            toRole: target.roleId,
                        },
                    },
                ],
                changeRoles: {
                    [effectPlayer.id]: target.roleId,
                },
                removeEffects: {
                    [effectPlayer.id]: ["scarlet_woman"],
                },
            },
        };
    },
};

const definition: EffectDefinition = {
    id: "scarlet_woman",
    icon: "sparkles",
    handlers: [scarletWomanHandler],
};

export default definition;
