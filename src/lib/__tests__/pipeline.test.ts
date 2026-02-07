import { describe, it, expect, beforeEach } from "vitest";
import {
    resolveIntent,
    applyPipelineChanges,
    emptyStateChanges,
    mergeStateChanges,
} from "../pipeline";
import { KillIntent, NominateIntent, ExecuteIntent, StateChanges } from "../pipeline/types";
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
// DEFAULT RESOLVERS (no handlers active)
// ============================================================================

describe("default resolvers", () => {
    it("kill intent adds dead effect to target", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "imp" }),
        ];
        const state = makeState({ phase: "night", round: 2, players });
        const game = makeGame(state);

        const intent: KillIntent = {
            type: "kill",
            sourceId: "p2",
            targetId: "p1",
            cause: "demon",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("resolved");
        if (result.type === "resolved") {
            expect(result.stateChanges.addEffects?.["p1"]).toBeDefined();
            expect(result.stateChanges.addEffects!["p1"][0].type).toBe("dead");
        }
    });

    it("nominate intent creates nomination entry and transitions to voting", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "imp" }),
        ];
        const state = makeState({ phase: "day", round: 1, players });
        const game = makeGame(state);

        const intent: NominateIntent = {
            type: "nominate",
            nominatorId: "p1",
            nomineeId: "p2",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("resolved");
        if (result.type === "resolved") {
            expect(result.stateChanges.entries).toHaveLength(1);
            expect(result.stateChanges.entries[0].type).toBe("nomination");
            expect(result.stateChanges.stateUpdates?.phase).toBe("voting");
        }
    });

    it("execute intent creates execution entry and adds dead effect", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "imp" }),
        ];
        const state = makeState({ phase: "day", round: 1, players });
        const game = makeGame(state);

        const intent: ExecuteIntent = {
            type: "execute",
            playerId: "p1",
            cause: "execution",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("resolved");
        if (result.type === "resolved") {
            expect(result.stateChanges.entries[0].type).toBe("execution");
            expect(result.stateChanges.addEffects?.["p1"]).toBeDefined();
            expect(result.stateChanges.addEffects!["p1"][0].type).toBe("dead");
        }
    });
});

// ============================================================================
// HANDLER BEHAVIOR
// ============================================================================

