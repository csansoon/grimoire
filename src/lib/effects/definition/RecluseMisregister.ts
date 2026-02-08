import { EffectDefinition } from "../types";
import { Perception } from "../../pipeline/types";

const definition: EffectDefinition = {
    id: "recluse_misregister",
    icon: "candleHolderLit",
    canRegisterAs: {
        teams: ["minion", "demon"],
        alignments: ["evil"],
    },
    perceptionModifiers: [
        {
            context: ["alignment", "team", "role"],
            modify: (perception, _target, _observer, _state, effectData) => {
                const overrides = effectData?.perceiveAs as
                    | Partial<Perception>
                    | undefined;
                if (!overrides) return perception;
                return { ...perception, ...overrides };
            },
        },
    ],
};

export default definition;
