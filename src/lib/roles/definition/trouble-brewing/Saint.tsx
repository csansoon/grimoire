import { RoleDefinition } from "../../types";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";

const definition: RoleDefinition = {
    id: "saint",
    team: "outsider",
    icon: "starNorth",
    nightOrder: null, // Doesn't wake at night — passive ability

    // Saint gets Martyrdom effect at game start (evil wins if executed)
    initialEffects: [
        { type: "martyrdom", expiresAt: "never" },
    ],

    RoleReveal: DefaultRoleReveal,

    NightAction: null,
};

export default definition;
