import { describe, it, expect, beforeEach } from "vitest";
import { perceive } from "../../pipeline/perception";
import {
    makePlayer,
    makeState,
    addEffectTo,
    resetPlayerCounter,
} from "../../__tests__/helpers";

beforeEach(() => {
    resetPlayerCounter();
});

describe("RecluseMisregister", () => {
    describe("perception modifier", () => {
        it("does not alter perception when no perceiveAs data is set", () => {
            const observer = makePlayer({ id: "obs", roleId: "chef" });
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister"
            );
            const state = makeState({ players: [observer, recluse] });

            const alignment = perceive(recluse, observer, "alignment", state);
            expect(alignment.alignment).toBe("good");

            const team = perceive(recluse, observer, "team", state);
            expect(team.team).toBe("outsider");

            const role = perceive(recluse, observer, "role", state);
            expect(role.roleId).toBe("recluse");
        });

        it("registers as evil alignment when perceiveAs overrides alignment", () => {
            const observer = makePlayer({ id: "obs", roleId: "chef" });
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { alignment: "evil" } }
            );
            const state = makeState({ players: [observer, recluse] });

            const perception = perceive(recluse, observer, "alignment", state);
            expect(perception.alignment).toBe("evil");
            // Team and role should remain unchanged
            expect(perception.team).toBe("outsider");
            expect(perception.roleId).toBe("recluse");
        });

        it("registers as minion team when perceiveAs overrides team", () => {
            const observer = makePlayer({
                id: "obs",
                roleId: "washerwoman",
            });
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { team: "minion" } }
            );
            const state = makeState({ players: [observer, recluse] });

            const perception = perceive(recluse, observer, "team", state);
            expect(perception.team).toBe("minion");
            // Alignment and role unchanged
            expect(perception.alignment).toBe("good");
            expect(perception.roleId).toBe("recluse");
        });

        it("registers as demon team when perceiveAs overrides team", () => {
            const observer = makePlayer({
                id: "obs",
                roleId: "washerwoman",
            });
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { team: "demon" } }
            );
            const state = makeState({ players: [observer, recluse] });

            const perception = perceive(recluse, observer, "team", state);
            expect(perception.team).toBe("demon");
        });

        it("registers as a specific Minion role when perceiveAs overrides roleId", () => {
            const observer = makePlayer({
                id: "obs",
                roleId: "undertaker",
            });
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { roleId: "imp", team: "demon", alignment: "evil" } }
            );
            const state = makeState({ players: [observer, recluse] });

            const perception = perceive(recluse, observer, "role", state);
            expect(perception.roleId).toBe("imp");
            expect(perception.team).toBe("demon");
            expect(perception.alignment).toBe("evil");
        });

        it("applies overrides in all perception contexts", () => {
            const observer = makePlayer({ id: "obs", roleId: "empath" });
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { alignment: "evil", team: "minion" } }
            );
            const state = makeState({ players: [observer, recluse] });

            // "alignment" context
            expect(
                perceive(recluse, observer, "alignment", state).alignment
            ).toBe("evil");
            // "team" context
            expect(perceive(recluse, observer, "team", state).team).toBe(
                "minion"
            );
            // "role" context also applies team/alignment overrides
            const rolePerception = perceive(
                recluse,
                observer,
                "role",
                state
            );
            expect(rolePerception.alignment).toBe("evil");
            expect(rolePerception.team).toBe("minion");
        });

        it("works regardless of observer role (not restricted)", () => {
            const chef = makePlayer({ id: "obs1", roleId: "chef" });
            const empath = makePlayer({ id: "obs2", roleId: "empath" });
            const fortuneTeller = makePlayer({
                id: "obs3",
                roleId: "fortune_teller",
            });
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { alignment: "evil" } }
            );
            const state = makeState({
                players: [chef, empath, fortuneTeller, recluse],
            });

            expect(
                perceive(recluse, chef, "alignment", state).alignment
            ).toBe("evil");
            expect(
                perceive(recluse, empath, "alignment", state).alignment
            ).toBe("evil");
            expect(
                perceive(recluse, fortuneTeller, "alignment", state).alignment
            ).toBe("evil");
        });

        it("works even when the Recluse is dead", () => {
            const observer = makePlayer({ id: "obs", roleId: "undertaker" });
            let recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { roleId: "imp", team: "demon" } }
            );
            recluse = addEffectTo(recluse, "dead");
            const state = makeState({ players: [observer, recluse] });

            const perception = perceive(recluse, observer, "role", state);
            expect(perception.roleId).toBe("imp");
            expect(perception.team).toBe("demon");
        });

        it("only overrides fields specified in perceiveAs (partial overrides)", () => {
            const observer = makePlayer({ id: "obs", roleId: "empath" });
            // Only override alignment, leave team and roleId as-is
            const recluse = addEffectTo(
                makePlayer({ id: "r1", roleId: "recluse" }),
                "recluse_misregister",
                { perceiveAs: { alignment: "evil" } }
            );
            const state = makeState({ players: [observer, recluse] });

            const perception = perceive(recluse, observer, "alignment", state);
            expect(perception.alignment).toBe("evil");
            expect(perception.team).toBe("outsider"); // unchanged
            expect(perception.roleId).toBe("recluse"); // unchanged
        });
    });
});
