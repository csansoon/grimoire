import { EffectDefinition } from "../types";

const definition: EffectDefinition = {
    id: "used_dead_vote",
    icon: "vote",

    preventsVoting: true,

    canVote: () => false,
};

export default definition;
