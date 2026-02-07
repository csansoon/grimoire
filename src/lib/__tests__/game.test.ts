import { describe, it, expect, beforeEach } from "vitest";
import {
    createGame,
    addHistoryEntry,
    startNight,
    startDay,
    getNextStep,
    applyNightAction,
    skipNightAction,
    nominate,
    resolveVote,
    addEffectToPlayer,
    removeEffectFromPlayer,
    hasExecutionToday,
} from "../game";
import { getCurrentState, hasEffect } from "../types";
import {
    makePlayer,
    makeGame,
    makeState,
    makeStandardPlayers,
    addEffectTo,
    resetPlayerCounter,
} from "./helpers";

beforeEach(() => {
    resetPlayerCounter();
});

// ============================================================================
// GAME CREATION
// ============================================================================

describe("createGame", () => {
    it("produces a game with correct initial state", () => {
        const game = createGame("Test", [
            { name: "Alice", roleId: "villager" },
            { name: "Bob", roleId: "imp" },
        ]);

        expect(game.name).toBe("Test");
        expect(game.history).toHaveLength(1);
        expect(game.history[0].type).toBe("game_created");

        const state = getCurrentState(game);
        expect(state.phase).toBe("setup");
        expect(state.round).toBe(0);
        expect(state.players).toHaveLength(2);
        expect(state.winner).toBeNull();
    });

    it("assigns player IDs and names correctly", () => {
        const game = createGame("Test", [
            { name: "Alice", roleId: "villager" },
            { name: "Bob", roleId: "imp" },
        ]);

        const state = getCurrentState(game);
        expect(state.players[0].name).toBe("Alice");
        expect(state.players[0].roleId).toBe("villager");
        expect(state.players[1].name).toBe("Bob");
        expect(state.players[1].roleId).toBe("imp");
    });

    it("applies initialEffects from role definitions", () => {
        const game = createGame("Test", [
            { name: "Alice", roleId: "soldier" }, // has initialEffect: safe
            { name: "Bob", roleId: "virgin" }, // has initialEffect: pure
            { name: "Carol", roleId: "villager" }, // no initial effects
        ]);

        const state = getCurrentState(game);
        expect(state.players[0].effects.some((e) => e.type === "safe")).toBe(true);
        expect(state.players[1].effects.some((e) => e.type === "pure")).toBe(true);
        expect(state.players[2].effects).toHaveLength(0);
    });
});

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

describe("addHistoryEntry", () => {
    it("appends an entry with correct stateAfter snapshot", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = addHistoryEntry(game, {
            type: "night_action",
            message: [{ type: "text", content: "test" }],
            data: { roleId: "imp", playerId: "p5", action: "kill", targetId: "p1" },
        });

        expect(updated.history).toHaveLength(2);
        const newState = getCurrentState(updated);
        // State unchanged since we didn't pass stateUpdates
        expect(newState.phase).toBe("night");
        expect(newState.round).toBe(1);
    });

    it("applies stateUpdates to the snapshot", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = addHistoryEntry(
            game,
            {
                type: "day_started",
                message: [{ type: "text", content: "day" }],
                data: {},
            },
            { phase: "day" }
        );

        const state = getCurrentState(updated);
        expect(state.phase).toBe("day");
    });

    it("applies addEffects to players", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = addHistoryEntry(
            game,
            {
                type: "night_action",
                message: [{ type: "text", content: "test" }],
                data: {},
            },
            undefined,
            { p1: [{ type: "safe", expiresAt: "end_of_night" }] }
        );

        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(true);
    });

    it("applies removeEffects from players", () => {
        const players = makeStandardPlayers();
        players[0] = addEffectTo(players[0], "safe");
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = addHistoryEntry(
            game,
            {
                type: "night_action",
                message: [{ type: "text", content: "test" }],
                data: {},
            },
            undefined,
            undefined,
            { p1: ["safe"] }
        );

        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(false);
    });
});

// ============================================================================
// PHASE TRANSITIONS
// ============================================================================

