import { GameState, hasEffect } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { useI18n } from "../../lib/i18n";
import { Button, Badge, Icon } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    state: GameState;
    onMainMenu: () => void;
};

export function GameOver({ state, onMainMenu }: Props) {
    const { t } = useI18n();
    const winner = state.winner;
    const isGoodWin = winner === "townsfolk";

    const getRoleName = (roleId: string) => {
        const role = getRole(roleId);
        if (!role) return roleId;
        const translationKey = roleId as keyof typeof t.roles;
        return t.roles[translationKey]?.name ?? role.name;
    };

    return (
        <div
            className={cn(
                "min-h-screen flex flex-col bg-gradient-to-b",
                isGoodWin
                    ? "from-indigo-950 via-blue-950 to-grimoire-dark"
                    : "from-red-950 via-grimoire-blood to-grimoire-darker"
            )}
        >
            {/* Victory Banner */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="text-center">
                    {/* Icon */}
                    <div className="mb-6">
                        <div
                            className={cn(
                                "w-28 h-28 mx-auto rounded-full flex items-center justify-center border-2",
                                isGoodWin
                                    ? "bg-mystic-gold/10 border-mystic-gold/40"
                                    : "bg-red-900/30 border-red-600/40"
                            )}
                        >
                            {isGoodWin ? (
                                <Icon name="trophy" size="4xl" className="text-mystic-gold text-glow-gold" />
                            ) : (
                                <Icon name="skull" size="4xl" className="text-red-500 text-glow-crimson" />
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h1
                        className={cn(
                            "font-tarot text-4xl font-bold tracking-widest-xl uppercase mb-3",
                            isGoodWin ? "text-parchment-100" : "text-red-400 text-glow-crimson"
                        )}
                    >
                        {isGoodWin ? t.game.goodWins : t.game.evilWins}
                    </h1>
                    <p className="text-parchment-400 text-sm mb-8">
                        {isGoodWin ? t.game.townVanquishedDemon : t.game.demonConqueredTown}
                    </p>

                    {/* Divider */}
                    <div className="divider-mystic mb-6">
                        <Icon
                            name={isGoodWin ? "sparkles" : "skull"}
                            size="sm"
                            className={isGoodWin ? "text-mystic-gold/40" : "text-red-500/40"}
                        />
                    </div>

                    {/* Final Roles */}
                    <div className="max-w-sm mx-auto">
                        <h2 className="font-tarot text-sm text-parchment-400 tracking-wider uppercase mb-4">
                            {t.game.finalRoles}
                        </h2>
                        <div className="space-y-2">
                            {state.players.map((player) => {
                                const role = getRole(player.roleId);
                                const isDead = hasEffect(player, "dead");

                                return (
                                    <div
                                        key={player.id}
                                        className={cn(
                                            "flex items-center justify-between py-2 px-3 rounded-lg",
                                            isDead ? "opacity-50" : ""
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isDead && <Icon name="skull" size="sm" className="text-parchment-500" />}
                                            <span className={cn("text-sm", isDead ? "text-parchment-500" : "text-parchment-200")}>
                                                {player.name}
                                            </span>
                                        </span>
                                        {role && (
                                            <Badge variant={role.team} className="inline-flex items-center gap-1">
                                                <Icon name={role.icon} size="xs" /> {getRoleName(role.id)}
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-8 max-w-lg mx-auto w-full">
                <Button
                    onClick={onMainMenu}
                    fullWidth
                    size="lg"
                    className={cn(
                        "font-tarot uppercase tracking-wider bg-gradient-to-r",
                        isGoodWin
                            ? "from-mystic-gold to-mystic-bronze text-grimoire-dark"
                            : "from-red-700 to-red-900 text-white"
                    )}
                >
                    {t.game.backToMainMenu}
                </Button>
            </div>
        </div>
    );
}
