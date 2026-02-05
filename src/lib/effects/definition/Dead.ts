import { EffectDefinition } from "../types";
import { hasEffect } from "../../types";

const definition: EffectDefinition = {
    id: "dead",
    icon: "skull",

    preventsNightWake: true,
    preventsVoting: true,
    preventsNomination: true,

    // Dead players can vote once if they haven't used their dead vote
    canVote: (player) => {
        return !hasEffect(player, "used_dead_vote");
    },

    canNominate: () => false,
};

export default definition;
