import { describe, it, expect, beforeEach } from "vitest";
import definition from "./UsedDeadVote";
import { makePlayer, resetPlayerCounter } from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("UsedDeadVote effect", () => {
    describe("canVote", () => {
        it("always returns false (no more votes allowed)", () => {
            const player = makePlayer({ id: "p1" });
            expect(definition.canVote!(player)).toBe(false);
        });
    });

    describe("behavior flags", () => {
        it("prevents voting", () => {
            expect(definition.preventsVoting).toBe(true);
        });
    });
});
