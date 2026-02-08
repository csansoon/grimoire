import { describe, it, expect, beforeEach } from "vitest";
import definition from "./Pure";
import { NominateIntent } from "../../pipeline/types";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGame,
    resetPlayerCounter,
} from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("Pure effect", () => {
    const handler = definition.handlers![0];

    // ================================================================
    // HANDLER — APPLIES TO
    // ================================================================

    describe("appliesTo", () => {
        it("applies when the nominee is the player with the pure effect", () => {
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ players: [virgin] });
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            expect(handler.appliesTo(intent, virgin, state)).toBe(true);
        });

        it("does not apply when a different player is nominated", () => {
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ players: [virgin] });
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p3" };

            expect(handler.appliesTo(intent, virgin, state)).toBe(false);
        });
    });

    // ================================================================
    // HANDLER — TOWNSFOLK NOMINATOR (kill & prevent)
    // ================================================================

    describe("townsfolk nominates virgin", () => {
        it("prevents the nomination", () => {
            const nominator = makePlayer({ id: "p1", roleId: "washerwoman" }); // townsfolk
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            expect(result.action).toBe("prevent");
        });

        it("kills the townsfolk nominator (adds dead effect)", () => {
            const nominator = makePlayer({ id: "p1", roleId: "washerwoman" });
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            if (result.action === "prevent") {
                expect(result.stateChanges?.addEffects?.["p1"]).toBeDefined();
                expect(result.stateChanges!.addEffects!["p1"][0].type).toBe("dead");
            }
        });

        it("removes the pure effect from the virgin", () => {
            const nominator = makePlayer({ id: "p1", roleId: "washerwoman" });
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            if (result.action === "prevent") {
                expect(result.stateChanges?.removeEffects?.["p2"]).toContain("pure");
            }
        });

        it("generates a virgin_execution history entry", () => {
            const nominator = makePlayer({ id: "p1", roleId: "washerwoman" });
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            if (result.action === "prevent") {
                expect(result.stateChanges?.entries?.[0].type).toBe("virgin_execution");
            }
        });
    });

    // ================================================================
    // HANDLER — NON-TOWNSFOLK NOMINATOR (allow, spend purity)
    // ================================================================

    describe("non-townsfolk nominates virgin", () => {
        it("allows the nomination to proceed", () => {
            const nominator = makePlayer({ id: "p1", roleId: "imp" }); // demon
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            expect(result.action).toBe("allow");
        });

        it("removes the pure effect (purity spent)", () => {
            const nominator = makePlayer({ id: "p1", roleId: "imp" });
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            if (result.action === "allow") {
                expect(result.stateChanges?.removeEffects?.["p2"]).toContain("pure");
            }
        });

        it("does not kill the nominator", () => {
            const nominator = makePlayer({ id: "p1", roleId: "imp" });
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            if (result.action === "allow") {
                expect(result.stateChanges?.addEffects?.["p1"]).toBeUndefined();
            }
        });

        it("generates a virgin_spent history entry", () => {
            const nominator = makePlayer({ id: "p1", roleId: "imp" });
            const virgin = addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure");
            const state = makeState({ phase: "day", round: 1, players: [nominator, virgin] });
            const game = makeGame(state);
            const intent: NominateIntent = { type: "nominate", nominatorId: "p1", nomineeId: "p2" };

            const result = handler.handle(intent, virgin, state, game);
            if (result.action === "allow") {
                expect(result.stateChanges?.entries?.[0].type).toBe("virgin_spent");
            }
        });
    });
});
