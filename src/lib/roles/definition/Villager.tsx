import { RoleDefinition } from "../types";
import { RoleCard } from "../../../components/items/RoleCard";

const definition: RoleDefinition = {
    id: "villager",
    team: "townsfolk",
    icon: "user",
    nightOrder: null, // Doesn't wake at night

    RoleReveal: ({ player, onContinue, context }) => (
        <RoleCard roleId={player.roleId} onContinue={onContinue} context={context} />
    ),
    NightAction: null,
};

export default definition;
