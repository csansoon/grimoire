import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAvailableNightFollowUps } from "../pipeline";
import { getNightRolesStatus } from "../game";
import {
    makePlayer,
    makeState,
    makeGame,
    makeGameWithHistory,
    addEffectTo,
    resetPlayerCounter,
} from "./helpers";
import { EffectDefinition, EffectId } from "../effects/types";

// ============================================================================
// MOCK getEffect so we can inject test effects with nightFollowUps
// ============================================================================

vi.mock("../effects", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        getEffect: (effectId: string) => {
            if (testEffects[effectId]) return testEffects[effectId];
            return (
                actual.getEffect as (
                    id: string,
                ) => EffectDefinition | undefined
            )(effectId);
        },
    };
});

const testEffects: Record<string, EffectDefinition> = {};

beforeEach(() => {
    resetPlayerCounter();
    // Clear test effects between tests
    for (const key of Object.keys(testEffects)) {
        delete testEffects[key];
    }
});

const mockT = {
    game: {
        yourRoleHasChanged: "Your role has changed!",
    },
};

// ============================================================================
// getAvailableNightFollowUps
// ============================================================================

describe("getAvailableNightFollowUps", () => {
    it("returns empty array when no players have nightFollowUp effects", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "villager" }),
            makePlayer({ id: "p2", roleId: "imp" }),
        ];
        const state = makeState({ players });
        const game = makeGame(state);

        const result = getAvailableNightFollowUps(state, game, mockT);
        expect(result).toEqual([]);
    });

    it("returns follow-ups for players with pending_role_reveal effect", () => {
        const player = addEffectTo(
            makePlayer({ id: "sw", name: "Scarlet", roleId: "imp" }),
            "pending_role_reveal",
        );
        const state = makeState({ players: [player] });
        const game = makeGame(state);

        const result = getAvailableNightFollowUps(state, game, mockT);

        expect(result).toHaveLength(1);
        expect(result[0].playerId).toBe("sw");
        expect(result[0].playerName).toBe("Scarlet");
        expect(result[0].icon).toBe("sparkles");
        expect(result[0].label).toBe("Your role has changed!");
        expect(result[0].ActionComponent).toBeDefined();
    });

    it("does not return follow-ups when the effect is not present", () => {
        const player = makePlayer({
            id: "sw",
            name: "Scarlet",
            roleId: "imp",
        });
        const state = makeState({ players: [player] });
        const game = makeGame(state);

        const result = getAvailableNightFollowUps(state, game, mockT);
        expect(result).toEqual([]);
    });

    it("returns multiple follow-ups if multiple players have the effect", () => {
        const p1 = addEffectTo(
            makePlayer({ id: "p1", name: "Alice", roleId: "imp" }),
            "pending_role_reveal",
        );
        const p2 = addEffectTo(
            makePlayer({ id: "p2", name: "Bob", roleId: "villager" }),
            "pending_role_reveal",
        );
        const state = makeState({ players: [p1, p2] });
        const game = makeGame(state);

        const result = getAvailableNightFollowUps(state, game, mockT);

        expect(result).toHaveLength(2);
        expect(result[0].playerId).toBe("p1");
        expect(result[1].playerId).toBe("p2");
    });

    it("works with custom test effects that have nightFollowUps", () => {
        const MockComponent = () => null;

        testEffects["test_follow_up"] = {
            id: "test_follow_up" as EffectId,
            icon: "user",
            nightFollowUps: [
                {
                    id: "test_action",
                    icon: "star" as any,
                    getLabel: () => "Test Follow-Up",
                    condition: () => true,
                    ActionComponent: MockComponent,
                },
            ],
        };

        const player = addEffectTo(
            makePlayer({ id: "p1", name: "Alice", roleId: "villager" }),
            "test_follow_up",
        );
        const state = makeState({ players: [player] });
        const game = makeGame(state);

        const result = getAvailableNightFollowUps(state, game, mockT);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("test_action_p1");
        expect(result[0].label).toBe("Test Follow-Up");
        expect(result[0].ActionComponent).toBe(MockComponent);
    });

    it("respects the condition function — only returns when condition is true", () => {
        testEffects["conditional_follow_up"] = {
            id: "conditional_follow_up" as EffectId,
            icon: "user",
            nightFollowUps: [
                {
                    id: "conditional_action",
                    icon: "star" as any,
                    getLabel: () => "Conditional",
                    // Only applies if the player is alive (no dead effect)
                    condition: (player) =>
                        !player.effects.some((e) => e.type === "dead"),
                    ActionComponent: () => null,
                },
            ],
        };

        // Player alive → follow-up returned
        const alivePlayer = addEffectTo(
            makePlayer({ id: "p1", roleId: "villager" }),
            "conditional_follow_up",
        );
        const aliveState = makeState({ players: [alivePlayer] });
        const aliveGame = makeGame(aliveState);

        expect(
            getAvailableNightFollowUps(aliveState, aliveGame, mockT),
        ).toHaveLength(1);

        // Player dead → follow-up NOT returned
        const deadPlayer = addEffectTo(
            addEffectTo(
                makePlayer({ id: "p2", roleId: "villager" }),
                "conditional_follow_up",
            ),
            "dead",
        );
        const deadState = makeState({ players: [deadPlayer] });
        const deadGame = makeGame(deadState);

        expect(
            getAvailableNightFollowUps(deadState, deadGame, mockT),
        ).toHaveLength(0);
    });
});

