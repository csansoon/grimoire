import { describe, it, expect, beforeEach } from "vitest";
import definition from "./SlayerBullet";
import { makePlayer, makeState, addEffectTo, resetPlayerCounter } from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("SlayerBullet effect", () => {
    const dayAction = definition.dayActions![0];

    // ================================================================
    // DAY ACTION CONDITION
    // ================================================================

    describe("day action condition", () => {
        it("available when player is alive and has the slayer_bullet effect", () => {
            const slayer = addEffectTo(makePlayer({ id: "p1", roleId: "slayer" }), "slayer_bullet");
            const state = makeState({ players: [slayer] });
            expect(dayAction.condition(slayer, state)).toBe(true);
        });

        it("not available when player is dead", () => {
            let slayer = addEffectTo(makePlayer({ id: "p1", roleId: "slayer" }), "slayer_bullet");
            slayer = addEffectTo(slayer, "dead");
            const state = makeState({ players: [slayer] });
            expect(dayAction.condition(slayer, state)).toBe(false);
        });

        it("not available when slayer_bullet has been removed (already used)", () => {
            // Player without slayer_bullet effect
            const slayer = makePlayer({ id: "p1", roleId: "slayer" });
            const state = makeState({ players: [slayer] });
            expect(dayAction.condition(slayer, state)).toBe(false);
        });
    });

    // ================================================================
    // DAY ACTION METADATA
    // ================================================================

    describe("day action metadata", () => {
        it("has a UI component for the action", () => {
            expect(dayAction.ActionComponent).toBeDefined();
        });
    });
});
