import {
    Intent,
    IntentHandler,
    PipelineResult,
    StateChanges,
    AvailableDayAction,
    WinConditionTrigger,
} from "./types";
import {
    GameState,
    PlayerState,
    Game,
    HistoryEntry,
    generateId,
} from "../types";
import { getEffect } from "../effects";
import { getDefaultResolver } from "./resolvers";
import { EffectToAdd } from "../roles/types";

// ============================================================================
// STATE CHANGES UTILITIES
// ============================================================================

export function emptyStateChanges(): StateChanges {
    return { entries: [] };
}

export function mergeStateChanges(
    target: StateChanges,
    source?: StateChanges,
): StateChanges {
    if (!source) return target;

    return {
        entries: [...target.entries, ...source.entries],
        stateUpdates: source.stateUpdates
            ? { ...target.stateUpdates, ...source.stateUpdates }
            : target.stateUpdates,
        addEffects: mergeEffectRecords(target.addEffects, source.addEffects),
        removeEffects: mergeRemoveRecords(
            target.removeEffects,
            source.removeEffects,
        ),
        changeRoles:
            target.changeRoles || source.changeRoles
                ? { ...target.changeRoles, ...source.changeRoles }
                : undefined,
    };
}

function mergeEffectRecords(
    a?: Record<string, EffectToAdd[]>,
    b?: Record<string, EffectToAdd[]>,
): Record<string, EffectToAdd[]> | undefined {
    if (!a && !b) return undefined;
    const result: Record<string, EffectToAdd[]> = { ...a };
    if (b) {
        for (const [key, val] of Object.entries(b)) {
            result[key] = [...(result[key] ?? []), ...val];
        }
    }
    return result;
}

function mergeRemoveRecords(
    a?: Record<string, string[]>,
    b?: Record<string, string[]>,
): Record<string, string[]> | undefined {
    if (!a && !b) return undefined;
    const result: Record<string, string[]> = { ...a };
    if (b) {
        for (const [key, val] of Object.entries(b)) {
            result[key] = [...(result[key] ?? []), ...val];
        }
    }
    return result;
}

// ============================================================================
// HANDLER COLLECTION
// ============================================================================

function collectActiveHandlers(
    state: GameState,
    intentType: string,
): Array<{ handler: IntentHandler; player: PlayerState }> {
    const result: Array<{ handler: IntentHandler; player: PlayerState }> = [];

    for (const player of state.players) {
        for (const effectInstance of player.effects) {
            const effectDef = getEffect(effectInstance.type);
            if (!effectDef?.handlers) continue;

            for (const handler of effectDef.handlers) {
                const types = Array.isArray(handler.intentType)
                    ? handler.intentType
                    : [handler.intentType];
                if (types.includes(intentType as Intent["type"])) {
                    result.push({ handler, player });
                }
            }
        }
    }

    return result;
}

// ============================================================================
// PIPELINE RUNNER
// ============================================================================