describe("handler behavior", () => {
    it("allow handler merges stateChanges and continues", () => {
        // Safe effect on a player NOT targeted — handler doesn't apply, kill resolves
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            addEffectTo(
                makePlayer({ id: "p2", roleId: "soldier" }),
                "safe"
            ),
            makePlayer({ id: "p3", roleId: "imp" }),
        ];
        const state = makeState({ phase: "night", round: 2, players });
        const game = makeGame(state);

        const intent: KillIntent = {
            type: "kill",
            sourceId: "p3",
            targetId: "p1", // Not the safe player
            cause: "demon",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("resolved");
        if (result.type === "resolved") {
            expect(result.stateChanges.addEffects?.["p1"]).toBeDefined();
        }
    });

    it("prevent handler stops pipeline and returns prevented", () => {
        // Safe effect on the targeted player — kill is prevented
        const players = [
            addEffectTo(
                makePlayer({ id: "p1", roleId: "soldier" }),
                "safe"
            ),
            makePlayer({ id: "p2", roleId: "imp" }),
        ];
        const state = makeState({ phase: "night", round: 2, players });
        const game = makeGame(state);

        const intent: KillIntent = {
            type: "kill",
            sourceId: "p2",
            targetId: "p1",
            cause: "demon",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("prevented");
    });

    it("request_ui pauses pipeline and returns needs_input", () => {
        // Bounce effect on the targeted player — UI is requested
        const players = [
            addEffectTo(
                makePlayer({ id: "p1", roleId: "mayor" }),
                "bounce"
            ),
            makePlayer({ id: "p2", roleId: "imp" }),
            makePlayer({ id: "p3", roleId: "villager" }),
        ];
        const state = makeState({ phase: "night", round: 2, players });
        const game = makeGame(state);

        const intent: KillIntent = {
            type: "kill",
            sourceId: "p2",
            targetId: "p1",
            cause: "demon",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("needs_input");
        if (result.type === "needs_input") {
            expect(result.UIComponent).toBeDefined();
            expect(result.resume).toBeInstanceOf(Function);
        }
    });

    it("request_ui resume continues pipeline", () => {
        const players = [
            addEffectTo(
                makePlayer({ id: "p1", roleId: "mayor" }),
                "bounce"
            ),
            makePlayer({ id: "p2", roleId: "imp" }),
            makePlayer({ id: "p3", roleId: "villager" }),
        ];
        const state = makeState({ phase: "night", round: 2, players });
        const game = makeGame(state);

        const intent: KillIntent = {
            type: "kill",
            sourceId: "p2",
            targetId: "p1",
            cause: "demon",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("needs_input");
        if (result.type === "needs_input") {
            // Resume with redirect to p3
            const afterResume = result.resume("p3");
            expect(afterResume.type).toBe("resolved");
            if (afterResume.type === "resolved") {
                // p3 should get the dead effect, not p1
                expect(afterResume.stateChanges.addEffects?.["p3"]).toBeDefined();
                expect(afterResume.stateChanges.addEffects?.["p1"]).toBeUndefined();
            }
        }
    });

    it("redirect restarts pipeline with new intent", () => {
        // Bounce on p1, safe on p3 — kill bounces to p3, safe prevents it
        const players = [
            addEffectTo(
                makePlayer({ id: "p1", roleId: "mayor" }),
                "bounce"
            ),
            makePlayer({ id: "p2", roleId: "imp" }),
            addEffectTo(
                makePlayer({ id: "p3", roleId: "soldier" }),
                "safe"
            ),
        ];
        const state = makeState({ phase: "night", round: 2, players });
        const game = makeGame(state);

        const intent: KillIntent = {
            type: "kill",
            sourceId: "p2",
            targetId: "p1",
            cause: "demon",
        };

        // First: needs_input for bounce
        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("needs_input");
        if (result.type === "needs_input") {
            // Resume — redirect to p3 who has safe
            const afterResume = result.resume("p3");
            // Safe handler should prevent the redirected kill
            expect(afterResume.type).toBe("prevented");
        }
    });
});

// ============================================================================
// STATE CHANGES MERGING
// ============================================================================

describe("mergeStateChanges", () => {
    it("merges entries from both sources", () => {
        const a: StateChanges = {
            entries: [{ type: "night_action", message: [], data: { a: 1 } }],
        };
        const b: StateChanges = {
            entries: [{ type: "night_action", message: [], data: { b: 2 } }],
        };

        const merged = mergeStateChanges(a, b);
        expect(merged.entries).toHaveLength(2);
    });

    it("merges addEffects by combining player arrays", () => {
        const a: StateChanges = {
            entries: [],
            addEffects: { p1: [{ type: "safe" }] },
        };
        const b: StateChanges = {
            entries: [],
            addEffects: { p1: [{ type: "dead" }], p2: [{ type: "safe" }] },
        };

        const merged = mergeStateChanges(a, b);
        expect(merged.addEffects!["p1"]).toHaveLength(2);
        expect(merged.addEffects!["p2"]).toHaveLength(1);
    });

    it("merges removeEffects by combining arrays", () => {
        const a: StateChanges = {
            entries: [],
            removeEffects: { p1: ["safe"] },
        };
        const b: StateChanges = {
            entries: [],
            removeEffects: { p1: ["pure"], p2: ["bounce"] },
        };

        const merged = mergeStateChanges(a, b);
        expect(merged.removeEffects!["p1"]).toEqual(["safe", "pure"]);
        expect(merged.removeEffects!["p2"]).toEqual(["bounce"]);
    });

    it("returns target unchanged when source is undefined", () => {
        const a: StateChanges = {
            entries: [{ type: "night_action", message: [], data: {} }],
        };

        const merged = mergeStateChanges(a, undefined);
        expect(merged).toBe(a);
    });
});

// ============================================================================
// APPLY PIPELINE CHANGES
// ============================================================================

describe("applyPipelineChanges", () => {
    it("applies entries as history entries", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const changes: StateChanges = {
            entries: [
                {
                    type: "night_action",
                    message: [{ type: "text", content: "killed" }],
                    data: { action: "kill" },
                },
            ],
            addEffects: { p1: [{ type: "dead", expiresAt: "never" }] },
        };

        const updated = applyPipelineChanges(game, changes);
        expect(updated.history).toHaveLength(2);

        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "dead")).toBe(true);
    });

    it("handles no entries but has effect changes", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const changes: StateChanges = {
            entries: [],
            addEffects: { p1: [{ type: "safe", expiresAt: "end_of_night" }] },
        };

        const updated = applyPipelineChanges(game, changes);
        // No new entry added, but last entry's stateAfter should be updated
        expect(updated.history).toHaveLength(1);

        const state = getCurrentState(updated);
        const p1 = state.players.find((p) => p.id === "p1")!;
        expect(hasEffect(p1, "safe")).toBe(true);
    });

    it("returns game unchanged when changes are empty", () => {
        const players = makeStandardPlayers();
        const game = makeGame(makeState({ phase: "night", round: 1, players }));

        const updated = applyPipelineChanges(game, emptyStateChanges());
        expect(updated).toBe(game);
    });
});
