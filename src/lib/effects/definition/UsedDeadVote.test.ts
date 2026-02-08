import { describe, it, expect, beforeEach } from "vitest";
import definition from "./UsedDeadVote";
import { makePlayer, makeState, resetPlayerCounter } from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("UsedDeadVote effect", () => {
    describe("canVote", () => {
        it("always returns false (no more votes allowed)", () => {
            const player = makePlayer({ id: "p1" });
            const state = makeState({ players: [player] });
            expect(definition.canVote!(player, state)).toBe(false);
        });
    });

    describe("behavior flags", () => {
        it("prevents voting", () => {
            expect(definition.preventsVoting).toBe(true);
        });
    });
});
