import { RoleDefinition } from "../../types";
import { RoleCard } from "../../../../components/items/RoleCard";

const definition: RoleDefinition = {
    id: "saint",
    team: "outsider",
    icon: "starNorth",
    nightOrder: null, // Doesn't wake at night — passive ability

    // Saint gets Martyrdom effect at game start (evil wins if executed)
    initialEffects: [
        { type: "martyrdom", expiresAt: "never" },
    ],

    RoleReveal: ({ player, onContinue, context }) => (
        <RoleCard roleId={player.roleId} onContinue={onContinue} context={context} />
    ),

    NightAction: null,
};

export default definition;
