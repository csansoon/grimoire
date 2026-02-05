import { PlayerState, hasEffect } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam, TeamId } from "../../lib/teams";
import { getEffect } from "../../lib/effects";
import { useI18n } from "../../lib/i18n";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    Icon,
    Badge,
    Button,
} from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    player: PlayerState | null;
    open: boolean;
    onClose: () => void;
    onShowRoleCard?: (player: PlayerState) => void;
};

export function PlayerDetailModal({ player, open, onClose, onShowRoleCard }: Props) {
    const { t } = useI18n();

    if (!player) return null;

    const role = getRole(player.roleId);
    const team = role ? getTeam(role.team) : null;
    const isDead = hasEffect(player, "dead");

    const roleId = role?.id as keyof typeof t.roles | undefined;
    const teamId = role?.team as TeamId | undefined;

    const roleName = (roleId && t.roles[roleId]?.name) ?? role?.name ?? "Unknown";
    const roleDescription = (roleId && t.roles[roleId]?.description) ?? role?.description ?? "";
    const teamName = (teamId && t.teams[teamId]?.name) ?? team?.name ?? "";
    const winCondition = role?.winCondition ?? (teamId && t.teams[teamId]?.winCondition) ?? team?.winCondition ?? "";

    const isEvil = team?.isEvil ?? false;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    {/* Player status indicator */}
                    <div className="flex justify-center mb-4">
                        <div
                            className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center border-2",
                                isDead
                                    ? "bg-parchment-500/10 border-parchment-500/30"
                                    : isEvil
                                        ? "bg-red-900/30 border-red-600/40"
                                        : "bg-mystic-gold/10 border-mystic-gold/30"
                            )}
                        >
                            {isDead ? (
                                <Icon name="skull" size="2xl" className="text-parchment-500" />
                            ) : role ? (
                                <Icon
                                    name={role.icon}
                                    size="2xl"
                                    className={isEvil ? "text-red-400" : "text-mystic-gold"}
                                />
                            ) : (
                                <Icon name="user" size="2xl" className="text-parchment-400" />
                            )}
                        </div>
                    </div>

                    {/* Player Name */}
                    <DialogTitle>{player.name}</DialogTitle>

                    {/* Status badges */}
                    <div className="flex justify-center gap-2 mt-2">
                        {isDead && (
                            <Badge variant="dead">
                                <Icon name="skull" size="xs" className="mr-1" />
                                {t.effects.dead}
                            </Badge>
                        )}
                        {role && (
                            <Badge variant={role.team}>
                                <Icon name={role.icon} size="xs" className="mr-1" />
                                {roleName}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <DialogBody>
                    {/* Role Section */}
                    {role && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon name={role.icon} size="sm" className={team?.colors.text} />
                                <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                                    {t.common.role}
                                </span>
                                <span className="text-xs text-parchment-500">({teamName})</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <p className="text-parchment-200 text-sm leading-relaxed">
                                    {roleDescription}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Effects Section */}
                    {player.effects.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon name="sparkles" size="sm" className="text-cyan-400" />
                                <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                                    {t.ui.effects}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {player.effects.map((effectInstance, index) => {
                                    const effect = getEffect(effectInstance.type);
                                    const effectKey = effectInstance.type as keyof typeof t.effects;
                                    const effectName = t.effects[effectKey] ?? effect?.name ?? effectInstance.type;

                                    return (
                                        <div
                                            key={`${effectInstance.type}-${index}`}
                                            className="bg-white/5 rounded-lg p-3 border border-white/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge variant="effect">{effectName}</Badge>
                                            </div>
                                            {effect?.description && (
                                                <p className="text-parchment-400 text-xs mt-2">
                                                    {effect.description}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Win Condition */}
                    {winCondition && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon name="trophy" size="sm" className={isEvil ? "text-red-400" : "text-mystic-gold"} />
                                <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                                    {t.common.winCondition}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    "rounded-lg p-4 border",
                                    isEvil
                                        ? "bg-red-950/30 border-red-600/30"
                                        : "bg-mystic-gold/5 border-mystic-gold/20"
                                )}
                            >
                                <p className="text-parchment-300 text-sm leading-relaxed">
                                    {winCondition}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* See Role Card Button */}
                    {role && onShowRoleCard && (
                        <Button
                            onClick={() => {
                                onClose();
                                onShowRoleCard(player);
                            }}
                            fullWidth
                            variant="outline"
                            className="border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10"
                        >
                            <Icon name="eye" size="md" className="mr-2" />
                            {t.ui.seeRoleCard}
                        </Button>
                    )}
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
