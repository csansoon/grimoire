import { describe, it, expect, beforeEach } from "vitest";
import {
    checkWinCondition,
    checkEndOfDayWinConditions,
} from "../game";
import {
    makePlayer,
    makeState,
    makeStandardPlayers,
    addEffectTo,
    resetPlayerCounter,
    makeGameWithHistory,
} from "./helpers";

beforeEach(() => {
    resetPlayerCounter();
});

// ============================================================================
// CORE WIN CONDITIONS
// ============================================================================

describe("core win conditions", () => {
    it("returns 'townsfolk' when all demons are dead", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "washerwoman" }),
            makePlayer({ id: "p2", roleId: "chef" }),
            addEffectTo(makePlayer({ id: "p3", roleId: "imp" }), "dead"),
        ];
        const state = makeState({ phase: "day", round: 2, players });

        expect(checkWinCondition(state)).toBe("townsfolk");
    });

    it("returns 'demon' when 2 or fewer alive with a demon", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "imp" }),
            addEffectTo(makePlayer({ id: "p3", roleId: "washerwoman" }), "dead"),
            addEffectTo(makePlayer({ id: "p4", roleId: "chef" }), "dead"),
        ];
        const state = makeState({ phase: "day", round: 3, players });

        expect(checkWinCondition(state)).toBe("demon");
    });

    it("returns null during normal gameplay (demons alive, more than 2 players)", () => {
        const players = makeStandardPlayers(); // 5 players including imp
        const state = makeState({ phase: "day", round: 1, players });

        expect(checkWinCondition(state)).toBeNull();
    });

    it("returns 'demon' when exactly 2 alive and one is a demon", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "imp" }),
        ];
        const state = makeState({ phase: "day", round: 4, players });

        expect(checkWinCondition(state)).toBe("demon");
    });
});

// ============================================================================
// DYNAMIC WIN CONDITIONS — MARTYRDOM (Saint)
// ============================================================================

describe("Martyrdom win condition", () => {
    it("returns 'demon' when player with martyrdom is executed", () => {
        const saint = addEffectTo(
            makePlayer({ id: "p1", roleId: "saint" }),
            "martyrdom"
        );
        const players = [
            saint,
            makePlayer({ id: "p2", roleId: "washerwoman" }),
            makePlayer({ id: "p3", roleId: "chef" }),
            makePlayer({ id: "p4", roleId: "imp" }),
        ];
        const state = makeState({ phase: "day", round: 1, players });

        // Build a game where the last entry is an execution of the Saint
        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                { type: "day_started", data: { round: 1 } },
                {
                    type: "execution",
                    data: { playerId: "p1" },
                },
            ],
            state
        );

        expect(checkWinCondition(state, game)).toBe("demon");
    });

    it("returns null when executed player does NOT have martyrdom", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "washerwoman" }),
            makePlayer({ id: "p3", roleId: "chef" }),
            makePlayer({ id: "p4", roleId: "imp" }),
        ];
        const state = makeState({ phase: "day", round: 1, players });

        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                { type: "day_started", data: { round: 1 } },
                {
                    type: "execution",
                    data: { playerId: "p1" },
                },
            ],
            state
        );

        expect(checkWinCondition(state, game)).toBeNull();
    });

    it("returns 'demon' when virgin_execution kills player with martyrdom", () => {
        const saint = addEffectTo(
            makePlayer({ id: "p1", roleId: "saint" }),
            "martyrdom"
        );
        const players = [
            saint,
            makePlayer({ id: "p2", roleId: "virgin" }),
            makePlayer({ id: "p3", roleId: "chef" }),
            makePlayer({ id: "p4", roleId: "imp" }),
        ];
        const state = makeState({ phase: "day", round: 1, players });

        // Virgin execution — the nominator (p1, the saint) dies
        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                { type: "day_started", data: { round: 1 } },
                {
                    type: "virgin_execution",
                    data: { nominatorId: "p1", nomineeId: "p2" },
                },
            ],
            state
        );

        expect(checkWinCondition(state, game)).toBe("demon");
    });
});

