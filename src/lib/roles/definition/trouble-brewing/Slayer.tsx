import { RoleDefinition } from "../../types";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";

const definition: RoleDefinition = {
    id: "slayer",
    team: "townsfolk",
    icon: "crosshair",
    nightOrder: null, // Doesn't wake at night - day ability

    // Slayer gets their bullet at game start (one-time use)
    initialEffects: [
        { type: "slayer_bullet", expiresAt: "never" },
    ],

    RoleReveal: DefaultRoleReveal,

    NightAction: null,
};

export default definition;
