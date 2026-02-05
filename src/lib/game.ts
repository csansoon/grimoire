import {
    Game,
    GameState,
    HistoryEntry,
    PlayerState,
    generateId,
    getCurrentState,
    hasEffect,
    getAlivePlayers,
} from "./types";
import { getRole, getNightOrderRoles } from "./roles";
import { NightActionResult, EffectToAdd } from "./roles/types";

// ============================================================================
// GAME CREATION
// ============================================================================

export type PlayerSetup = {
    name: string;
    roleId: string;
};

export function createGame(
    name: string,
    players: PlayerSetup[]
): Game {
    const gameId = generateId();

    const playerStates: PlayerState[] = players.map((p) => {
        const role = getRole(p.roleId);
        const effects: PlayerState["effects"] = [];

        // Apply initial effects defined by the role
        if (role?.initialEffects) {
            for (const effect of role.initialEffects) {
                effects.push({
                    id: generateId(),
                    type: effect.type,
                    data: effect.data ?? {},
                    expiresAt: effect.expiresAt ?? "never",
                });
            }
        }

        return {
            id: generateId(),
            name: p.name,
            roleId: p.roleId,
            effects,
        };
    });

    const initialState: GameState = {
        phase: "setup",
        round: 0,
        players: playerStates,
        winner: null,
    };

    const game: Game = {
        id: gameId,
        name,
        createdAt: Date.now(),
        history: [
            {
                id: generateId(),
                timestamp: Date.now(),
                type: "game_created",
                message: [{ type: "i18n", key: "history.gameStarted" }],
                data: { players: playerStates.map((p) => ({ id: p.id, name: p.name, roleId: p.roleId })) },
                stateAfter: initialState,
            },
        ],
    };

    return game;
}

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

function expireEffects(
    state: GameState,
    expirationType: "end_of_night" | "end_of_day"
): GameState {
    return {
        ...state,
        players: state.players.map((player) => ({
            ...player,
            effects: player.effects.filter(
                (e) => e.expiresAt !== expirationType
            ),
        })),
    };
}

export function addHistoryEntry(
    game: Game,
    entry: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">,
    stateUpdates?: Partial<GameState>,
    addEffects?: Record<string, EffectToAdd[]>,
    removeEffects?: Record<string, string[]>
): Game {
    const currentState = getCurrentState(game);

    // Apply state updates
    let newState = { ...currentState, ...stateUpdates };

    // Apply effect changes
    if (addEffects || removeEffects) {
        newState = {
            ...newState,
            players: newState.players.map((player) => {
                let effects = [...player.effects];

                // Remove effects
                if (removeEffects?.[player.id]) {
                    effects = effects.filter(
                        (e) => !removeEffects[player.id].includes(e.type)
                    );
                }

                // Add effects
                if (addEffects?.[player.id]) {
                    const newEffects = addEffects[player.id].map((e) => ({
                        id: generateId(),
                        type: e.type,
                        data: e.data,
                        expiresAt: e.expiresAt,
                    }));
                    effects = [...effects, ...newEffects];
                }

                return { ...player, effects };
            }),
        };
    }

    const historyEntry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        type: entry.type,
        message: entry.message,
        data: entry.data,
        stateAfter: newState,
    };

    return {
        ...game,
        history: [...game.history, historyEntry],
    };
}

// ============================================================================
// GAME FLOW
// ============================================================================

export type GameStep =
    | { type: "role_reveal"; playerId: string }
    | { type: "night_action"; playerId: string; roleId: string }
    | { type: "night_action_skip"; playerId: string; roleId: string } // Role's shouldWake returned false
    | { type: "night_waiting" } // Waiting for narrator to start day
    | { type: "day" }
    | { type: "voting"; nomineeId: string }
    | { type: "game_over"; winner: "townsfolk" | "demon" };

export function getNextStep(game: Game): GameStep {
    const state = getCurrentState(game);

    // Check win conditions first
    const winResult = checkWinCondition(state);
    if (winResult) {
        return { type: "game_over", winner: winResult };
    }

    if (state.phase === "setup") {
        // Find next player who hasn't seen their role
        const revealedPlayers = game.history
            .filter((e) => e.type === "role_revealed")
            .map((e) => e.data.playerId as string);

        const nextPlayer = state.players.find(
            (p) => !revealedPlayers.includes(p.id)
        );

        if (nextPlayer) {
            return { type: "role_reveal", playerId: nextPlayer.id };
        }

        // All players have seen roles - this shouldn't happen, we transition to night
        return { type: "night_waiting" };
    }

    if (state.phase === "night") {
        // Find which roles have acted this night
        const nightStartIndex = findLastEventIndex(game, "night_started");
        const actedRoles = game.history
            .slice(nightStartIndex + 1)
            .filter((e) => e.type === "night_action" || e.type === "night_skipped")
            .map((e) => e.data.roleId as string);

        // Get all roles with night actions in order
        const nightRoles = getNightOrderRoles();

        // Find next role that hasn't acted
        for (const role of nightRoles) {
            if (!actedRoles.includes(role.id)) {
                // Find the player with this role
                const player = state.players.find((p) => p.roleId === role.id);
                if (player) {
                    // shouldWake handles ALL filtering: alive check, round check, conditions
                    if (role.shouldWake && !role.shouldWake(game, player)) {
                        // Role should not wake - mark as skipped
                        return {
                            type: "night_action_skip",
                            playerId: player.id,
                            roleId: role.id,
                        };
                    }
                    return {
                        type: "night_action",
                        playerId: player.id,
                        roleId: role.id,
                    };
                }
            }
        }

        // All roles have acted
        return { type: "night_waiting" };
    }

    if (state.phase === "day") {
        return { type: "day" };
    }

    return { type: "day" };
}

