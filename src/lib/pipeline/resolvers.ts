import {
    Intent,
    KillIntent,
    NominateIntent,
    ExecuteIntent,
    StateChanges,
} from "./types";
import { GameState, Phase } from "../types";

// ============================================================================
// DEFAULT RESOLVERS
// ============================================================================
// These define what happens when an intent is NOT prevented or redirected
// by any handler. They produce the "default" state changes for each intent.
// ============================================================================

type IntentResolver = (intent: Intent, state: GameState) => StateChanges;

/**
 * Default kill resolution: add a "dead" effect to the target.
 * No history entry needed — death announcements happen in startDay().
 */
function resolveKill(intent: Intent, _state: GameState): StateChanges {
    const kill = intent as KillIntent;
    return {
        entries: [],
        addEffects: {
            [kill.targetId]: [
                {
                    type: "dead",
                    data: { cause: kill.cause },
                    expiresAt: "never",
                },
            ],
        },
    };
}

/**
 * Default nomination resolution: record the nomination and transition to voting.
 */
function resolveNominate(intent: Intent, _state: GameState): StateChanges {
    const nom = intent as NominateIntent;
    return {
        entries: [
            {
                type: "nomination",
                message: [
                    {
                        type: "i18n",
                        key: "history.nominates",
                        params: {
                            nominator: nom.nominatorId,
                            nominee: nom.nomineeId,
                        },
                    },
                ],
                data: {
                    nominatorId: nom.nominatorId,
                    nomineeId: nom.nomineeId,
                },
            },
        ],
        stateUpdates: { phase: "voting" as Phase },
    };
}

/**
 * Default execution resolution: kill the player and record the execution.
 */
function resolveExecute(intent: Intent, _state: GameState): StateChanges {
    const exec = intent as ExecuteIntent;
    return {
        entries: [
            {
                type: "execution",
                message: [
                    {
                        type: "i18n",
                        key: "history.executed",
                        params: { player: exec.playerId },
                    },
                ],
                data: { playerId: exec.playerId },
            },
        ],
        addEffects: {
            [exec.playerId]: [
                {
                    type: "dead",
                    data: { cause: exec.cause },
                    expiresAt: "never",
                },
            ],
        },
    };
}

// ============================================================================
// RESOLVER REGISTRY
// ============================================================================

const resolvers: Record<string, IntentResolver> = {
    kill: resolveKill,
    nominate: resolveNominate,
    execute: resolveExecute,
};

export function getDefaultResolver(
    intentType: string
): IntentResolver | undefined {
    return resolvers[intentType];
}
