import { RoleDefinition } from "../types";
import { DefaultRoleReveal } from "../../../components/items/DefaultRoleReveal";

const definition: RoleDefinition = {
    id: "villager",
    team: "townsfolk",
    icon: "user",
    nightOrder: null, // Doesn't wake at night

    RoleReveal: DefaultRoleReveal,
    NightAction: null,
};

export default definition;
