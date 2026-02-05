import { RoleDefinition } from "../../types";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout } from "../../../../components/layouts";
import { RoleRevealBadge } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";

const definition: RoleDefinition = {
    id: "soldier",
    team: "townsfolk",
    icon: "shield",
    nightOrder: null, // Soldier doesn't wake at night - passive ability
    firstNightOnly: false,

    RoleReveal: ({ player, onContinue }) => {
        const { t } = useI18n();

        // When the soldier sees their role, they get the permanent Safe effect
        // This is handled at game setup time, but we also confirm it during role reveal
        return (
            <RoleCard player={player} onContinue={onContinue} />
        );
    },

    // Soldier doesn't have a night action - their protection is passive and permanent
    // The Safe effect is applied at game start
    NightAction: null,
};

export default definition;
