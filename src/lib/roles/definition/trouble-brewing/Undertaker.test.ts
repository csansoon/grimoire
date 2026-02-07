import { describe, it, expect, beforeEach, vi } from "vitest";
import definition from "./Undertaker";
import { perceive } from "../../../pipeline/perception";
import { EffectDefinition, EffectId } from "../../../effects/types";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGameWithHistory,
    resetPlayerCounter,
} from "../../../__tests__/helpers";

vi.mock("../../../effects", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        getEffect: (effectId: string) => {
            if (testEffects[effectId]) return testEffects[effectId];
            return (actual.getEffect as (id: string) => EffectDefinition | undefined)(effectId);
        },
    };
});

const testEffects: Record<string, EffectDefinition> = {};

beforeEach(() => {
    resetPlayerCounter();
    for (const key of Object.keys(testEffects)) delete testEffects[key];
});

describe("Undertaker", () => {
    // ================================================================
    // SHOULD WAKE
    // ================================================================

    describe("shouldWake", () => {
        it("does not wake on the first night", () => {
            const player = makePlayer({ id: "p1", roleId: "undertaker" });
            const game = makeGameWithHistory(
                [{ type: "night_started", data: { round: 1 }, stateOverrides: { round: 1 } }],
                makeState({ round: 1, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });

        it("does not wake when dead", () => {
            const player = addEffectTo(makePlayer({ id: "p1", roleId: "undertaker" }), "dead");
            const game = makeGameWithHistory(
                [
                    { type: "day_started", data: { round: 2 }, stateOverrides: { round: 2, phase: "day" } },
                    { type: "execution", data: { playerId: "p2" } },
                    { type: "night_started", data: { round: 2 }, stateOverrides: { phase: "night" } },
                ],
                makeState({ round: 2, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });

        it("does not wake if no execution happened", () => {
            const player = makePlayer({ id: "p1", roleId: "undertaker" });
            const game = makeGameWithHistory(
                [
                    { type: "day_started", data: { round: 2 }, stateOverrides: { round: 2, phase: "day" } },
                    { type: "night_started", data: { round: 2 }, stateOverrides: { phase: "night" } },
                ],
                makeState({ round: 2, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });

        it("wakes when alive, after first night, and execution occurred", () => {
            const player = makePlayer({ id: "p1", roleId: "undertaker" });
            const game = makeGameWithHistory(
                [
                    { type: "day_started", data: { round: 2 }, stateOverrides: { round: 2, phase: "day" } },
                    { type: "execution", data: { playerId: "p2" } },
                    { type: "night_started", data: { round: 2 }, stateOverrides: { phase: "night" } },
                ],
                makeState({ round: 2, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(true);
        });
    });

    // ================================================================
    // PERCEPTION (Undertaker sees the executed player's perceived role)
    // ================================================================

    describe("perception of executed player", () => {
        it("sees the actual role when no deception is active", () => {
            const undertaker = makePlayer({ id: "p1", roleId: "undertaker" });
            const executed = makePlayer({ id: "p2", roleId: "imp" });
            const state = makeState({ players: [undertaker, executed] });

            const perception = perceive(executed, undertaker, "role", state);
            expect(perception.roleId).toBe("imp");
            expect(perception.team).toBe("demon");
        });

        it("sees deceived role when target has role perception modifier", () => {
            testEffects["appears_as_villager"] = {
                id: "appears_as_villager" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "role",
                    modify: (p) => ({ ...p, roleId: "villager", team: "townsfolk" }),
                }],
            };

            const undertaker = makePlayer({ id: "p1", roleId: "undertaker" });
            const executed = addEffectTo(
                makePlayer({ id: "p2", roleId: "imp" }),
                "appears_as_villager"
            );
            const state = makeState({ players: [undertaker, executed] });

            const perception = perceive(executed, undertaker, "role", state);
            expect(perception.roleId).toBe("villager"); // deceived
            expect(perception.team).toBe("townsfolk");  // deceived
        });
    });
});
