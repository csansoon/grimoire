import { RoleDefinition } from "../../types";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";

const definition: RoleDefinition = {
    id: "virgin",
    team: "townsfolk",
    icon: "flower",
    nightOrder: null, // Doesn't wake at night - passive ability

    // Virgin gets Pure effect at game start (used once when nominated)
    initialEffects: [
        { type: "pure", expiresAt: "never" },
    ],

    RoleReveal: DefaultRoleReveal,
    NightAction: null,
};

export default definition;
