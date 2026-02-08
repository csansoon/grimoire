import { RoleDefinition } from "../../types";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";

const definition: RoleDefinition = {
    id: "soldier",
    team: "townsfolk",
    icon: "shield",
    nightOrder: null, // Soldier doesn't wake at night - passive ability

    // Soldier gets permanent Safe effect at game start
    initialEffects: [
        { type: "safe", data: { source: "soldier" }, expiresAt: "never" },
    ],

    RoleReveal: DefaultRoleReveal,

    NightAction: null,
};

export default definition;