describe("startNight", () => {
    it("transitions from setup to night round 1", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "setup", round: 0, players }));

        const updated = startNight(game);
        const state = getCurrentState(updated);
        expect(state.phase).toBe("night");
        expect(state.round).toBe(1);
    });

    it("increments round when transitioning from day to night", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "day", round: 1, players }));

        const updated = startNight(game);
        const state = getCurrentState(updated);
        expect(state.phase).toBe("night");
        expect(state.round).toBe(2);
    });
});

describe("startDay", () => {
    it("transitions to day phase", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));
        // Need a night_started entry for startDay to find
        const withNight = addHistoryEntry(game, {
            type: "night_started",
            message: [{ type: "text", content: "night" }],
            data: { round: 1 },
        });

        const updated = startDay(withNight);
        const state = getCurrentState(updated);
        expect(state.phase).toBe("day");
    });

    it("expires end_of_night effects", () => {
        const players = makeStandardPlayers();
        // p1 has a safe effect that expires at end of night (like Monk protection)
        players[0] = addEffectTo(players[0], "safe", undefined, "end_of_night");
        const game = makeGame(makeState({ phase: "night", round: 1, players }));
        const withNight = addHistoryEntry(game, {
            type: "night_started",
            message: [{ type: "text", content: "night" }],
            data: { round: 1 },
        });

        const updated = startDay(withNight);
        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(false);
    });

    it("preserves permanent effects", () => {
        const players = makeStandardPlayers();
        // p1 has a permanent safe effect (like Soldier)
        players[0] = addEffectTo(players[0], "safe", undefined, "never");
        const game = makeGame(makeState({ phase: "night", round: 1, players }));
        const withNight = addHistoryEntry(game, {
            type: "night_started",
            message: [{ type: "text", content: "night" }],
            data: { round: 1 },
        });

        const updated = startDay(withNight);
        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(true);
    });
});

// ============================================================================
// GAME STEP RESOLUTION
// ============================================================================

describe("getNextStep", () => {
    it("returns role_reveal for unrevealed players in setup", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "setup", round: 0, players }));

        const step = getNextStep(game);
        expect(step.type).toBe("role_reveal");
        if (step.type === "role_reveal") {
            expect(step.playerId).toBe("p1");
        }
    });

    it("returns night_waiting after all roles revealed in setup", () => {
        // Need 3+ players with a demon so win conditions don't trigger
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "villager" }),
            makePlayer({ id: "p3", roleId: "imp" }),
        ];
        let game = makeGame(makeState({ phase: "setup", round: 0, players }));
        // Mark all players as revealed
        for (const p of players) {
            game = addHistoryEntry(game, {
                type: "role_revealed",
                message: [{ type: "text", content: "revealed" }],
                data: { playerId: p.id, roleId: p.roleId },
            });
        }

        const step = getNextStep(game);
        expect(step.type).toBe("night_waiting");
    });

    it("returns day step during day phase", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "day", round: 1, players }));

        const step = getNextStep(game);
        expect(step.type).toBe("day");
    });
});

// ============================================================================
// NIGHT ACTIONS
// ============================================================================

describe("applyNightAction", () => {
    it("records entries in history", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = applyNightAction(game, {
            entries: [
                {
                    type: "night_action",
                    message: [{ type: "text", content: "killed" }],
                    data: { roleId: "imp", playerId: "p5", action: "kill", targetId: "p1" },
                },
            ],
        });

        expect(updated.history).toHaveLength(2);
        expect(updated.history[1].type).toBe("night_action");
    });

    it("applies direct effect changes", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = applyNightAction(game, {
            entries: [
                {
                    type: "night_action",
                    message: [{ type: "text", content: "protected" }],
                    data: { roleId: "monk", playerId: "p3" },
                },
            ],
            addEffects: {
                p1: [{ type: "safe", expiresAt: "end_of_night" }],
            },
        });

        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(true);
    });
});

describe("skipNightAction", () => {
    it("records a skip entry", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = skipNightAction(game, "chef", "p2");
        expect(updated.history).toHaveLength(2);
        expect(updated.history[1].type).toBe("night_skipped");
        expect(updated.history[1].data.roleId).toBe("chef");
    });
});

