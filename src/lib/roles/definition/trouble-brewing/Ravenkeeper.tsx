import { useState } from "react";
import { RoleDefinition } from "../../types";
import { getRole } from "../../index";
import { getTeam } from "../../../teams";
import { useI18n } from "../../../i18n";
import { hasEffect, Game, PlayerState } from "../../../types";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";
import { RoleCard } from "../../../../components/items/RoleCard";
import { TeamBackground, CardLink } from "../../../../components/items/TeamBackground";
import { NightActionLayout } from "../../../../components/layouts";
import { SelectablePlayerItem } from "../../../../components/inputs";
import { Button, Icon } from "../../../../components/atoms";
import { perceive } from "../../../pipeline";
import { cn } from "../../../../lib/utils";

type Phase = "select_player" | "show_role";

// Helper to check if a player was killed this night
function wasKilledThisNight(game: Game, playerId: string): boolean {
    let nightStartIndex = -1;

    for (let i = game.history.length - 1; i >= 0; i--) {
        const entry = game.history[i];
        if (entry.type === "night_started") {
            nightStartIndex = i;
            break;
        }
    }

    if (nightStartIndex !== -1) {
        for (let i = nightStartIndex; i < game.history.length; i++) {
            const entry = game.history[i];
            if (
                entry.type === "night_action" &&
                entry.data.action === "kill" &&
                entry.data.targetId === playerId
            ) {
                return true;
            }
        }
    }

    return false;
}

const definition: RoleDefinition = {
    id: "ravenkeeper",
    team: "townsfolk",
    icon: "birdHouse",
    nightOrder: 35, // Wakes after demon kills, before undertaker

    // Ravenkeeper wakes when killed - no isAlive check since they wake BECAUSE they died
    shouldWake: (game: Game, player: PlayerState) => {
        const round = game.history.at(-1)?.stateAfter.round ?? 0;
        if (round <= 1) return false; // Skip first night (no deaths on first night)
        return wasKilledThisNight(game, player.id);
    },

    RoleReveal: DefaultRoleReveal,

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [phase, setPhase] = useState<Phase>("select_player");
        const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

        // We know we were killed (shouldWake returned true)
        const otherPlayers = state.players.filter((p) => p.id !== player.id);

        const handleSelectPlayer = (playerId: string) => {
            setSelectedPlayer(playerId);
        };

        const handleShowRole = () => {
            if (!selectedPlayer) return;
            setPhase("show_role");
        };

        const handleComplete = () => {
            if (!selectedPlayer) return;

            const targetPlayer = state.players.find((p) => p.id === selectedPlayer);
            if (!targetPlayer) return;

            // Use perception to determine what role is shown (handles Recluse/Spy)
            const targetPerception = perceive(targetPlayer, player, "role", state);
            const targetRole = getRole(targetPerception.roleId);
            if (!targetRole) return;

            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.ravenkeeper.history.sawRole",
                                params: {
                                    player: player.id,
                                    target: targetPlayer.id,
                                    role: targetRole.id,
                                },
                            },
                        ],
                        data: {
                            roleId: "ravenkeeper",
                            playerId: player.id,
                            action: "saw_role",
                            targetId: targetPlayer.id,
                            shownRoleId: targetRole.id,
                        },
                    },
                ],
            });
        };

        // Phase 1: Select a player
        if (phase === "select_player") {
            return (
                <NightActionLayout
                    player={player}
                    title={t.game.ravenkeeperInfo}
                    description={t.game.selectPlayerToSeeRole}
                >
                    <div className="space-y-2 mb-6">
                        {otherPlayers.map((p) => {
                            const isDead = hasEffect(p, "dead");
                            const isSelected = selectedPlayer === p.id;

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={isDead ? t.effects.dead.name : ""}
                                    roleIcon={isDead ? "skull" : "user"}
                                    isSelected={isSelected}
                                    isDisabled={false}
                                    onClick={() => handleSelectPlayer(p.id)}
                                />
                            );
                        })}
                    </div>

                    <Button
                        onClick={handleShowRole}
                        fullWidth
                        size="lg"
                        disabled={!selectedPlayer}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 font-tarot uppercase tracking-wider disabled:opacity-50"
                    >
                        <Icon name="eye" size="md" className="mr-2" />
                        {t.common.confirm}
                    </Button>
                </NightActionLayout>
            );
        }

        // Phase 2: Show the selected player's perceived role as a full RoleCard
        const targetPlayer = state.players.find((p) => p.id === selectedPlayer);
        const targetPerception = targetPlayer
            ? perceive(targetPlayer, player, "role", state)
            : null;

        if (!targetPerception) return null;

        const shownRole = getRole(targetPerception.roleId);
        const shownTeamId = shownRole?.team ?? "townsfolk";
        const shownTeam = getTeam(shownTeamId);

        return (
            <TeamBackground teamId={shownTeamId}>
                <p className={cn(
                    "text-center text-xs uppercase tracking-widest font-semibold mb-4",
                    shownTeam.isEvil ? "text-red-300/80" : "text-parchment-300/80",
                )}>
                    {t.game.playerRoleIs}
                </p>

                <RoleCard roleId={targetPerception.roleId} />

                <CardLink onClick={handleComplete} isEvil={shownTeam.isEvil}>
                    {t.common.continue}
                </CardLink>
            </TeamBackground>
        );
    },
};

export default definition;
