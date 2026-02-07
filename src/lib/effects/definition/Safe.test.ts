import { describe, it, expect, beforeEach } from "vitest";
import definition from "./Safe";
import { KillIntent } from "../../pipeline/types";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGame,
    resetPlayerCounter,
} from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("Safe effect", () => {
    const handler = definition.handlers![0];

    // ================================================================
    // HANDLER — APPLIES TO
    // ================================================================

    describe("appliesTo", () => {
        it("applies when the kill targets the protected player", () => {
            const protectedPlayer = addEffectTo(makePlayer({ id: "p2", roleId: "villager" }), "safe");
            const state = makeState({ players: [protectedPlayer] });
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            expect(handler.appliesTo(intent, protectedPlayer, state)).toBe(true);
        });

        it("does not apply when the kill targets a different player", () => {
            const protectedPlayer = addEffectTo(makePlayer({ id: "p2", roleId: "villager" }), "safe");
            const state = makeState({ players: [protectedPlayer] });
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p3", cause: "demon" };

            expect(handler.appliesTo(intent, protectedPlayer, state)).toBe(false);
        });
    });

    // ================================================================
    // HANDLER — PREVENTION
    // ================================================================

    describe("handle", () => {
        it("prevents the kill", () => {
            const protectedPlayer = addEffectTo(makePlayer({ id: "p2", roleId: "villager" }), "safe");
            const state = makeState({ players: [protectedPlayer] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, protectedPlayer, state, game);
            expect(result.action).toBe("prevent");
        });

        it("provides reason 'protected'", () => {
            const protectedPlayer = addEffectTo(makePlayer({ id: "p2", roleId: "villager" }), "safe");
            const state = makeState({ players: [protectedPlayer] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, protectedPlayer, state, game);
            if (result.action === "prevent") {
                expect(result.reason).toBe("protected");
            }
        });

        it("generates a history entry about the failed kill", () => {
            const protectedPlayer = addEffectTo(makePlayer({ id: "p2", roleId: "villager" }), "safe");
            const state = makeState({ players: [protectedPlayer] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, protectedPlayer, state, game);
            expect(result.stateChanges?.entries).toHaveLength(1);
            expect(result.stateChanges!.entries![0].data.reason).toBe("safe");
            expect(result.stateChanges!.entries![0].data.targetId).toBe("p2");
        });
    });
});
