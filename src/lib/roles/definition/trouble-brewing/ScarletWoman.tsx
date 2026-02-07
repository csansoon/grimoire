import { RoleDefinition } from "../../types";
import { RoleCard } from "../../../../components/items/RoleCard";

/**
 * Scarlet Woman — Minion role.
 *
 * If there are 5 or more players alive and the Demon dies,
 * the Scarlet Woman becomes the Demon.
 *
 * This is a passive role. All behavior is on the `scarlet_woman` effect,
 * which intercepts kill and execute intents targeting Demons.
 */
const definition: RoleDefinition = {
    id: "scarlet_woman",
    team: "minion",
    icon: "heart",
    nightOrder: null, // Doesn't wake at night — passive ability

    // Scarlet Woman gets her effect at game start
    initialEffects: [
        { type: "scarlet_woman", expiresAt: "never" },
    ],

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: null,
};

export default definition;
