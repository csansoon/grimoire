import { describe, it, expect, beforeEach, vi } from "vitest";
import definition from "./Ravenkeeper";
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

describe("Ravenkeeper", () => {
    // ================================================================
    // SHOULD WAKE
    // ================================================================

    describe("shouldWake", () => {
        it("does not wake on the first night", () => {
            const player = makePlayer({ id: "p1", roleId: "ravenkeeper" });
            const game = makeGameWithHistory(
                [{ type: "night_started", data: { round: 1 }, stateOverrides: { round: 1 } }],
                makeState({ round: 1, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });

        it("does not wake if not killed this night", () => {
            const player = makePlayer({ id: "p1", roleId: "ravenkeeper" });
            const game = makeGameWithHistory(
                [
                    { type: "night_started", data: { round: 2 }, stateOverrides: { round: 2 } },
                ],
                makeState({ round: 2, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });

        it("wakes when killed this night (after round 1)", () => {
            const player = makePlayer({ id: "p1", roleId: "ravenkeeper" });
            const game = makeGameWithHistory(
                [
                    { type: "night_started", data: { round: 2 }, stateOverrides: { round: 2 } },
                    {
                        type: "night_action",
                        data: { action: "kill", targetId: "p1", roleId: "imp", playerId: "p2" },
                    },
                ],
                makeState({ round: 2, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(true);
        });

        it("does not wake if a different player was killed", () => {
            const player = makePlayer({ id: "p1", roleId: "ravenkeeper" });
            const game = makeGameWithHistory(
                [
                    { type: "night_started", data: { round: 2 }, stateOverrides: { round: 2 } },
                    {
                        type: "night_action",
                        data: { action: "kill", targetId: "p3", roleId: "imp", playerId: "p2" },
                    },
                ],
                makeState({ round: 2, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });
    });

    // ================================================================
    // PERCEPTION (Ravenkeeper sees selected player's perceived role)
    // ================================================================

    describe("perception of selected player", () => {
        it("sees actual role when no deception is active", () => {
            const rk = makePlayer({ id: "p1", roleId: "ravenkeeper" });
            const target = makePlayer({ id: "p2", roleId: "imp" });
            const state = makeState({ players: [rk, target] });

            const perception = perceive(target, rk, "role", state);
            expect(perception.roleId).toBe("imp");
            expect(perception.team).toBe("demon");
        });

        it("sees deceived role when target has role perception modifier", () => {
            testEffects["appears_as_chef"] = {
                id: "appears_as_chef" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "role",
                    modify: (p) => ({ ...p, roleId: "chef", team: "townsfolk" }),
                }],
            };

            const rk = makePlayer({ id: "p1", roleId: "ravenkeeper" });
            const target = addEffectTo(
                makePlayer({ id: "p2", roleId: "imp" }),
                "appears_as_chef"
            );
            const state = makeState({ players: [rk, target] });

            const perception = perceive(target, rk, "role", state);
            expect(perception.roleId).toBe("chef");      // deceived
            expect(perception.team).toBe("townsfolk");    // deceived
        });

        it("good player with demon-like role modifier appears as demon", () => {
            testEffects["appears_as_imp"] = {
                id: "appears_as_imp" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "role",
                    modify: (p) => ({ ...p, roleId: "imp", team: "demon" }),
                }],
            };

            const rk = makePlayer({ id: "p1", roleId: "ravenkeeper" });
            const recluse = addEffectTo(
                makePlayer({ id: "p2", roleId: "villager" }),
                "appears_as_imp"
            );
            const state = makeState({ players: [rk, recluse] });

            const perception = perceive(recluse, rk, "role", state);
            expect(perception.roleId).toBe("imp");
            expect(perception.team).toBe("demon");
        });
    });
});