// ============================================================================
// Integration: getNightRolesStatus no longer includes role change reveals
// ============================================================================

describe("getNightRolesStatus", () => {
    it("does not include role change reveals (those are handled by nightFollowUps)", () => {
        const players = [
            makePlayer({ id: "p1", roleId: "washerwoman" }),
            makePlayer({ id: "p2", roleId: "imp" }),
        ];

        // Create a game with a night_started event, a night action done,
        // and a role_changed event (but no role_change_revealed)
        const game = makeGameWithHistory(
            [
                {
                    type: "game_created",
                    stateOverrides: { phase: "night", round: 2 },
                },
                { type: "night_started" },
                {
                    type: "night_action",
                    data: { roleId: "washerwoman", playerId: "p1" },
                },
                {
                    type: "role_changed",
                    data: {
                        playerId: "p2",
                        fromRole: "scarlet_woman",
                        toRole: "imp",
                    },
                },
            ],
            makeState({
                phase: "night",
                round: 2,
                players,
            }),
        );

        const result = getNightRolesStatus(game);

        // Should only contain the washerwoman action (done),
        // and potentially the imp if it should wake.
        // NO role_change_reveal items should be present.
        const hasRoleChangeReveal = result.some(
            (r: any) => r.actionType === "role_change_reveal",
        );
        expect(hasRoleChangeReveal).toBe(false);

        // The washerwoman should be "done"
        const washerwoman = result.find((r) => r.roleId === "washerwoman");
        expect(washerwoman).toBeDefined();
        expect(washerwoman!.status).toBe("done");
    });
});

// ============================================================================
// Integration: Scarlet Woman handler adds pending_role_reveal effect
// ============================================================================

describe("Scarlet Woman → pending_role_reveal integration", () => {
    it("Scarlet Woman handler adds pending_role_reveal when Demon dies", async () => {
        // Use the real ScarletWoman effect
        const { default: swDef } = await import(
            "../effects/definition/ScarletWoman"
        );
        const handler = swDef.handlers![0];

        const demon = makePlayer({ id: "demon", roleId: "imp" });
        let sw = makePlayer({ id: "sw", roleId: "scarlet_woman" });
        sw = addEffectTo(sw, "scarlet_woman");
        const others = Array.from({ length: 4 }, (_, i) =>
            makePlayer({ id: `p${i}`, roleId: "villager" }),
        );
        const state = makeState({
            phase: "night",
            round: 2,
            players: [demon, sw, ...others],
        });
        const game = makeGame(state);

        const intent = {
            type: "kill" as const,
            sourceId: "demon",
            targetId: "demon",
            cause: "demon",
        };

        const result = handler.handle(intent, sw, state, game);

        expect(result.action).toBe("allow");
        if (result.action === "allow") {
            // Adds pending_role_reveal
            expect(result.stateChanges?.addEffects).toEqual({
                sw: [{ type: "pending_role_reveal", expiresAt: "never" }],
            });

            // Removes scarlet_woman
            expect(result.stateChanges?.removeEffects).toEqual({
                sw: ["scarlet_woman"],
            });

            // The pending_role_reveal effect should produce a follow-up
            // Simulate: apply the changes, then check for follow-ups
            const swWithEffect = addEffectTo(
                { ...sw, roleId: "imp", effects: [] },
                "pending_role_reveal",
            );
            const newState = makeState({
                phase: "night",
                round: 2,
                players: [
                    addEffectTo(demon, "dead"),
                    swWithEffect,
                    ...others,
                ],
            });

            const followUps = getAvailableNightFollowUps(
                newState,
                game,
                mockT,
            );
            expect(followUps).toHaveLength(1);
            expect(followUps[0].playerId).toBe("sw");
            expect(followUps[0].label).toBe("Your role has changed!");
        }
    });
});
