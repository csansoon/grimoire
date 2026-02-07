import { describe, it, expect, beforeEach } from "vitest";
import { resolveIntent } from "../pipeline";
import { getAvailableDayActions } from "../pipeline/index";
import { KillIntent, NominateIntent } from "../pipeline/types";
import {
    makePlayer,
    makeGame,
    makeState,
    addEffectTo,
    resetPlayerCounter,
} from "./helpers";

beforeEach(() => {
    resetPlayerCounter();
});

// ============================================================================
// SAFE EFFECT (kill protection)
// ============================================================================

describe("Safe effect", () => {
    it("prevents kill intent targeting the protected player", () => {
        const players = [
            addEffectTo(makePlayer({ id: "p1", roleId: "soldier" }), "safe"),
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
        if (result.type === "prevented") {
            // Should have a history entry recording the failed kill
            const failEntry = result.stateChanges.entries.find(
                (e) => e.data.action === "kill_failed"
            );
            expect(failEntry).toBeDefined();
            expect(failEntry!.data.reason).toBe("safe");
        }
    });

    it("does NOT prevent kill intent targeting a different player", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            addEffectTo(makePlayer({ id: "p2", roleId: "soldier" }), "safe"),
            makePlayer({ id: "p3", roleId: "imp" }),
        ];
        const state = makeState({ phase: "night", round: 2, players });
        const game = makeGame(state);

        const intent: KillIntent = {
            type: "kill",
            sourceId: "p3",
            targetId: "p1", // p1 has no safe
            cause: "demon",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("resolved");
        if (result.type === "resolved") {
            expect(result.stateChanges.addEffects?.["p1"]).toBeDefined();
            expect(result.stateChanges.addEffects!["p1"][0].type).toBe("dead");
        }
    });
});

// ============================================================================
// BOUNCE EFFECT (kill redirect)
// ============================================================================