// ============================================================================
// DYNAMIC WIN CONDITIONS — MAYOR PEACEFUL VICTORY
// ============================================================================

describe("Mayor peaceful victory", () => {
    it("returns 'townsfolk' with 3 alive, day phase, no execution, Mayor alive", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "mayor" }),
            makePlayer({ id: "p2", roleId: "villager" }),
            makePlayer({ id: "p3", roleId: "imp" }),
            addEffectTo(makePlayer({ id: "p4", roleId: "chef" }), "dead"),
            addEffectTo(makePlayer({ id: "p5", roleId: "washerwoman" }), "dead"),
        ];
        const state = makeState({ phase: "day", round: 3, players });

        // Game with day_started but no execution
        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                {
                    type: "day_started",
                    data: { round: 3 },
                    stateOverrides: { phase: "day" },
                },
            ],
            state
        );

        expect(checkEndOfDayWinConditions(state, game)).toBe("townsfolk");
    });

    it("returns null when execution happened today", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "mayor" }),
            makePlayer({ id: "p2", roleId: "villager" }),
            makePlayer({ id: "p3", roleId: "imp" }),
            addEffectTo(makePlayer({ id: "p4", roleId: "chef" }), "dead"),
            addEffectTo(makePlayer({ id: "p5", roleId: "washerwoman" }), "dead"),
        ];
        const state = makeState({ phase: "day", round: 3, players });

        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                {
                    type: "day_started",
                    data: { round: 3 },
                    stateOverrides: { phase: "day" },
                },
                {
                    type: "execution",
                    data: { playerId: "p4" },
                },
            ],
            state
        );

        expect(checkEndOfDayWinConditions(state, game)).toBeNull();
    });

    it("returns null when no Mayor is alive", () => {
        const players = [
            addEffectTo(makePlayer({ id: "p1", roleId: "mayor" }), "dead"),
            makePlayer({ id: "p2", roleId: "villager" }),
            makePlayer({ id: "p3", roleId: "imp" }),
            makePlayer({ id: "p4", roleId: "chef" }),
            addEffectTo(makePlayer({ id: "p5", roleId: "washerwoman" }), "dead"),
        ];
        const state = makeState({ phase: "day", round: 3, players });

        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                {
                    type: "day_started",
                    data: { round: 3 },
                    stateOverrides: { phase: "day" },
                },
            ],
            state
        );

        expect(checkEndOfDayWinConditions(state, game)).toBeNull();
    });

    it("returns null when 4 players are alive", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "mayor" }),
            makePlayer({ id: "p2", roleId: "villager" }),
            makePlayer({ id: "p3", roleId: "imp" }),
            makePlayer({ id: "p4", roleId: "chef" }),
            addEffectTo(makePlayer({ id: "p5", roleId: "washerwoman" }), "dead"),
        ];
        const state = makeState({ phase: "day", round: 2, players });

        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                {
                    type: "day_started",
                    data: { round: 2 },
                    stateOverrides: { phase: "day" },
                },
            ],
            state
        );

        expect(checkEndOfDayWinConditions(state, game)).toBeNull();
    });

    it("returns null when Mayor is dead even if 3 alive", () => {
        const players = [
            addEffectTo(makePlayer({ id: "p1", roleId: "mayor" }), "dead"),
            makePlayer({ id: "p2", roleId: "villager" }),
            makePlayer({ id: "p3", roleId: "imp" }),
            makePlayer({ id: "p4", roleId: "chef" }),
            addEffectTo(makePlayer({ id: "p5", roleId: "washerwoman" }), "dead"),
        ];
        const state = makeState({ phase: "day", round: 3, players });

        const game = makeGameWithHistory(
            [
                { type: "game_created" },
                {
                    type: "day_started",
                    data: { round: 3 },
                    stateOverrides: { phase: "day" },
                },
            ],
            state
        );

        expect(checkEndOfDayWinConditions(state, game)).toBeNull();
    });
});
