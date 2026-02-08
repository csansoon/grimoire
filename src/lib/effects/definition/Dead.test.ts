import { describe, it, expect, beforeEach } from "vitest";
import definition from "./Dead";
import { makePlayer, makeState, addEffectTo, resetPlayerCounter } from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("Dead effect", () => {
    // ================================================================
    // BEHAVIOR FLAGS
    // ================================================================

    describe("behavior flags", () => {
        it("prevents night wake", () => {
            expect(definition.preventsNightWake).toBe(true);
        });

        it("prevents voting by default", () => {
            expect(definition.preventsVoting).toBe(true);
        });

        it("prevents nomination", () => {
            expect(definition.preventsNomination).toBe(true);
        });
    });

    // ================================================================
    // DEAD VOTE MECHANIC
    // ================================================================

    describe("canVote", () => {
        it("dead player can vote once (no used_dead_vote yet)", () => {
            const player = addEffectTo(makePlayer({ id: "p1" }), "dead");
            const state = makeState({ players: [player] });
            expect(definition.canVote!(player, state)).toBe(true);
        });

        it("dead player cannot vote after using dead vote", () => {
            let player = addEffectTo(makePlayer({ id: "p1" }), "dead");
            player = addEffectTo(player, "used_dead_vote");
            const state = makeState({ players: [player] });
            expect(definition.canVote!(player, state)).toBe(false);
        });
    });

    // ================================================================
    // CAN NOMINATE
    // ================================================================

    describe("canNominate", () => {
        it("dead player can never nominate", () => {
            const player = addEffectTo(makePlayer({ id: "p1" }), "dead");
            const state = makeState({ players: [player] });
            expect(definition.canNominate!(player, state)).toBe(false);
        });
    });
});