describe("Bounce effect", () => {
    it("returns needs_input when kill targets player with bounce", () => {
        const players = [
            addEffectTo(makePlayer({ id: "p1", roleId: "mayor" }), "bounce"),
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
    });

    it("redirects kill to new target after resume", () => {
        const players = [
            addEffectTo(makePlayer({ id: "p1", roleId: "mayor" }), "bounce"),
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
            const afterResume = result.resume("p3");
            expect(afterResume.type).toBe("resolved");
            if (afterResume.type === "resolved") {
                // p3 gets dead effect, not p1
                expect(afterResume.stateChanges.addEffects?.["p3"]).toBeDefined();
                expect(afterResume.stateChanges.addEffects?.["p1"]).toBeUndefined();

                // Should have a redirect history entry
                const redirectEntry = afterResume.stateChanges.entries.find(
                    (e) => e.data.action === "kill_redirected"
                );
                expect(redirectEntry).toBeDefined();
                expect(redirectEntry!.data.originalTargetId).toBe("p1");
                expect(redirectEntry!.data.redirectTargetId).toBe("p3");
            }
        }
    });

    it("allows kill on original target if narrator chooses same target", () => {
        const players = [
            addEffectTo(makePlayer({ id: "p1", roleId: "mayor" }), "bounce"),
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
        expect(result.type).toBe("needs_input");
        if (result.type === "needs_input") {
            // Resume with the same target — no redirect
            const afterResume = result.resume("p1");
            expect(afterResume.type).toBe("resolved");
            if (afterResume.type === "resolved") {
                // p1 dies (default resolver applies)
                expect(afterResume.stateChanges.addEffects?.["p1"]).toBeDefined();
                expect(afterResume.stateChanges.addEffects!["p1"][0].type).toBe("dead");
            }
        }
    });

    it("bounce runs before safe (priority 5 < 10)", () => {
        // Bounce on p1, safe on p3 — kill bounces to p3, then safe prevents it
        const players = [
            addEffectTo(makePlayer({ id: "p1", roleId: "mayor" }), "bounce"),
            makePlayer({ id: "p2", roleId: "imp" }),
            addEffectTo(makePlayer({ id: "p3", roleId: "soldier" }), "safe"),
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
        expect(result.type).toBe("needs_input"); // Bounce fires first
        if (result.type === "needs_input") {
            const afterResume = result.resume("p3"); // Redirect to safe player
            expect(afterResume.type).toBe("prevented"); // Safe prevents it
        }
    });
});

// ============================================================================
// PURE EFFECT (Virgin nomination)
// ============================================================================

describe("Pure effect", () => {
    it("prevents nomination and kills townsfolk nominator", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "washerwoman" }), // townsfolk nominator
            addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure"),
            makePlayer({ id: "p3", roleId: "imp" }),
        ];
        const state = makeState({ phase: "day", round: 1, players });
        const game = makeGame(state);

        const intent: NominateIntent = {
            type: "nominate",
            nominatorId: "p1",
            nomineeId: "p2",
        };

        const result = resolveIntent(intent, state, game);
        expect(result.type).toBe("prevented");
        if (result.type === "prevented") {
            // Nominator (p1) gets dead effect
            expect(result.stateChanges.addEffects?.["p1"]).toBeDefined();
            expect(result.stateChanges.addEffects!["p1"][0].type).toBe("dead");

            // Pure effect removed from p2
            expect(result.stateChanges.removeEffects?.["p2"]).toContain("pure");

            // History entry for virgin execution
            const virginEntry = result.stateChanges.entries.find(
                (e) => e.type === "virgin_execution"
            );
            expect(virginEntry).toBeDefined();
        }
    });

    it("allows nomination but removes pure when non-townsfolk nominates", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "imp" }), // demon nominator
            addEffectTo(makePlayer({ id: "p2", roleId: "virgin" }), "pure"),
        ];
        const state = makeState({ phase: "day", round: 1, players });
        const game = makeGame(state);

        const intent: NominateIntent = {
            type: "nominate",
            nominatorId: "p1",
            nomineeId: "p2",
        };

        const result = resolveIntent(intent, state, game);
        // Should be resolved — nomination proceeds (allow + default resolver)
        expect(result.type).toBe("resolved");
        if (result.type === "resolved") {
            // Pure effect removed
            expect(result.stateChanges.removeEffects?.["p2"]).toContain("pure");
            // Nominator NOT killed
            expect(result.stateChanges.addEffects?.["p1"]).toBeUndefined();
            // Nomination entry from default resolver
            const nomEntry = result.stateChanges.entries.find(
                (e) => e.type === "nomination"
            );
            expect(nomEntry).toBeDefined();
        }
    });

    it("does not fire for player without pure effect", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "washerwoman" }),
            makePlayer({ id: "p2", roleId: "villager" }), // no pure effect
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
            expect(result.stateChanges.entries[0].type).toBe("nomination");
            expect(result.stateChanges.stateUpdates?.phase).toBe("voting");
        }
    });
});

// ============================================================================
// SLAYER BULLET DAY ACTION
// ============================================================================

describe("SlayerBullet day action", () => {
    it("condition is true when player is alive with slayer_bullet", () => {
        const player = addEffectTo(
            makePlayer({ id: "p1", roleId: "slayer" }),
            "slayer_bullet"
        );
        const state = makeState({ phase: "day", round: 1, players: [player] });

        const actions = getAvailableDayActions(state, {
            game: { slayerAction: "Slay", slayerActionDescription: "desc" },
        });
        expect(actions).toHaveLength(1);
        expect(actions[0].id).toContain("slayer_shot");
    });

    it("condition is false when player is dead", () => {
        let player = addEffectTo(
            makePlayer({ id: "p1", roleId: "slayer" }),
            "slayer_bullet"
        );
        player = addEffectTo(player, "dead");
        const state = makeState({ phase: "day", round: 1, players: [player] });

        const actions = getAvailableDayActions(state, {
            game: { slayerAction: "Slay", slayerActionDescription: "desc" },
        });
        expect(actions).toHaveLength(0);
    });

    it("condition is false when player lacks slayer_bullet", () => {
        const player = makePlayer({ id: "p1", roleId: "slayer" });
        const state = makeState({ phase: "day", round: 1, players: [player] });

        const actions = getAvailableDayActions(state, {
            game: { slayerAction: "Slay", slayerActionDescription: "desc" },
        });
        expect(actions).toHaveLength(0);
    });
});
