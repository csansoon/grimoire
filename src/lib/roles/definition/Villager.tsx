import { RoleDefinition } from "../types";
import { RoleCard } from "../../../components/items/RoleCard";

const definition: RoleDefinition = {
    id: "villager",
    team: "townsfolk",
    icon: "user",
    nightOrder: null, // Doesn't wake at night

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),
    NightAction: null,
};

export default definition;
