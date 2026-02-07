import { describe, it, expect, beforeEach } from "vitest";
import definition from "./ScarletWoman";
import { KillIntent, ExecuteIntent } from "../../pipeline/types";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGame,
    resetPlayerCounter,
} from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("ScarletWoman effect", () => {
    const handler = definition.handlers![0];

    // Helper to create a standard 5+ player state with an alive SW
    function makeScenario(overrides?: {
        aliveCount?: number;
        swDead?: boolean;
        targetRole?: string;
    }) {
        const { aliveCount = 6, swDead = false, targetRole = "imp" } = overrides ?? {};

        const demon = makePlayer({ id: "demon", roleId: targetRole });
        let sw = makePlayer({ id: "sw", roleId: "scarlet_woman" });
        sw = addEffectTo(sw, "scarlet_woman");
        if (swDead) {
            sw = addEffectTo(sw, "dead");
        }

        const others: ReturnType<typeof makePlayer>[] = [];
        // Need enough alive players (demon + sw + others = aliveCount)
        const othersNeeded = aliveCount - (swDead ? 1 : 2); // demon is alive, sw may or may not be
        for (let i = 0; i < othersNeeded; i++) {
            others.push(makePlayer({ id: `p${i}`, roleId: "villager" }));
        }

        const state = makeState({
            phase: "day",
            round: 2,
            players: [demon, sw, ...others],
        });
        const game = makeGame(state);

        return { demon, sw, state, game };
    }

    // ================================================================
    // HANDLER — APPLIES TO
    // ================================================================

    describe("appliesTo", () => {
        it("applies when the Demon is executed and 5+ players are alive", () => {
            const { sw, state } = makeScenario({ aliveCount: 6 });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            expect(handler.appliesTo(intent, sw, state)).toBe(true);
        });

        it("applies when the Demon is killed and 5+ players are alive", () => {
            const { sw, state } = makeScenario({ aliveCount: 6 });
            const intent: KillIntent = { type: "kill", sourceId: "demon", targetId: "demon", cause: "demon" };

            expect(handler.appliesTo(intent, sw, state)).toBe(true);
        });

        it("applies with exactly 5 alive players", () => {
            const { sw, state } = makeScenario({ aliveCount: 5 });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            expect(handler.appliesTo(intent, sw, state)).toBe(true);
        });

        it("does not apply when fewer than 5 players are alive", () => {
            const { sw, state } = makeScenario({ aliveCount: 4 });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            expect(handler.appliesTo(intent, sw, state)).toBe(false);
        });

        it("does not apply when the target is not a Demon", () => {
            const villager = makePlayer({ id: "victim", roleId: "villager" });
            let sw = makePlayer({ id: "sw", roleId: "scarlet_woman" });
            sw = addEffectTo(sw, "scarlet_woman");
            const others = Array.from({ length: 4 }, (_, i) =>
                makePlayer({ id: `p${i}`, roleId: "villager" })
            );
            const state = makeState({
                phase: "day",
                round: 2,
                players: [villager, sw, ...others],
            });
            const intent: ExecuteIntent = { type: "execute", playerId: "victim", cause: "execution" };

            expect(handler.appliesTo(intent, sw, state)).toBe(false);
        });

        it("does not apply when the Scarlet Woman is dead", () => {
            const { sw, state } = makeScenario({ aliveCount: 6, swDead: true });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            expect(handler.appliesTo(intent, sw, state)).toBe(false);
        });

        it("does not apply when the Scarlet Woman is the target", () => {
            // Edge case: if the SW somehow becomes a Demon and is killed
            let swDemon = makePlayer({ id: "sw", roleId: "imp" });
            swDemon = addEffectTo(swDemon, "scarlet_woman");
            const others = Array.from({ length: 5 }, (_, i) =>
                makePlayer({ id: `p${i}`, roleId: "villager" })
            );
            const state = makeState({
                phase: "day",
                round: 2,
                players: [swDemon, ...others],
            });
            const intent: ExecuteIntent = { type: "execute", playerId: "sw", cause: "execution" };

            expect(handler.appliesTo(intent, swDemon, state)).toBe(false);
        });
    });

    // ================================================================
    // HANDLER — HANDLE
    // ================================================================

    describe("handle", () => {
        it("allows the kill/execution to proceed", () => {
            const { sw, state, game } = makeScenario({ aliveCount: 6 });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            const result = handler.handle(intent, sw, state, game);
            expect(result.action).toBe("allow");
        });

        it("changes the Scarlet Woman's role to the Demon's role", () => {
            const { sw, state, game } = makeScenario({ aliveCount: 6 });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            const result = handler.handle(intent, sw, state, game);
            expect(result.stateChanges?.changeRoles).toEqual({ sw: "imp" });
        });

        it("removes the scarlet_woman effect", () => {
            const { sw, state, game } = makeScenario({ aliveCount: 6 });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            const result = handler.handle(intent, sw, state, game);
            expect(result.stateChanges?.removeEffects).toEqual({ sw: ["scarlet_woman"] });
        });

        it("generates a role_changed history entry", () => {
            const { sw, state, game } = makeScenario({ aliveCount: 6 });
            const intent: ExecuteIntent = { type: "execute", playerId: "demon", cause: "execution" };

            const result = handler.handle(intent, sw, state, game);
            expect(result.stateChanges?.entries).toHaveLength(1);
            expect(result.stateChanges!.entries[0].type).toBe("role_changed");
            expect(result.stateChanges!.entries[0].data).toEqual({
                playerId: "sw",
                fromRole: "scarlet_woman",
                toRole: "imp",
            });
        });

        it("inherits the specific Demon role (not hardcoded to imp)", () => {
            // If there were a different demon type, SW should become that
            const { sw, state, game } = makeScenario({
                aliveCount: 6,
                targetRole: "imp", // Currently only imp exists, but the handler is generic
            });
            const intent: KillIntent = { type: "kill", sourceId: "demon", targetId: "demon", cause: "demon" };

            const result = handler.handle(intent, sw, state, game);
            expect(result.stateChanges?.changeRoles?.sw).toBe("imp");
        });

        it("works for kill intents (Imp self-kill)", () => {
            const { sw, state, game } = makeScenario({ aliveCount: 6 });
            const intent: KillIntent = { type: "kill", sourceId: "demon", targetId: "demon", cause: "demon" };

            const result = handler.handle(intent, sw, state, game);
            expect(result.action).toBe("allow");
            expect(result.stateChanges?.changeRoles).toEqual({ sw: "imp" });
        });
    });
});
