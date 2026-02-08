import { RoleDefinition } from "../../types";
import { RoleCard } from "../../../../components/items/RoleCard";

const definition: RoleDefinition = {
    id: "soldier",
    team: "townsfolk",
    icon: "shield",
    nightOrder: null, // Soldier doesn't wake at night - passive ability

    // Soldier gets permanent Safe effect at game start
    initialEffects: [
        { type: "safe", data: { source: "soldier" }, expiresAt: "never" },
    ],

    RoleReveal: ({ player, onContinue, context }) => (
        <RoleCard roleId={player.roleId} onContinue={onContinue} context={context} />
    ),

    NightAction: null,
};

export default definition;
