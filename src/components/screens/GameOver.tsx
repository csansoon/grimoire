import { GameState, hasEffect } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { useI18n } from "../../lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Icon } from "../atoms";
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
                "min-h-screen flex items-center justify-center p-6 bg-gradient-to-br",
                isGoodWin ? "from-blue-600 to-indigo-800" : "from-red-800 to-black"
            )}
        >
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {isGoodWin ? (
                            <Icon name="trophy" size="4xl" className="text-yellow-400" />
                        ) : (
                            <Icon name="skull" size="4xl" className="text-red-400" />
                        )}
                    </div>
                    <CardTitle className="text-4xl">
                        {isGoodWin ? t.game.goodWins : t.game.evilWins}
                    </CardTitle>
                    <p className="text-white/70 mt-2">
                        {isGoodWin
                            ? t.game.townVanquishedDemon
                            : t.game.demonConqueredTown}
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Final Player Status */}
                    <div className="bg-white/5 rounded-xl p-4">
                        <h2 className="text-white font-semibold mb-3 text-center">
                            {t.game.finalRoles}
                        </h2>
                        <div className="space-y-2">
                            {state.players.map((player) => {
                                const role = getRole(player.roleId);
                                const isDead = hasEffect(player, "dead");
                                const teamVariant = role?.team as
                                    | "townsfolk"
                                    | "outsider"
                                    | "minion"
                                    | "demon"
                                    | undefined;

                                return (
                                    <div
                                        key={player.id}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-lg",
                                            isDead
                                                ? "bg-gray-800/50 text-gray-400"
                                                : "bg-white/10 text-white"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isDead && <Icon name="skull" size="sm" />}
                                            {player.name}
                                        </span>
                                        {role && (
                                            <Badge variant={teamVariant} className="inline-flex items-center gap-1">
                                                <Icon name={role.icon} size="xs" /> {getRoleName(role.id)}
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button onClick={onMainMenu} fullWidth variant="secondary" size="lg">
                        {t.game.backToMainMenu}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
