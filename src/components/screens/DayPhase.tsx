import { useState } from "react";
import { GameState, hasEffect, getAlivePlayers } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { useI18n } from "../../lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Icon } from "../atoms";

type Props = {
    state: GameState;
    onNominate: (nominatorId: string, nomineeId: string) => void;
    onEndDay: () => void;
};

export function DayPhase({ state, onNominate, onEndDay }: Props) {
    const { t } = useI18n();
    const [nominator, setNominator] = useState<string | null>(null);
    const [nominee, setNominee] = useState<string | null>(null);

    const alivePlayers = getAlivePlayers(state);

    const handleNominate = () => {
        if (nominator && nominee) {
            onNominate(nominator, nominee);
            setNominator(null);
            setNominee(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-600 to-orange-700 p-4">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <Card>
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-2">
                            <Icon name="sun" size="3xl" className="text-yellow-300" />
                        </div>
                        <CardTitle>{t.game.day} {state.round}</CardTitle>
                        <CardDescription>{t.game.discussionAndNominations}</CardDescription>
                    </CardHeader>
                </Card>

                {/* Player Status */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Icon name="userRound" size="md" />
                            {t.common.players}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                        className={`flex items-center justify-between p-2 rounded-lg ${
                                            isDead
                                                ? "bg-gray-800/50 text-gray-400"
                                                : "bg-white/10 text-white"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isDead && <Icon name="skull" size="sm" />}
                                            {player.name}
                                        </span>
                                        {role && (
                                            <Badge variant={isDead ? "dead" : teamVariant}>
                                                <Icon name={role.icon} size="sm" />
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Nomination Section */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{t.game.newNomination}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Nominator */}
                        <div>
                            <label className="text-white/70 text-sm block mb-1">
                                {t.game.whoIsNominating}
                            </label>
                            <select
                                value={nominator ?? ""}
                                onChange={(e) =>
                                    setNominator(e.target.value || null)
                                }
                                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="" className="bg-gray-800">
                                    {t.game.selectNominator}
                                </option>
                                {alivePlayers.map((p) => (
                                    <option
                                        key={p.id}
                                        value={p.id}
                                        className="bg-gray-800"
                                    >
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nominee */}
                        <div>
                            <label className="text-white/70 text-sm block mb-1">
                                {t.game.whoAreTheyNominating}
                            </label>
                            <select
                                value={nominee ?? ""}
                                onChange={(e) =>
                                    setNominee(e.target.value || null)
                                }
                                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="" className="bg-gray-800">
                                    {t.game.selectNominee}
                                </option>
                                {alivePlayers
                                    .filter((p) => p.id !== nominator)
                                    .map((p) => (
                                        <option
                                            key={p.id}
                                            value={p.id}
                                            className="bg-gray-800"
                                        >
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <Button
                            onClick={handleNominate}
                            disabled={!nominator || !nominee}
                            fullWidth
                            variant="danger"
                        >
                            {t.game.startNomination}
                        </Button>
                    </CardContent>
                </Card>

                {/* End Day Button */}
                <Button onClick={onEndDay} fullWidth size="lg">
                    {t.game.endDayGoToNight}
                </Button>
            </div>
        </div>
    );
}
