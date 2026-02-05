import { useState } from "react";
import { GameState, PlayerState, hasEffect } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { useI18n } from "../../lib/i18n";
import { Icon, Badge } from "../atoms";
import { PlayerDetailModal } from "./PlayerDetailModal";
import { cn } from "../../lib/utils";

type Props = {
    state: GameState;
    compact?: boolean;
    onShowRoleCard?: (player: PlayerState) => void;
};

export function Grimoire({ state, compact = false, onShowRoleCard }: Props) {
    const { t } = useI18n();
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerState | null>(null);

    const getRoleName = (roleId: string) => {
        const role = getRole(roleId);
        if (!role) return roleId;
        const key = roleId as keyof typeof t.roles;
        return t.roles[key]?.name ?? role.name;
    };

    return (
        <>
            <div className={cn("space-y-1", compact ? "" : "")}>
                {state.players.map((player) => {
                    const role = getRole(player.roleId);
                    const team = role ? getTeam(role.team) : null;
                    const isDead = hasEffect(player, "dead");
                    const effectCount = player.effects.filter(e => e.type !== "dead").length;

                    return (
                        <button
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                                "hover:bg-white/5 active:bg-white/10",
                                isDead ? "opacity-60" : ""
                            )}
                        >
                            {/* Role Icon */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border",
                                    isDead
                                        ? "bg-parchment-500/10 border-parchment-500/20"
                                        : team?.isEvil
                                            ? "bg-red-900/30 border-red-600/30"
                                            : "bg-mystic-gold/10 border-mystic-gold/20"
                                )}
                            >
                                {isDead ? (
                                    <Icon name="skull" size="md" className="text-parchment-500" />
                                ) : role ? (
                                    <Icon name={role.icon} size="md" className={team?.colors.text} />
                                ) : (
                                    <Icon name="user" size="md" className="text-parchment-400" />
                                )}
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    "font-medium text-sm",
                                    isDead ? "text-parchment-500 line-through" : "text-parchment-100"
                                )}>
                                    {player.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {role && (
                                        <span className={cn("text-xs", team?.colors.text)}>
                                            {getRoleName(role.id)}
                                        </span>
                                    )}
                                    {effectCount > 0 && (
                                        <Badge variant="effect" className="text-[10px] px-1.5 py-0">
                                            +{effectCount}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Arrow */}
                            <Icon name="arrowRight" size="sm" className="text-parchment-500" />
                        </button>
                    );
                })}
            </div>

            {/* Player Detail Modal */}
            <PlayerDetailModal
                player={selectedPlayer}
                open={selectedPlayer !== null}
                onClose={() => setSelectedPlayer(null)}
                onShowRoleCard={onShowRoleCard}
            />
        </>
    );
}
