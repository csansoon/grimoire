import { useMemo } from "react";
import { Game, GameState, PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { useI18n } from "../../lib/i18n";
import { Button, Icon } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    game: Game;
    state: GameState;
    onRevealRole: (playerId: string) => void;
    onStartNight: () => void;
    onMainMenu: () => void;
};

export function RoleRevelationScreen({
    game,
    state,
    onRevealRole,
    onStartNight,
    onMainMenu,
}: Props) {
    const { t } = useI18n();

    const revealedPlayerIds = useMemo(() => {
        return new Set(
            game.history
                .filter((e) => e.type === "role_revealed")
                .map((e) => e.data.playerId as string),
        );
    }, [game.history]);

    const allRevealed = state.players.every((p) =>
        revealedPlayerIds.has(p.id),
    );

    const revealedCount = state.players.filter((p) =>
        revealedPlayerIds.has(p.id),
    ).length;

    return (
        <div className="min-h-app bg-gradient-to-b from-grimoire-purple via-grimoire-dark to-grimoire-darker flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-mystic-gold/10 to-transparent px-4 py-4">
                <div className="max-w-lg mx-auto">
                    {/* Back button row */}
                    <div className="flex items-center mb-4">
                        <button
                            onClick={onMainMenu}
                            className="p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                        >
                            <Icon name="arrowLeft" size="md" />
                        </button>
                        <span className="text-parchment-500 text-xs ml-1">
                            {t.common.mainMenu}
                        </span>
                    </div>

                    {/* Title section */}
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <Icon
                                name="eye"
                                size="3xl"
                                className="text-mystic-gold text-glow-gold"
                            />
                        </div>
                        <h1 className="font-tarot text-2xl text-parchment-100 tracking-widest-xl uppercase">
                            {t.game.roleRevelation}
                        </h1>
                        <p className="text-parchment-400 text-sm">
                            {t.game.roleRevelationDescription}
                        </p>
                        <p className="text-parchment-500 text-xs mt-1">
                            {revealedCount} / {state.players.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Player List */}
            <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full overflow-y-auto">
                <div className="space-y-1">
                    {state.players.map((player) => {
                        const isRevealed = revealedPlayerIds.has(player.id);
                        return (
                            <PlayerRevealRow
                                key={player.id}
                                player={player}
                                isRevealed={isRevealed}
                                onClick={() => onRevealRole(player.id)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-mystic-gold/20 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={onStartNight}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-700 font-tarot uppercase tracking-wider"
                    >
                        <Icon name="moon" size="md" className="mr-2" />
                        {t.game.startFirstNight}
                    </Button>
                    {!allRevealed && (
                        <button
                            onClick={onStartNight}
                            className="w-full mt-3 text-center text-parchment-600 text-xs hover:text-parchment-400 transition-colors"
                        >
                            {t.game.skipRoleRevelation}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function PlayerRevealRow({
    player,
    isRevealed,
    onClick,
}: {
    player: PlayerState;
    isRevealed: boolean;
    onClick: () => void;
}) {
    const { t } = useI18n();
    const role = getRole(player.roleId);
    const team = role ? getTeam(role.team) : null;

    const roleName = useMemo(() => {
        const key = player.roleId as keyof typeof t.roles;
        return t.roles[key]?.name ?? player.roleId;
    }, [player.roleId, t.roles]);

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group",
                isRevealed
                    ? "bg-white/5 hover:bg-white/8"
                    : "bg-mystic-gold/5 hover:bg-mystic-gold/10 border border-mystic-gold/20",
            )}
        >
            {/* Role Icon */}
            <div
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border",
                    isRevealed
                        ? "bg-parchment-500/10 border-parchment-500/20"
                        : team?.isEvil
                            ? "bg-red-900/30 border-red-600/30"
                            : "bg-mystic-gold/10 border-mystic-gold/20",
                )}
            >
                {role ? (
                    <Icon
                        name={role.icon}
                        size="md"
                        className={cn(
                            isRevealed
                                ? "text-parchment-500"
                                : team?.colors.text,
                        )}
                    />
                ) : (
                    <Icon
                        name="user"
                        size="md"
                        className="text-parchment-400"
                    />
                )}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
                <div
                    className={cn(
                        "font-medium text-sm",
                        isRevealed
                            ? "text-parchment-400"
                            : "text-parchment-100",
                    )}
                >
                    {player.name}
                </div>
                {role && (
                    <span
                        className={cn(
                            "text-xs",
                            isRevealed
                                ? "text-parchment-600"
                                : team?.colors.text,
                        )}
                    >
                        {roleName}
                    </span>
                )}
            </div>

            {/* Status */}
            {isRevealed ? (
                <div className="flex items-center gap-1 text-emerald-500">
                    <Icon name="checkCircle" size="md" />
                    <span className="text-xs">{t.game.revealed}</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-mystic-gold group-hover:text-mystic-gold/80">
                    <Icon name="eye" size="md" />
                </div>
            )}
        </button>
    );
}
