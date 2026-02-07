import { describe, it, expect, beforeEach, vi } from "vitest";
import definition from "./Empath";
import { perceive } from "../../../pipeline/perception";
import { getAliveNeighbors } from "../../../types";
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

describe("Empath", () => {
    // ================================================================
    // SHOULD WAKE
    // ================================================================

    describe("shouldWake", () => {
        it("wakes every night when alive (not just first night)", () => {
            const player = makePlayer({ id: "p1", roleId: "empath" });
            const round1 = makeGameWithHistory(
                [{ type: "night_started", data: { round: 1 }, stateOverrides: { round: 1 } }],
                makeState({ round: 1, players: [player] })
            );
            const round3 = makeGameWithHistory(
                [{ type: "night_started", data: { round: 3 }, stateOverrides: { round: 3 } }],
                makeState({ round: 3, players: [player] })
            );

            expect(definition.shouldWake!(round1, player)).toBe(true);
            expect(definition.shouldWake!(round3, player)).toBe(true);
        });

        it("does not wake when dead", () => {
            const player = addEffectTo(makePlayer({ id: "p1", roleId: "empath" }), "dead");
            const game = makeGameWithHistory(
                [{ type: "night_started", data: { round: 2 }, stateOverrides: { round: 2 } }],
                makeState({ round: 2, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });
    });

    // ================================================================
    // NEIGHBOR DETECTION
    // ================================================================

    describe("neighbor detection", () => {
        it("finds alive neighbors in seating order", () => {
            const state = makeState({
                players: [
                    makePlayer({ id: "p1", roleId: "villager" }),
                    makePlayer({ id: "p2", roleId: "empath" }),
                    makePlayer({ id: "p3", roleId: "imp" }),
                ],
            });
            const [left, right] = getAliveNeighbors(state, "p2");
            expect(left?.id).toBe("p1");
            expect(right?.id).toBe("p3");
        });

        it("skips dead players when finding neighbors", () => {
            const state = makeState({
                players: [
                    makePlayer({ id: "p1", roleId: "villager" }),
                    addEffectTo(makePlayer({ id: "p2", roleId: "monk" }), "dead"),
                    makePlayer({ id: "p3", roleId: "empath" }),
                    addEffectTo(makePlayer({ id: "p4", roleId: "chef" }), "dead"),
                    makePlayer({ id: "p5", roleId: "imp" }),
                ],
            });
            const [left, right] = getAliveNeighbors(state, "p3");
            expect(left?.id).toBe("p1");  // skips dead p2
            expect(right?.id).toBe("p5"); // skips dead p4
        });

        it("wraps around circularly", () => {
            const state = makeState({
                players: [
                    makePlayer({ id: "p1", roleId: "empath" }),
                    makePlayer({ id: "p2", roleId: "villager" }),
                    makePlayer({ id: "p3", roleId: "imp" }),
                ],
            });
            const [left, right] = getAliveNeighbors(state, "p1");
            expect(left?.id).toBe("p3");  // wraps
            expect(right?.id).toBe("p2");
        });
    });

    // ================================================================
    // PERCEPTION DECEPTION
    // ================================================================

    describe("perception deception", () => {
        it("evil neighbor appearing good → Empath sees 0", () => {
            testEffects["appears_good"] = {
                id: "appears_good" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "alignment",
                    modify: (p) => ({ ...p, alignment: "good" }),
                }],
            };

            const empath = makePlayer({ id: "p2", roleId: "empath" });
            const evilNeighbor = addEffectTo(
                makePlayer({ id: "p3", roleId: "imp" }),
                "appears_good"
            );
            const state = makeState({
                players: [
                    makePlayer({ id: "p1", roleId: "villager" }),
                    empath,
                    evilNeighbor,
                ],
            });

            const [, right] = getAliveNeighbors(state, "p2");
            expect(right?.id).toBe("p3");
            const perception = perceive(right!, empath, "alignment", state);
            expect(perception.alignment).toBe("good"); // deceived
        });

        it("good neighbor appearing evil → Empath sees 1", () => {
            testEffects["appears_evil"] = {
                id: "appears_evil" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "alignment",
                    modify: (p) => ({ ...p, alignment: "evil" }),
                }],
            };

            const empath = makePlayer({ id: "p2", roleId: "empath" });
            const deceivedNeighbor = addEffectTo(
                makePlayer({ id: "p3", roleId: "villager" }),
                "appears_evil"
            );
            const state = makeState({
                players: [
                    makePlayer({ id: "p1", roleId: "villager" }),
                    empath,
                    deceivedNeighbor,
                ],
            });

            const [, right] = getAliveNeighbors(state, "p2");
            expect(right?.id).toBe("p3");
            const perception = perceive(right!, empath, "alignment", state);
            expect(perception.alignment).toBe("evil"); // false positive
        });
    });
});