function runPipeline(
    intent: Intent,
    handlers: Array<{ handler: IntentHandler; player: PlayerState }>,
    state: GameState,
    game: Game,
    accumulated: StateChanges,
    startIndex: number,
): PipelineResult {
    for (let i = startIndex; i < handlers.length; i++) {
        const { handler, player } = handlers[i];
        if (!handler.appliesTo(intent, player, state)) continue;

        const result = handler.handle(intent, player, state, game);

        switch (result.action) {
            case "allow":
                if (result.stateChanges) {
                    accumulated = mergeStateChanges(
                        accumulated,
                        result.stateChanges,
                    );
                }
                continue;

            case "prevent":
                if (result.stateChanges) {
                    accumulated = mergeStateChanges(
                        accumulated,
                        result.stateChanges,
                    );
                }
                return { type: "prevented", stateChanges: accumulated };

            case "redirect": {
                if (result.stateChanges) {
                    accumulated = mergeStateChanges(
                        accumulated,
                        result.stateChanges,
                    );
                }
                // Re-collect handlers for the new intent type and restart pipeline
                const newHandlers = collectActiveHandlers(
                    state,
                    result.newIntent.type,
                );
                newHandlers.sort(
                    (a, b) => a.handler.priority - b.handler.priority,
                );
                return runPipeline(
                    result.newIntent,
                    newHandlers,
                    state,
                    game,
                    accumulated,
                    0,
                );
            }

            case "request_ui":
                return {
                    type: "needs_input",
                    UIComponent: result.UIComponent,
                    intent,
                    resume: (uiResult: unknown) => {
                        const afterUI = result.resume(uiResult);

                        switch (afterUI.action) {
                            case "allow":
                                if (afterUI.stateChanges) {
                                    accumulated = mergeStateChanges(
                                        accumulated,
                                        afterUI.stateChanges,
                                    );
                                }
                                return runPipeline(
                                    intent,
                                    handlers,
                                    state,
                                    game,
                                    accumulated,
                                    i + 1,
                                );
                            case "prevent":
                                if (afterUI.stateChanges) {
                                    accumulated = mergeStateChanges(
                                        accumulated,
                                        afterUI.stateChanges,
                                    );
                                }
                                return {
                                    type: "prevented" as const,
                                    stateChanges: accumulated,
                                };
                            case "redirect": {
                                if (afterUI.stateChanges) {
                                    accumulated = mergeStateChanges(
                                        accumulated,
                                        afterUI.stateChanges,
                                    );
                                }
                                const newHandlers = collectActiveHandlers(
                                    state,
                                    afterUI.newIntent.type,
                                );
                                newHandlers.sort(
                                    (a, b) =>
                                        a.handler.priority - b.handler.priority,
                                );
                                return runPipeline(
                                    afterUI.newIntent,
                                    newHandlers,
                                    state,
                                    game,
                                    accumulated,
                                    0,
                                );
                            }
                            default:
                                // request_ui after request_ui — continue pipeline
                                return runPipeline(
                                    intent,
                                    handlers,
                                    state,
                                    game,
                                    accumulated,
                                    i + 1,
                                );
                        }
                    },
                };
        }
    }

    // No handler prevented — apply default resolution
    const resolver = getDefaultResolver(intent.type);
    if (resolver) {
        const defaultChanges = resolver(intent, state);
        accumulated = mergeStateChanges(accumulated, defaultChanges);
    }

    return { type: "resolved", stateChanges: accumulated };
}

/**
 * Resolve an intent through the pipeline.
 *
 * Collects all handlers from active effects on all players,
 * runs them in priority order, and returns the result.
 */
export function resolveIntent(
    intent: Intent,
    state: GameState,
    game: Game,
): PipelineResult {
    const handlers = collectActiveHandlers(state, intent.type);
    handlers.sort((a, b) => a.handler.priority - b.handler.priority);
    return runPipeline(intent, handlers, state, game, emptyStateChanges(), 0);
}

// ============================================================================
// PIPELINE RESULT APPLICATION
// ============================================================================

/**
 * Apply pipeline state changes to a game, creating history entries as needed.
 * This is the bridge between the pipeline system and the event-sourced game state.
 */
export function applyPipelineChanges(game: Game, changes: StateChanges): Game {
    if (
        changes.entries.length === 0 &&
        !changes.stateUpdates &&
        !changes.addEffects &&
        !changes.removeEffects
    ) {
        return game;
    }

    const currentState = game.history.at(-1)?.stateAfter ?? {
        phase: "setup" as const,
        round: 0,
        players: [],
        winner: null,
    };

    if (changes.entries.length > 0) {
        // Apply state updates and effects with the first entry
        let updatedGame = game;
        for (let i = 0; i < changes.entries.length; i++) {
            const isFirst = i === 0;
            const entry = changes.entries[i];

            let newState = isFirst
                ? { ...currentState, ...changes.stateUpdates }
                : (updatedGame.history.at(-1)?.stateAfter ?? currentState);

            // Apply effect and role changes on first entry
            if (
                isFirst &&
                (changes.addEffects ||
                    changes.removeEffects ||
                    changes.changeRoles)
            ) {
                newState = applyPlayerChanges(
                    newState,
                    changes.addEffects,
                    changes.removeEffects,
                    changes.changeRoles,
                );
            }

            // Create non-first entry state from latest
            if (!isFirst) {
                newState = updatedGame.history.at(-1)?.stateAfter ?? newState;
            }

            const historyEntry: HistoryEntry = {
                id: generateId(),
                timestamp: Date.now(),
                type: entry.type,
                message: entry.message,
                data: entry.data,
                stateAfter: newState,
            };

            updatedGame = {
                ...updatedGame,
                history: [...updatedGame.history, historyEntry],
            };
        }
        return updatedGame;
    }

    // No entries but there are state/effect changes — apply silently
    // by updating the last history entry's stateAfter
    let newState = { ...currentState, ...changes.stateUpdates };
    if (changes.addEffects || changes.removeEffects || changes.changeRoles) {
        newState = applyPlayerChanges(
            newState,
            changes.addEffects,
            changes.removeEffects,
            changes.changeRoles,
        );
    }

    const lastEntry = game.history[game.history.length - 1];
    if (lastEntry) {
        return {
            ...game,
            history: [
                ...game.history.slice(0, -1),
                { ...lastEntry, stateAfter: newState },
            ],
        };
    }

    return game;
}

