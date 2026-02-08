import { RoleDefinition } from "../../types";
import { RoleCard } from "../../../../components/items/RoleCard";

const definition: RoleDefinition = {
    id: "virgin",
    team: "townsfolk",
    icon: "flower",
    nightOrder: null, // Doesn't wake at night - passive ability

    // Virgin gets Pure effect at game start (used once when nominated)
    initialEffects: [
        { type: "pure", expiresAt: "never" },
    ],

    RoleReveal: ({ player, onContinue, context }) => (
        <RoleCard roleId={player.roleId} onContinue={onContinue} context={context} />
    ),
    NightAction: null,
};

export default definition;
