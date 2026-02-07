import {
    PlayerState,
    GameState,
    Game,
    HistoryEntry,
    generateId,
} from "../types";

// ============================================================================
// PLAYER FACTORY
// ============================================================================

let playerCounter = 0;

export function makePlayer(
    overrides: Partial<PlayerState> & { roleId?: string } = {}
): PlayerState {
    playerCounter++;
    return {
        id: overrides.id ?? `player_${playerCounter}`,
        name: overrides.name ?? `Player ${playerCounter}`,
        roleId: overrides.roleId ?? "villager",
        effects: overrides.effects ?? [],
    };
}

/**
 * Returns a new PlayerState with the given effect added.
 */
export function addEffectTo(
    player: PlayerState,
    effectType: string,
    data?: Record<string, unknown>,
    expiresAt?: "end_of_night" | "end_of_day" | "never"
): PlayerState {
    return {
        ...player,
        effects: [
            ...player.effects,
            {
                id: generateId(),
                type: effectType,
                data,
                expiresAt: expiresAt ?? "never",
            },
        ],
    };
}

// ============================================================================
// STATE FACTORY
// ============================================================================

export function makeState(
    overrides: Partial<GameState> & { players?: PlayerState[] } = {}
): GameState {
    return {
        phase: overrides.phase ?? "night",
        round: overrides.round ?? 1,
        players: overrides.players ?? [],
        winner: overrides.winner ?? null,
    };
}

// ============================================================================
// GAME FACTORY
// ============================================================================

/**
 * Creates a Game with a single `game_created` history entry containing the given state.
 */
export function makeGame(state?: GameState): Game {
    const gameState = state ?? makeState({ phase: "setup", round: 0 });
    return {
        id: generateId(),
        name: "Test Game",
        createdAt: Date.now(),
        history: [
            {
                id: generateId(),
                timestamp: Date.now(),
                type: "game_created",
                message: [{ type: "i18n", key: "history.gameStarted" }],
                data: {},
                stateAfter: gameState,
            },
        ],
    };
}

/**
 * Builds a Game with a sequence of history entries.
 * The first entry uses the provided state; subsequent entries clone it.
 */
export function makeGameWithHistory(
    entries: Array<{
        type: HistoryEntry["type"];
        data?: Record<string, unknown>;
        stateOverrides?: Partial<GameState>;
    }>,
    baseState?: GameState
): Game {
    const state = baseState ?? makeState();
    let currentState = { ...state };

    const historyEntries: HistoryEntry[] = entries.map((entry) => {
        if (entry.stateOverrides) {
            currentState = { ...currentState, ...entry.stateOverrides };
        }
        return {
            id: generateId(),
            timestamp: Date.now(),
            type: entry.type,
            message: [{ type: "i18n" as const, key: "test" }],
            data: entry.data ?? {},
            stateAfter: { ...currentState },
        };
    });

    return {
        id: generateId(),
        name: "Test Game",
        createdAt: Date.now(),
        history: historyEntries,
    };
}

// ============================================================================
// COMMON PLAYER SETS
// ============================================================================

/**
 * Creates a standard 5-player game state for testing.
 * Players: washerwoman (townsfolk), chef (townsfolk), mayor (townsfolk), saint (outsider), imp (demon)
 */
export function makeStandardPlayers(): PlayerState[] {
    return [
        makePlayer({ id: "p1", name: "Alice", roleId: "washerwoman" }),
        makePlayer({ id: "p2", name: "Bob", roleId: "chef" }),
        makePlayer({ id: "p3", name: "Carol", roleId: "mayor" }),
        makePlayer({ id: "p4", name: "Dave", roleId: "saint" }),
        makePlayer({ id: "p5", name: "Eve", roleId: "imp" }),
    ];
}

/**
 * Reset the player counter (call in beforeEach if needed).
 */
export function resetPlayerCounter(): void {
    playerCounter = 0;
}
