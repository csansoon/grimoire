import { EffectDefinition, EffectId } from "./types";
import Dead from "./definition/Dead";
import UsedDeadVote from "./definition/UsedDeadVote";
import Safe from "./definition/Safe";
import RedHerring from "./definition/RedHerring";
import Pure from "./definition/Pure";
import SlayerBullet from "./definition/SlayerBullet";
import Bounce from "./definition/Bounce";
import Martyrdom from "./definition/Martyrdom";

export const EFFECTS: Record<EffectId, EffectDefinition> = {
    dead: Dead,
    used_dead_vote: UsedDeadVote,
    safe: Safe,
    red_herring: RedHerring,
    pure: Pure,
    slayer_bullet: SlayerBullet,
    bounce: Bounce,
    martyrdom: Martyrdom,
};

export function getEffect(effectId: string): EffectDefinition | undefined {
    return EFFECTS[effectId as EffectId];
}

export function getAllEffects(): EffectDefinition[] {
    return Object.values(EFFECTS);
}

export * from "./types";