function applyPlayerChanges(
    state: GameState,
    addEffects?: Record<string, EffectToAdd[]>,
    removeEffects?: Record<string, string[]>,
    changeRoles?: Record<string, string>,
): GameState {
    return {
        ...state,
        players: state.players.map((player) => {
            let effects = [...player.effects];
            let roleId = player.roleId;

            if (removeEffects?.[player.id]) {
                effects = effects.filter(
                    (e) => !removeEffects[player.id].includes(e.type),
                );
            }

            if (addEffects?.[player.id]) {
                const newEffects = addEffects[player.id].map((e) => ({
                    id: generateId(),
                    type: e.type,
                    data: e.data,
                    expiresAt: e.expiresAt,
                }));
                effects = [...effects, ...newEffects];
            }

            if (changeRoles?.[player.id]) {
                roleId = changeRoles[player.id];
            }

            return { ...player, effects, roleId };
        }),
    };
}

// ============================================================================
// DAY ACTION COLLECTION
// ============================================================================

/**
 * Collect all available day actions from players' active effects.
 */
export function getAvailableDayActions(
    state: GameState,
    t: Record<string, any>,
): AvailableDayAction[] {
    const actions: AvailableDayAction[] = [];

    for (const player of state.players) {
        for (const effectInstance of player.effects) {
            const effectDef = getEffect(effectInstance.type);
            if (!effectDef?.dayActions) continue;

            for (const dayAction of effectDef.dayActions) {
                if (dayAction.condition(player, state)) {
                    actions.push({
                        id: `${dayAction.id}_${player.id}`,
                        playerId: player.id,
                        icon: dayAction.icon,
                        label: dayAction.getLabel(t),
                        description: dayAction.getDescription(t),
                        ActionComponent: dayAction.ActionComponent,
                    });
                }
            }
        }
    }

    return actions;
}

// ============================================================================
// WIN CONDITION COLLECTION
// ============================================================================

/**
 * Collect and check all dynamic win conditions from active effects and roles.
 */
export function checkDynamicWinConditions(
    state: GameState,
    game: Game,
    triggers: WinConditionTrigger[],
    getRole: (
        roleId: string,
    ) => { winConditions?: import("./types").WinConditionCheck[] } | undefined,
): "townsfolk" | "demon" | null {
    // Check effect-based win conditions
    for (const player of state.players) {
        for (const effectInstance of player.effects) {
            const effectDef = getEffect(effectInstance.type);
            if (!effectDef?.winConditions) continue;

            for (const wc of effectDef.winConditions) {
                if (triggers.includes(wc.trigger)) {
                    const result = wc.check(state, game);
                    if (result) return result;
                }
            }
        }
    }

    // Check role-based win conditions
    for (const player of state.players) {
        const role = getRole(player.roleId);
        if (!role?.winConditions) continue;

        for (const wc of role.winConditions) {
            if (triggers.includes(wc.trigger)) {
                const result = wc.check(state, game);
                if (result) return result;
            }
        }
    }

    return null;
}

export { perceive, canRegisterAsTeam } from "./perception";
export * from "./types";
