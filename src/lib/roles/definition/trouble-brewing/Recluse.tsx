import { RoleDefinition } from "../../types";
import { RoleCard } from "../../../../components/items/RoleCard";

/**
 * The Recluse — Outsider role.
 *
 * "You might register as evil & as a Minion or Demon, even if dead."
 *
 * The Recluse has no night action. Its ability is entirely passive and
 * declarative: the `registration` config tells other abilities that
 * this role can register differently. When an ability reads alignment
 * or role type, the generic registration system prompts the Narrator.
 */
const definition: RoleDefinition = {
    id: "recluse",
    team: "outsider",
    icon: "flowerLotus",
    nightOrder: null, // Doesn't wake at night — passive ability

    registration: {
        canRegisterAsEvil: true,
        canRegisterAsTeams: ["outsider", "minion", "demon"],
        canAppearAsDifferentRole: true,
    },

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: null,
};

export default definition;