// ============================================================================
// NOMINATIONS AND VOTING
// ============================================================================

describe("nominate", () => {
    it("creates a nomination entry and transitions to voting", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "day", round: 1, players }));

        const updated = nominate(game, "p1", "p5");
        const state = getCurrentState(updated);
        expect(state.phase).toBe("voting");

        // Should have a nomination entry
        const nomEntry = updated.history.find((e) => e.type === "nomination");
        expect(nomEntry).toBeDefined();
        expect(nomEntry!.data.nominatorId).toBe("p1");
        expect(nomEntry!.data.nomineeId).toBe("p5");
    });

    it("returns unchanged game for invalid player IDs", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "day", round: 1, players }));

        const updated = nominate(game, "nonexistent", "p5");
        expect(updated).toBe(game);
    });
});

describe("resolveVote", () => {
    it("executes player when majority votes for", () => {
        const players = makeStandardPlayers(); // 5 alive => majority is 3
        const game = makeGame(makeState({ phase: "voting", round: 1, players }));

        const updated = resolveVote(game, "p5", ["p1", "p2", "p3"], ["p4"]);
        const state = getCurrentState(updated);
        expect(state.phase).toBe("day");

        const p5 = state.players.find((p) => p.id === "p5")!;
        expect(hasEffect(p5, "dead")).toBe(true);

        const execEntry = updated.history.find((e) => e.type === "execution");
        expect(execEntry).toBeDefined();
    });

    it("does not execute when vote fails", () => {
        const players = makeStandardPlayers(); // 5 alive => majority is 3
        const game = makeGame(makeState({ phase: "voting", round: 1, players }));

        const updated = resolveVote(game, "p5", ["p1"], ["p2", "p3", "p4"]);
        const state = getCurrentState(updated);
        expect(state.phase).toBe("day");

        const p5 = state.players.find((p) => p.id === "p5")!;
        expect(hasEffect(p5, "dead")).toBe(false);

        const execEntry = updated.history.find((e) => e.type === "execution");
        expect(execEntry).toBeUndefined();
    });

    it("tracks dead voter's used vote", () => {
        const players = makeStandardPlayers();
        // Kill p1 first
        players[0] = addEffectTo(players[0], "dead");
        const game = makeGame(makeState({ phase: "voting", round: 1, players }));

        // Dead player p1 votes for
        const updated = resolveVote(game, "p5", ["p1", "p2", "p3", "p4"], []);
        const state = getCurrentState(updated);

        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "used_dead_vote")).toBe(true);
    });
});

// ============================================================================
// EXECUTION TRACKING
// ============================================================================

describe("hasExecutionToday", () => {
    it("returns false when no execution happened", () => {
        const players = makeStandardPlayers();
        let game = makeGame(makeState({ phase: "day", round: 1, players }));
        game = addHistoryEntry(game, {
            type: "day_started",
            message: [{ type: "text", content: "day" }],
            data: { round: 1 },
        });

        expect(hasExecutionToday(game)).toBe(false);
    });

    it("returns true after an execution", () => {
        const players = makeStandardPlayers();
        let game = makeGame(makeState({ phase: "day", round: 1, players }));
        game = addHistoryEntry(game, {
            type: "day_started",
            message: [{ type: "text", content: "day" }],
            data: { round: 1 },
        });
        game = addHistoryEntry(game, {
            type: "execution",
            message: [{ type: "text", content: "exec" }],
            data: { playerId: "p5" },
        });

        expect(hasExecutionToday(game)).toBe(true);
    });
});

// ============================================================================
// MANUAL EFFECT MANAGEMENT
// ============================================================================

describe("manual effect management", () => {
    it("addEffectToPlayer adds an effect", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "day", round: 1, players }));

        const updated = addEffectToPlayer(game, "p1", "safe");
        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(true);
    });

    it("removeEffectFromPlayer removes an effect", () => {
        const players = makeStandardPlayers();
        players[0] = addEffectTo(players[0], "safe");
        const game = makeGame(makeState({ phase: "day", round: 1, players }));

        const updated = removeEffectFromPlayer(game, "p1", "safe");
        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(false);
    });
});
