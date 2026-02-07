import { describe, it, expect, beforeEach } from "vitest";
import definition from "./Bounce";
import { KillIntent } from "../../pipeline/types";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGame,
    resetPlayerCounter,
} from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("Bounce effect", () => {
    const handler = definition.handlers![0];

    // ================================================================
    // HANDLER — APPLIES TO
    // ================================================================

    describe("appliesTo", () => {
        it("applies when the kill targets the player with bounce", () => {
            const mayor = addEffectTo(makePlayer({ id: "p2", roleId: "mayor" }), "bounce");
            const state = makeState({ players: [mayor] });
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            expect(handler.appliesTo(intent, mayor, state)).toBe(true);
        });

        it("does not apply when a different player is targeted", () => {
            const mayor = addEffectTo(makePlayer({ id: "p2", roleId: "mayor" }), "bounce");
            const state = makeState({ players: [mayor] });
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p3", cause: "demon" };

            expect(handler.appliesTo(intent, mayor, state)).toBe(false);
        });
    });

    // ================================================================
    // HANDLER — REQUEST UI FOR REDIRECT
    // ================================================================

    describe("handle", () => {
        it("requests UI (narrator chooses redirect target)", () => {
            const mayor = addEffectTo(makePlayer({ id: "p2", roleId: "mayor" }), "bounce");
            const state = makeState({ players: [mayor] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, mayor, state, game);
            expect(result.action).toBe("request_ui");
        });

        it("provides a resume function", () => {
            const mayor = addEffectTo(makePlayer({ id: "p2", roleId: "mayor" }), "bounce");
            const state = makeState({ players: [mayor] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, mayor, state, game);
            if (result.action === "request_ui") {
                expect(result.resume).toBeDefined();
                expect(typeof result.resume).toBe("function");
            }
        });
    });

    // ================================================================
    // RESUME — REDIRECT TO DIFFERENT TARGET
    // ================================================================

    describe("resume (redirect)", () => {
        it("redirects the kill to a new target", () => {
            const mayor = addEffectTo(makePlayer({ id: "p2", roleId: "mayor" }), "bounce");
            const state = makeState({ players: [mayor] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, mayor, state, game);
            if (result.action === "request_ui") {
                const resumed = result.resume!("p3"); // narrator chose p3
                expect(resumed.action).toBe("redirect");
                if (resumed.action === "redirect") {
                    expect((resumed.newIntent as KillIntent).targetId).toBe("p3");
                }
            }
        });

        it("generates a redirect history entry", () => {
            const mayor = addEffectTo(makePlayer({ id: "p2", roleId: "mayor" }), "bounce");
            const state = makeState({ players: [mayor] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, mayor, state, game);
            if (result.action === "request_ui") {
                const resumed = result.resume!("p3");
                expect(resumed.stateChanges?.entries).toHaveLength(1);
                expect(resumed.stateChanges!.entries![0].data.action).toBe("kill_redirected");
                expect(resumed.stateChanges!.entries![0].data.originalTargetId).toBe("p2");
                expect(resumed.stateChanges!.entries![0].data.redirectTargetId).toBe("p3");
            }
        });
    });

    // ================================================================
    // RESUME — SAME TARGET (narrator ignores bounce)
    // ================================================================

    describe("resume (same target)", () => {
        it("allows the kill if narrator selects the original target", () => {
            const mayor = addEffectTo(makePlayer({ id: "p2", roleId: "mayor" }), "bounce");
            const state = makeState({ players: [mayor] });
            const game = makeGame(state);
            const intent: KillIntent = { type: "kill", sourceId: "p1", targetId: "p2", cause: "demon" };

            const result = handler.handle(intent, mayor, state, game);
            if (result.action === "request_ui") {
                const resumed = result.resume!("p2"); // same target
                expect(resumed.action).toBe("allow");
            }
        });
    });

    // ================================================================
    // PRIORITY
    // ================================================================

    describe("priority", () => {
        it("has lower priority than safe (runs before safe)", () => {
            // Bounce priority 5, Safe priority 10 — lower number runs first
            expect(handler.priority).toBe(5);
        });
    });
});
