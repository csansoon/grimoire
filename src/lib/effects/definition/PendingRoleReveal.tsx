import { EffectDefinition } from "../types";
import {
    NightFollowUpDefinition,
    NightFollowUpProps,
} from "../../pipeline/types";
import { RoleCard } from "../../../components/items/RoleCard";
import { useI18n } from "../../i18n";

/**
 * Action component shown when a player's role has changed and they need
 * to be informed (e.g., Scarlet Woman becoming the Demon).
 * Shows the player's current RoleCard with a "Your role has changed!" header.
 */
function RoleChangeRevealAction({
    state,
    playerId,
    onComplete,
}: NightFollowUpProps) {
    const { t } = useI18n();
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return null;

    return (
        <RoleCard
            roleId={player.roleId}
            context={t.game.yourRoleHasChanged}
            onContinue={() => {
                onComplete({
                    entries: [
                        {
                            type: "role_change_revealed",
                            message: [
                                {
                                    type: "i18n",
                                    key: "history.roleChanged",
                                    params: {
                                        player: playerId,
                                        role: player.roleId,
                                    },
                                },
                            ],
                            data: { playerId, roleId: player.roleId },
                        },
                    ],
                    removeEffects: { [playerId]: ["pending_role_reveal"] },
                });
            }}
        />
    );
}

const roleChangeFollowUp: NightFollowUpDefinition = {
    id: "role_change_reveal",
    icon: "sparkles",
    getLabel: (t) => t.game.yourRoleHasChanged,
    // If the effect exists on the player, the reveal is needed
    condition: () => true,
    ActionComponent: RoleChangeRevealAction,
};

const definition: EffectDefinition = {
    id: "pending_role_reveal",
    icon: "sparkles",
    nightFollowUps: [roleChangeFollowUp],
};

export default definition;
