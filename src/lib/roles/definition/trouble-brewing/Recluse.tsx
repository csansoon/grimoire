import { RoleDefinition } from "../../types";
import { RoleCard } from "../../../../components/items/RoleCard";

const definition: RoleDefinition = {
    id: "recluse",
    team: "outsider",
    icon: "candleHolderLit",
    nightOrder: null, // Doesn't wake at night — passive ability

    // Recluse gets misregister effect at game start (narrator configures perceiveAs data)
    initialEffects: [
        { type: "recluse_misregister", expiresAt: "never" },
    ],

    RoleReveal: ({ player, onContinue, context }) => (
        <RoleCard roleId={player.roleId} onContinue={onContinue} context={context} />
    ),

    NightAction: null,
};

export default definition;
