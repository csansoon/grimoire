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

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: null,
};

export default definition;
