import { describe, it, expect, beforeEach } from "vitest";
import definition from "./PendingRoleReveal";
import {
    makePlayer,
    makeState,
    makeGame,
    addEffectTo,
    resetPlayerCounter,
} from "../../__tests__/helpers";

beforeEach(() => resetPlayerCounter());

describe("PendingRoleReveal effect", () => {
    it("has a nightFollowUps definition", () => {
        expect(definition.nightFollowUps).toBeDefined();
        expect(definition.nightFollowUps).toHaveLength(1);
    });

    describe("nightFollowUp condition", () => {
        it("returns true when the effect is present (always pending)", () => {
            const followUp = definition.nightFollowUps![0];
            const player = addEffectTo(
                makePlayer({ roleId: "imp" }),
                "pending_role_reveal",
            );
            const state = makeState({ players: [player] });
            const game = makeGame(state);

            expect(followUp.condition(player, state, game)).toBe(true);
        });
    });

    describe("nightFollowUp metadata", () => {
        it("has the correct id", () => {
            expect(definition.nightFollowUps![0].id).toBe(
                "role_change_reveal",
            );
        });

        it("has a sparkles icon", () => {
            expect(definition.nightFollowUps![0].icon).toBe("sparkles");
        });

        it("has an ActionComponent", () => {
            expect(definition.nightFollowUps![0].ActionComponent).toBeDefined();
            expect(
                typeof definition.nightFollowUps![0].ActionComponent,
            ).toBe("function");
        });
    });
});
