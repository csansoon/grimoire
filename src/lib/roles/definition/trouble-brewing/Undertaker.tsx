import { RoleDefinition } from "../../types";
import { getRole } from "../../index";
import { getTeam } from "../../../teams";
import { isAlive } from "../../../types";
import { useI18n } from "../../../i18n";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";
import { RoleCard } from "../../../../components/items/RoleCard";
import { TeamBackground, CardLink } from "../../../../components/items/TeamBackground";
import { perceive } from "../../../pipeline";
import { cn } from "../../../../lib/utils";

// Helper to find execution from the previous day
function findExecutedPlayerId(game: { history: Array<{ type: string; data: Record<string, unknown> }> }): string | null {
    let lastDayStartIndex = -1;

    for (let i = game.history.length - 1; i >= 0; i--) {
        const entry = game.history[i];
        if (entry.type === "day_started") {
            lastDayStartIndex = i;
            break;
        }
    }

    if (lastDayStartIndex !== -1) {
        for (let i = lastDayStartIndex; i < game.history.length; i++) {
            const entry = game.history[i];
            if (entry.type === "execution") {
                return entry.data.playerId as string;
            }
        }
    }

    return null;
}

const definition: RoleDefinition = {
    id: "undertaker",
    team: "townsfolk",
    icon: "shovel",
    nightOrder: 40, // Wakes late, after deaths are resolved

    // Only wake if alive, not first night, AND there was an execution during the day
    shouldWake: (game, player) => {
        if (!isAlive(player)) return false;
        const round = game.history.at(-1)?.stateAfter.round ?? 0;
        if (round <= 1) return false; // Skip first night
        return findExecutedPlayerId(game) !== null;
    },

    RoleReveal: DefaultRoleReveal,

    NightAction: ({ game, state, player, onComplete }) => {
        const { t } = useI18n();

        // Find the executed player (we know there was one because shouldWake returned true)
        const executedPlayerId = findExecutedPlayerId(game);
        const executedPlayer = executedPlayerId
            ? state.players.find((p) => p.id === executedPlayerId)
            : null;
        // Use perception to determine what role the Undertaker "sees"
        const executedPerception = executedPlayer
            ? perceive(executedPlayer, player, "role", state)
            : null;
        const executedRole = executedPerception
            ? getRole(executedPerception.roleId)
            : null;

        const handleComplete = () => {
            if (executedPlayer && executedRole) {
                onComplete({
                    entries: [
                        {
                            type: "night_action",
                            message: [
                                {
                                    type: "i18n",
                                    key: "roles.undertaker.history.sawExecutedRole",
                                    params: {
                                        player: player.id,
                                        role: executedRole.id,
                                    },
                                },
                            ],
                            data: {
                                roleId: "undertaker",
                                playerId: player.id,
                                action: "saw_executed",
                                executedPlayerId: executedPlayer.id,
                                executedRoleId: executedRole.id,
                            },
                        },
                    ],
                });
            }
        };

        if (!executedPerception) return null;

        const shownRole = getRole(executedPerception.roleId);
        const shownTeamId = shownRole?.team ?? "townsfolk";
        const shownTeam = getTeam(shownTeamId);

        return (
            <TeamBackground teamId={shownTeamId}>
                <p className={cn(
                    "text-center text-xs uppercase tracking-widest font-semibold mb-4",
                    shownTeam.isEvil ? "text-red-300/80" : "text-parchment-300/80",
                )}>
                    {t.game.executedPlayerRole}
                </p>

                <RoleCard roleId={executedPerception.roleId} />

                <CardLink onClick={handleComplete} isEvil={shownTeam.isEvil}>
                    {t.common.continue}
                </CardLink>
            </TeamBackground>
        );
    },
};

export default definition;