function findLastEventIndex(game: Game, eventType: string): number {
    for (let i = game.history.length - 1; i >= 0; i--) {
        if (game.history[i].type === eventType) {
            return i;
        }
    }
    return -1;
}

/**
 * Check if an execution has already happened today.
 * This includes regular executions from voting and virgin-triggered executions.
 */
export function hasExecutionToday(game: Game): boolean {
    const dayStartIndex = findLastEventIndex(game, "day_started");
    if (dayStartIndex === -1) return false;

    for (let i = dayStartIndex + 1; i < game.history.length; i++) {
        const entry = game.history[i];
        if (entry.type === "execution" || entry.type === "virgin_execution") {
            return true;
        }
    }
    return false;
}

// ============================================================================
// PHASE TRANSITIONS
// ============================================================================

export function startNight(game: Game): Game {
    const state = getCurrentState(game);
    const newRound = state.phase === "setup" ? 1 : state.round + 1;

    return addHistoryEntry(
        game,
        {
            type: "night_started",
            message: [
                { type: "i18n", key: "history.nightBegins", params: { round: newRound } },
            ],
            data: { round: newRound },
        },
        { phase: "night", round: newRound }
    );
}

export function startDay(game: Game): Game {
    // Resolve night - add death announcement entries
    let updatedGame = addHistoryEntry(
        game,
        {
            type: "night_resolved",
            message: [{ type: "i18n", key: "history.sunRises" }],
            data: {},
        }
    );

    // Find who died tonight
    const nightStartIndex = findLastEventIndex(updatedGame, "night_started");
    const deathEffects: string[] = [];

    for (let i = nightStartIndex + 1; i < updatedGame.history.length; i++) {
        const entry = updatedGame.history[i];
        if (entry.type === "night_action" && entry.data.action === "kill") {
            deathEffects.push(entry.data.targetId as string);
        }
    }

    // Announce deaths
    const currentState = getCurrentState(updatedGame);
    for (const playerId of deathEffects) {
        const player = currentState.players.find((p) => p.id === playerId);
        if (player && hasEffect(player, "dead")) {
            updatedGame = addHistoryEntry(updatedGame, {
                type: "effect_added",
                message: [
                    { type: "i18n", key: "history.diedInNight", params: { player: player.id } },
                ],
                data: { playerId: player.id, effectType: "dead" },
            });
        }
    }

    // Expire effects that should end at end of night (e.g., Monk's protection)
    const stateAfterExpiration = expireEffects(getCurrentState(updatedGame), "end_of_night");

    // Transition to day with expired effects applied
    return addHistoryEntry(
        updatedGame,
        {
            type: "day_started",
            message: [
                { type: "i18n", key: "history.dayBegins", params: { round: currentState.round } },
            ],
            data: { round: currentState.round },
        },
        { phase: "day", players: stateAfterExpiration.players }
    );
}

export function markRoleRevealed(game: Game, playerId: string): Game {
    const state = getCurrentState(game);
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return game;

    return addHistoryEntry(game, {
        type: "role_revealed",
        message: [
            { type: "i18n", key: "history.learnedRole", params: { player: playerId, role: player.roleId } },
        ],
        data: { playerId, roleId: player.roleId },
    });
}

export function applyNightAction(
    game: Game,
    result: NightActionResult
): Game {
    let updatedGame = game;

    for (const entry of result.entries) {
        updatedGame = addHistoryEntry(
            updatedGame,
            entry,
            result.stateUpdates,
            result.addEffects,
            result.removeEffects
        );
        // Only apply state/effects on first entry
        result = { ...result, stateUpdates: undefined, addEffects: undefined, removeEffects: undefined };
    }

    return updatedGame;
}

export function skipNightAction(game: Game, roleId: string, playerId: string): Game {
    return addHistoryEntry(game, {
        type: "night_skipped",
        message: [
            { type: "i18n", key: "history.noActionTonight", params: { role: roleId } },
        ],
        data: { roleId, playerId },
    });
}

// ============================================================================
// VOTING
// ============================================================================

