import { useState } from "react";
import { RoleDefinition } from "../../types";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout } from "../../../../components/layouts";
import { Button, Icon } from "../../../../components/atoms";
import { isAlive } from "../../../types";
import { cn } from "../../../utils";

const definition: RoleDefinition = {
    id: "monk",
    team: "townsfolk",
    icon: "church",
    nightOrder: 20, // Monk wakes before the Demon
    skipsFirstNight: true, // Cannot protect on the first night

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

        // Can only protect other alive players (not themselves)
        const otherAlivePlayers = state.players.filter(
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
                            {
                                type: "i18n",
                                key: "roles.monk.history.protectedPlayer",
                                params: {
                                    player: player.id,
                                    target: target.id,
                                },
                            },
                        ],
                        data: {
                            roleId: "monk",
                            playerId: player.id,
                            action: "protect",
                            targetId: target.id,
                        },
                    },
                ],
                addEffects: {
                    [target.id]: [
                        {
                            type: "safe",
                            data: { source: "monk" },
                            expiresAt: "end_of_night",
                        },
                    ],
                },
            });
        };

        return (
            <NightActionLayout
                player={player}
                title={t.game.monkInfo}
                description={t.game.selectPlayerToProtect}
            >
                <div className="space-y-2 mb-6">
                    {otherAlivePlayers.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedTarget(p.id)}
                            className={cn(
                                "w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between border",
                                selectedTarget === p.id
                                    ? "bg-blue-900/50 border-blue-500/60"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon
                                    name="user"
                                    size="md"
                                    className={selectedTarget === p.id ? "text-blue-300" : "text-parchment-400"}
                                />
                                <span className="text-parchment-100 font-medium">{p.name}</span>
                            </div>
                            {selectedTarget === p.id && (
                                <Icon name="shield" size="md" className="text-blue-300" />
                            )}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleConfirm}
                    disabled={!selectedTarget}
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 font-tarot uppercase tracking-wider"
                >
                    <Icon name="shield" size="md" className="mr-2" />
                    {t.common.iUnderstandMyRole}
                </Button>
            </NightActionLayout>
        );
    },
};

export default definition;
