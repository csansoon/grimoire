import { EffectDefinition, EffectId } from "./types";
import Dead from "./definition/dead";
import UsedDeadVote from "./definition/used-dead-vote";
import Safe from "./definition/safe";

export const EFFECTS: Record<EffectId, EffectDefinition> = {
    dead: Dead,
    used_dead_vote: UsedDeadVote,
    safe: Safe,
};

export function getEffect(effectId: string): EffectDefinition | undefined {
    return EFFECTS[effectId as EffectId];
}

export * from "./types";
