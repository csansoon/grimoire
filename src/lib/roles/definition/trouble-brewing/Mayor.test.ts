import { describe, it, expect, beforeEach } from "vitest";
import definition from "./Mayor";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGameWithHistory,
    resetPlayerCounter,
} from "../../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("Mayor", () => {
    // ================================================================
    // WIN CONDITION — Peaceful Victory
    // ================================================================

    describe("peaceful victory win condition", () => {
        const winCheck = definition.winConditions![0];

        it("good wins when exactly 3 alive, no execution today, and Mayor alive", () => {
            const players = [
                makePlayer({ id: "p1", roleId: "mayor" }),
                makePlayer({ id: "p2", roleId: "villager" }),
                makePlayer({ id: "p3", roleId: "imp" }),
            ];
            const state = makeState({ phase: "day", round: 2, players });
            const game = makeGameWithHistory(
                [{ type: "day_started", data: { round: 2 }, stateOverrides: { phase: "day", round: 2 } }],
                state
            );

            expect(winCheck.check(state, game)).toBe("townsfolk");
        });

        it("does not trigger when more than 3 alive", () => {
            const players = [
                makePlayer({ id: "p1", roleId: "mayor" }),
                makePlayer({ id: "p2", roleId: "villager" }),
                makePlayer({ id: "p3", roleId: "villager" }),
                makePlayer({ id: "p4", roleId: "imp" }),
            ];
            const state = makeState({ phase: "day", round: 2, players });
            const game = makeGameWithHistory(
                [{ type: "day_started", data: { round: 2 }, stateOverrides: { phase: "day", round: 2 } }],
                state
            );

            expect(winCheck.check(state, game)).toBeNull();
        });

        it("does not trigger when an execution happened today", () => {
            const players = [
                makePlayer({ id: "p1", roleId: "mayor" }),
                makePlayer({ id: "p2", roleId: "villager" }),
                makePlayer({ id: "p3", roleId: "imp" }),
            ];
            const state = makeState({ phase: "day", round: 2, players });
            const game = makeGameWithHistory(
                [
                    { type: "day_started", data: { round: 2 }, stateOverrides: { phase: "day", round: 2 } },
                    { type: "execution", data: { playerId: "p5" } },
                ],
                state
            );

            expect(winCheck.check(state, game)).toBeNull();
        });

        it("does not trigger when Mayor is dead", () => {
            const players = [
                addEffectTo(makePlayer({ id: "p1", roleId: "mayor" }), "dead"),
                makePlayer({ id: "p2", roleId: "villager" }),
                makePlayer({ id: "p3", roleId: "imp" }),
                makePlayer({ id: "p4", roleId: "villager" }),
            ];
            // Only 3 alive: p2, p3, p4 (Mayor is dead)
            const state = makeState({ phase: "day", round: 2, players });
            const game = makeGameWithHistory(
                [{ type: "day_started", data: { round: 2 }, stateOverrides: { phase: "day", round: 2 } }],
                state
            );

            expect(winCheck.check(state, game)).toBeNull();
        });

        it("does not trigger during night phase", () => {
            const players = [
                makePlayer({ id: "p1", roleId: "mayor" }),
                makePlayer({ id: "p2", roleId: "villager" }),
                makePlayer({ id: "p3", roleId: "imp" }),
            ];
            const state = makeState({ phase: "night", round: 2, players });
            const game = makeGameWithHistory(
                [{ type: "day_started", data: { round: 2 }, stateOverrides: { phase: "night", round: 2 } }],
                state
            );

            expect(winCheck.check(state, game)).toBeNull();
        });

        it("does not trigger when virgin_execution happened today", () => {
            const players = [
                makePlayer({ id: "p1", roleId: "mayor" }),
                makePlayer({ id: "p2", roleId: "villager" }),
                makePlayer({ id: "p3", roleId: "imp" }),
            ];
            const state = makeState({ phase: "day", round: 2, players });
            const game = makeGameWithHistory(
                [
                    { type: "day_started", data: { round: 2 }, stateOverrides: { phase: "day", round: 2 } },
                    { type: "virgin_execution", data: { nominatorId: "p5" } },
                ],
                state
            );

            expect(winCheck.check(state, game)).toBeNull();
        });
    });

    // ================================================================
    // BOUNCE (handled by Bounce effect — see Bounce.test.ts)
    // ================================================================

    describe("bounce ability", () => {
        it("declares bounce as an initial effect", () => {
            expect(definition.initialEffects).toBeDefined();
            expect(definition.initialEffects!.some((e) => e.type === "bounce")).toBe(true);
        });
    });
});
