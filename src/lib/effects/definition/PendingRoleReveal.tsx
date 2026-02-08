import { EffectDefinition } from "../types";
import {
    NightFollowUpDefinition,
    NightFollowUpProps,
} from "../../pipeline/types";
import { getRole } from "../../roles";
import { getTeam } from "../../teams";
import { RoleCard } from "../../../components/items/RoleCard";
import { TeamBackground, CardLink } from "../../../components/items/TeamBackground";
import { useI18n } from "../../i18n";
import { cn } from "../../../lib/utils";

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

    const role = getRole(player.roleId);
    const teamId = role?.team ?? "townsfolk";
    const team = getTeam(teamId);

    const handleComplete = () => {
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
    };

    return (
        <TeamBackground teamId={teamId}>
            <p className={cn(
                "text-center text-xs uppercase tracking-widest font-semibold mb-4",
                team.isEvil ? "text-red-300/80" : "text-parchment-300/80",
            )}>
                {t.game.yourRoleHasChanged}
            </p>

            <RoleCard roleId={player.roleId} />

            <CardLink onClick={handleComplete} isEvil={team.isEvil}>
                {t.common.continue}
            </CardLink>
        </TeamBackground>
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
