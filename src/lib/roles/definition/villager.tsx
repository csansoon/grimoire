import { RoleDefinition } from "../types";
import { RoleCard } from "../../../components/items/RoleCard";

const definition: RoleDefinition = {
    id: "villager",
    name: "Villager",
    description: "You have no ability. But you are still a good person! Help your town find the Demon.",
    team: "townsfolk",
    icon: "user",
    nightOrder: null, // Doesn't wake at night

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),
    NightAction: null,
};

export default definition;
