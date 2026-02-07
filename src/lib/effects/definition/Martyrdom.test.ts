import { describe, it, expect, beforeEach } from "vitest";
import definition from "./Martyrdom";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGameWithHistory,
    resetPlayerCounter,
} from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("Martyrdom effect", () => {
    const winCondition = definition.winConditions![0];

    // ================================================================
    // WIN CONDITION — EXECUTION OF SAINT
    // ================================================================

    describe("win condition (after_execution)", () => {
        it("evil wins when the player with martyrdom is executed", () => {
            const saint = addEffectTo(makePlayer({ id: "p1", roleId: "saint" }), "martyrdom");
            const state = makeState({ phase: "day", round: 2, players: [saint] });
            const game = makeGameWithHistory(
                [{ type: "execution", data: { playerId: "p1" } }],
                state
            );

            expect(winCondition.check(state, game)).toBe("demon");
        });

        it("does not trigger when a different player is executed", () => {
            const saint = addEffectTo(makePlayer({ id: "p1", roleId: "saint" }), "martyrdom");
            const villager = makePlayer({ id: "p2", roleId: "villager" });
            const state = makeState({ phase: "day", round: 2, players: [saint, villager] });
            const game = makeGameWithHistory(
                [{ type: "execution", data: { playerId: "p2" } }],
                state
            );

            expect(winCondition.check(state, game)).toBeNull();
        });

        it("triggers on virgin_execution if the executed nominator has martyrdom", () => {
            // Edge case: if somehow a player with martyrdom nominates a virgin and dies
            const saintNominator = addEffectTo(makePlayer({ id: "p1", roleId: "saint" }), "martyrdom");
            const state = makeState({ phase: "day", round: 2, players: [saintNominator] });
            const game = makeGameWithHistory(
                [{ type: "virgin_execution", data: { nominatorId: "p1", nomineeId: "p2" } }],
                state
            );

            expect(winCondition.check(state, game)).toBe("demon");
        });

        it("does not trigger when the last event is not an execution", () => {
            const saint = addEffectTo(makePlayer({ id: "p1", roleId: "saint" }), "martyrdom");
            const state = makeState({ phase: "day", round: 2, players: [saint] });
            const game = makeGameWithHistory(
                [{ type: "day_started", data: { round: 2 } }],
                state
            );

            expect(winCondition.check(state, game)).toBeNull();
        });
    });
});
