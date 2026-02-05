import { useState } from "react";
import { RoleDefinition } from "../types";
import { isAlive } from "../../types";
import { useI18n } from "../../i18n";
import { RoleCard } from "../../../components/items/RoleCard";
import { NightActionLayout } from "../../../components/layouts/NightActionLayout";
import { Button, Icon } from "../../../components/atoms";
import { cn } from "../../utils";

const definition: RoleDefinition = {
    id: "imp",
    name: "Imp",
    description:
        "Each night*, choose a player: they die. If you kill yourself, a Minion becomes the Imp.",
    team: "demon",
    icon: "skull",
    nightOrder: 50,
    skipsFirstNight: true,

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

        const alivePlayers = state.players.filter(
            (p) => isAlive(p) && p.id !== player.id
        );

        const handleConfirm = () => {
            if (!selectedTarget) return;

            const target = state.players.find((p) => p.id === selectedTarget);
            if (!target) return;

            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            { type: "player", playerId: player.id },
                            { type: "text", content: " (" },
                            { type: "role", roleId: "imp" },
                            { type: "text", content: ") chose to kill " },
                            { type: "player", playerId: target.id },
                        ],
                        data: {
                            roleId: "imp",
                            playerId: player.id,
                            action: "kill",
                            targetId: target.id,
                        },
                    },
                ],
                addEffects: {
                    [target.id]: [{ type: "dead", data: { cause: "imp" } }],
                },
            });
        };

        return (
            <NightActionLayout
                player={player}
                title={t.game.choosePlayerToKill}
                description={t.game.selectVictim}
            >
                <div className="space-y-2 mb-6">
                    {alivePlayers.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedTarget(p.id)}
                            className={cn(
                                "w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between border",
                                selectedTarget === p.id
                                    ? "bg-red-900/50 border-red-600/60"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon
                                    name="user"
                                    size="md"
                                    className={selectedTarget === p.id ? "text-red-400" : "text-parchment-400"}
                                />
                                <span className="text-parchment-100 font-medium">{p.name}</span>
                            </div>
                            {selectedTarget === p.id && (
                                <Icon name="skull" size="md" className="text-red-400" />
                            )}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleConfirm}
                    disabled={!selectedTarget}
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-red-700 to-red-900 font-tarot uppercase tracking-wider"
                >
                    <Icon name="skull" size="md" className="mr-2" />
                    {t.game.confirmKill}
                </Button>
            </NightActionLayout>
        );
    },
};

export default definition;
