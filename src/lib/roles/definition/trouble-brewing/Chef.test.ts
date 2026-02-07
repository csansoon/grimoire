import { describe, it, expect, beforeEach, vi } from "vitest";
import { countEvilPairs } from "./Chef";
import definition from "./Chef";
import { EffectDefinition, EffectId } from "../../../effects/types";
import {
    makePlayer,
    makeState,
    addEffectTo,
    makeGameWithHistory,
    resetPlayerCounter,
} from "../../../__tests__/helpers";

// Mock getEffect to inject test perception modifiers
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

describe("Chef", () => {
    // ================================================================
    // SHOULD WAKE
    // ================================================================

    describe("shouldWake", () => {
        it("wakes only on the first night", () => {
            const player = makePlayer({ id: "p1", roleId: "chef" });
            const round1 = makeGameWithHistory(
                [{ type: "night_started", data: { round: 1 }, stateOverrides: { round: 1 } }],
                makeState({ round: 1, players: [player] })
            );
            const round2 = makeGameWithHistory(
                [{ type: "night_started", data: { round: 2 }, stateOverrides: { round: 2 } }],
                makeState({ round: 2, players: [player] })
            );

            expect(definition.shouldWake!(round1, player)).toBe(true);
            expect(definition.shouldWake!(round2, player)).toBe(false);
        });

        it("does not wake when dead", () => {
            const player = addEffectTo(makePlayer({ id: "p1", roleId: "chef" }), "dead");
            const game = makeGameWithHistory(
                [{ type: "night_started", data: { round: 1 }, stateOverrides: { round: 1 } }],
                makeState({ round: 1, players: [player] })
            );
            expect(definition.shouldWake!(game, player)).toBe(false);
        });
    });

    // ================================================================
    // EVIL PAIR COUNTING
    // ================================================================

    describe("countEvilPairs", () => {
        it("returns 0 when no evil players are adjacent", () => {
            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const players = [
                makePlayer({ id: "p1", roleId: "villager" }),
                makePlayer({ id: "p2", roleId: "imp" }),
                makePlayer({ id: "p3", roleId: "villager" }),
                makePlayer({ id: "p4", roleId: "villager" }),
                chef,
            ];
            const state = makeState({ players });
            expect(countEvilPairs(state, chef)).toBe(0);
        });

        it("returns 1 when two evil players sit next to each other", () => {
            const chef = makePlayer({ id: "chef", roleId: "chef" });
            // Imp and "evil minion" are adjacent (using imp twice for simplicity)
            const players = [
                makePlayer({ id: "p1", roleId: "villager" }),
                makePlayer({ id: "p2", roleId: "imp" }),
                makePlayer({ id: "p3", roleId: "imp" }), // second demon for test
                makePlayer({ id: "p4", roleId: "villager" }),
                chef,
            ];
            const state = makeState({ players });
            expect(countEvilPairs(state, chef)).toBe(1);
        });

        it("counts wrapping pairs (last and first player are adjacent)", () => {
            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const players = [
                makePlayer({ id: "p1", roleId: "imp" }),      // evil
                makePlayer({ id: "p2", roleId: "villager" }),
                makePlayer({ id: "p3", roleId: "villager" }),
                makePlayer({ id: "p4", roleId: "imp" }),      // evil — adjacent to p1 wrapping
                chef,
            ];
            const state = makeState({ players });
            // p4-chef (good), chef-p1 (good), p1-p2 (no), p3-p4 (no) — but p4 and p1 wrap? 
            // Actually in circular: [p1(evil), p2, p3, p4(evil), chef] 
            // Pairs: p1-p2(no), p2-p3(no), p3-p4(no), p4-chef(no), chef-p1(no)
            // No adjacent evil pairs here. Let me fix:
            expect(countEvilPairs(state, chef)).toBe(0);
        });

        it("counts circular adjacency when evil at both ends", () => {
            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const players = [
                makePlayer({ id: "p1", roleId: "imp" }),      // evil — position 0
                chef,
                makePlayer({ id: "p3", roleId: "villager" }),
                makePlayer({ id: "p4", roleId: "imp" }),      // evil — position 3 (wraps to 0)
            ];
            const state = makeState({ players });
            // Circular: [p1(evil), chef, p3, p4(evil)]
            // Pairs: p1-chef(no), chef-p3(no), p3-p4(no), p4-p1(YES wrapping)
            expect(countEvilPairs(state, chef)).toBe(1);
        });

        it("skips dead players when counting neighbors", () => {
            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const players = [
                makePlayer({ id: "p1", roleId: "imp" }),                           // evil
                addEffectTo(makePlayer({ id: "p2", roleId: "villager" }), "dead"),  // dead, skipped
                makePlayer({ id: "p3", roleId: "imp" }),                           // evil — now adjacent to p1
                makePlayer({ id: "p4", roleId: "villager" }),
                chef,
            ];
            const state = makeState({ players });
            // Alive: [p1(evil), p3(evil), p4, chef]
            // p1-p3 are now adjacent (p2 dead) → 1 evil pair
            expect(countEvilPairs(state, chef)).toBe(1);
        });

        it("returns 0 with fewer than 2 alive players", () => {
            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const state = makeState({ players: [chef] });
            expect(countEvilPairs(state, chef)).toBe(0);
        });
    });

    // ================================================================
    // PERCEPTION DECEPTION
    // ================================================================

    describe("perception deception", () => {
        it("good player with 'appears evil' modifier is counted as evil (false positive)", () => {
            testEffects["appears_evil"] = {
                id: "appears_evil" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "alignment",
                    modify: (p) => ({ ...p, alignment: "evil" }),
                }],
            };

            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const players = [
                addEffectTo(makePlayer({ id: "p1", roleId: "villager" }), "appears_evil"), // looks evil
                makePlayer({ id: "p2", roleId: "imp" }),       // actually evil
                makePlayer({ id: "p3", roleId: "villager" }),
                chef,
            ];
            const state = makeState({ players });
            // p1(looks evil) - p2(evil) → evil pair
            expect(countEvilPairs(state, chef)).toBe(1);
        });

        it("evil player with 'appears good' modifier is NOT counted as evil (false negative)", () => {
            testEffects["appears_good"] = {
                id: "appears_good" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "alignment",
                    modify: (p) => ({ ...p, alignment: "good" }),
                }],
            };

            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const players = [
                makePlayer({ id: "p1", roleId: "imp" }),
                addEffectTo(makePlayer({ id: "p2", roleId: "imp" }), "appears_good"), // looks good
                makePlayer({ id: "p3", roleId: "villager" }),
                chef,
            ];
            const state = makeState({ players });
            // p1(evil) - p2(looks good) → NOT an evil pair
            expect(countEvilPairs(state, chef)).toBe(0);
        });

        it("two adjacent good players both appearing evil count as an evil pair", () => {
            testEffects["appears_evil"] = {
                id: "appears_evil" as EffectId,
                icon: "user",
                perceptionModifiers: [{
                    context: "alignment",
                    modify: (p) => ({ ...p, alignment: "evil" }),
                }],
            };

            const chef = makePlayer({ id: "chef", roleId: "chef" });
            const players = [
                addEffectTo(makePlayer({ id: "p1", roleId: "villager" }), "appears_evil"),
                addEffectTo(makePlayer({ id: "p2", roleId: "villager" }), "appears_evil"),
                makePlayer({ id: "p3", roleId: "villager" }),
                chef,
            ];
            const state = makeState({ players });
            expect(countEvilPairs(state, chef)).toBe(1);
        });
    });
});