export function nominate(
    game: Game,
    nominatorId: string,
    nomineeId: string
): Game {
    const state = getCurrentState(game);
    const nominator = state.players.find((p) => p.id === nominatorId);
    const nominee = state.players.find((p) => p.id === nomineeId);

    if (!nominator || !nominee) return game;

    // Check for Virgin with Pure effect
    if (hasEffect(nominee, "pure")) {
        const nominatorRole = getRole(nominator.roleId);
        const isTownsfolk = nominatorRole?.team === "townsfolk";

        if (isTownsfolk) {
            // Townsfolk nominates Virgin → Nominator is executed immediately!
            return addHistoryEntry(
                game,
                {
                    type: "virgin_execution",
                    message: [
                        { type: "i18n", key: "roles.virgin.history.townsfolkExecuted", params: { nominator: nominatorId } },
                    ],
                    data: { nominatorId, nomineeId, virginTriggered: true },
                },
                { phase: "day" },
                { [nominatorId]: [{ type: "dead", expiresAt: "never" }] },
                { [nomineeId]: ["pure"] }
            );
        } else {
            // Non-townsfolk nominates Virgin → Virgin loses power, nomination continues
            let updatedGame = addHistoryEntry(
                game,
                {
                    type: "virgin_spent",
                    message: [
                        { type: "i18n", key: "roles.virgin.history.lostPurity", params: { nominator: nominatorId } },
                    ],
                    data: { nominatorId, nomineeId, virginTriggered: false },
                },
                undefined,
                undefined,
                { [nomineeId]: ["pure"] }
            );
            
            // Then proceed with normal nomination
            return addHistoryEntry(
                updatedGame,
                {
                    type: "nomination",
                    message: [
                        { type: "i18n", key: "history.nominates", params: { nominator: nominatorId, nominee: nomineeId } },
                    ],
                    data: { nominatorId, nomineeId },
                },
                { phase: "voting" }
            );
        }
    }

    return addHistoryEntry(
        game,
        {
            type: "nomination",
            message: [
                { type: "i18n", key: "history.nominates", params: { nominator: nominatorId, nominee: nomineeId } },
            ],
            data: { nominatorId, nomineeId },
        },
        { phase: "voting" }
    );
}

export function resolveVote(
    game: Game,
    nomineeId: string,
    votesFor: string[],
    votesAgainst: string[]
): Game {
    const state = getCurrentState(game);
    const nominee = state.players.find((p) => p.id === nomineeId);
    if (!nominee) return game;

    const aliveCount = getAlivePlayers(state).length;
    const majority = Math.ceil(aliveCount / 2);
    const passed = votesFor.length >= majority;

    // Mark dead voters as having used their vote
    const addEffects: Record<string, { type: string }[]> = {};
    for (const voterId of votesFor) {
        const voter = state.players.find((p) => p.id === voterId);
        if (voter && hasEffect(voter, "dead") && !hasEffect(voter, "used_dead_vote")) {
            addEffects[voterId] = [{ type: "used_dead_vote" }];
        }
    }

    let updatedGame = addHistoryEntry(
        game,
        {
            type: "vote",
            message: [
                { type: "i18n", key: "history.voteResult", params: { 
                    player: nomineeId,
                    for: votesFor.length, 
                    against: votesAgainst.length,
                }},
                { type: "i18n", key: passed ? "history.votePassed" : "history.voteFailed" },
            ],
            data: { nomineeId, votesFor, votesAgainst, passed, majority },
        },
        { phase: "day" },
        addEffects
    );

    if (passed) {
        // Execute the player
        updatedGame = addHistoryEntry(
            updatedGame,
            {
                type: "execution",
                message: [
                    { type: "i18n", key: "history.executed", params: { player: nomineeId } },
                ],
                data: { playerId: nomineeId },
            },
            undefined,
            { [nomineeId]: [{ type: "dead", data: { cause: "execution" } }] }
        );
    }

    return updatedGame;
}

// ============================================================================
// WIN CONDITIONS
// ============================================================================

export function checkWinCondition(state: GameState): "townsfolk" | "demon" | null {
    const alivePlayers = getAlivePlayers(state);
    const aliveDemons = alivePlayers.filter((p) => {
        const role = getRole(p.roleId);
        return role?.team === "demon";
    });

    // Good wins if all demons are dead
    if (aliveDemons.length === 0) {
        return "townsfolk";
    }

    // Evil wins if only 2 players remain (and one is a demon)
    if (alivePlayers.length <= 2 && aliveDemons.length > 0) {
        return "demon";
    }

    return null;
}

export function endGame(game: Game, winner: "townsfolk" | "demon"): Game {
    return addHistoryEntry(
        game,
        {
            type: "game_ended",
            message: [
                {
                    type: "i18n",
                    key: winner === "townsfolk" ? "history.goodWins" : "history.evilWins",
                },
            ],
            data: { winner },
        },
        { phase: "ended", winner }
    );
}
