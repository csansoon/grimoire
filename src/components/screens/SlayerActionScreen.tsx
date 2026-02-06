import { useState } from "react";
import { isAlive } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { useI18n } from "../../lib/i18n";
import { DayActionProps } from "../../lib/pipeline/types";
import { Button, Icon } from "../atoms";
import { MysticDivider } from "../items";

/**
 * Day action component for the Slayer's ability.
 * The Slayer picks a target to shoot. If the target is the Demon, they die.
 */
export function SlayerActionScreen({
    state,
    playerId,
    onComplete,
    onBack,
}: DayActionProps) {
    const { t } = useI18n();
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

    const slayer = state.players.find((p) => p.id === playerId);
    const alivePlayers = state.players.filter((p) => isAlive(p));

    const handleConfirm = () => {
        if (!selectedTarget || !slayer) return;

        const target = state.players.find((p) => p.id === selectedTarget);
        if (!target) return;

        const targetRole = getRole(target.roleId);
        const isDemon = targetRole?.team === "demon";

        if (isDemon) {
            onComplete({
                entries: [
                    {
                        type: "slayer_shot",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.slayer.history.killedDemon",
                                params: {
                                    slayer: playerId,
                                    target: selectedTarget,
                                },
                            },
                        ],
                        data: {
                            slayerId: playerId,
                            targetId: selectedTarget,
                            hit: true,
                        },
                    },
                ],
                addEffects: {
                    [selectedTarget]: [
                        { type: "dead", expiresAt: "never" },
                    ],
                },
                removeEffects: { [playerId]: ["slayer_bullet"] },
            });
        } else {
            onComplete({
                entries: [
                    {
                        type: "slayer_shot",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.slayer.history.missed",
                                params: {
                                    slayer: playerId,
                                    target: selectedTarget,
                                },
                            },
                        ],
                        data: {
                            slayerId: playerId,
                            targetId: selectedTarget,
                            hit: false,
                        },
                    },
                ],
                removeEffects: { [playerId]: ["slayer_bullet"] },
            });
        }
    };

    return (
        <div className="min-h-app bg-gradient-to-b from-amber-950 via-orange-950 to-grimoire-dark flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-amber-900/50 to-transparent px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                        >
                            <Icon name="arrowLeft" size="md" />
                        </button>
                        <span className="text-parchment-500 text-xs ml-1">
                            {t.common.back}
                        </span>
                    </div>

                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <Icon
                                name="crosshair"
                                size="3xl"
                                className="text-red-400 text-glow-red"
                            />
                        </div>
                        <h1 className="font-tarot text-2xl text-parchment-100 tracking-widest-xl uppercase">
                            {t.game.slayerAction}
                        </h1>
                        <p className="text-parchment-400 text-sm">
                            {t.game.slayerActionDescription}
                        </p>
                        {slayer && (
                            <p className="text-amber-400 text-sm mt-1 font-medium">
                                {slayer.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full overflow-y-auto">
                <MysticDivider className="mb-6" />

                {/* Select Target */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <span className="w-6 h-6 rounded-full bg-red-700 text-parchment-100 text-sm font-bold flex items-center justify-center">
                            1
                        </span>
                        <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                            {t.game.selectTarget}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {alivePlayers.map((player) => (
                            <button
                                key={player.id}
                                onClick={() => setSelectedTarget(player.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                    selectedTarget === player.id
                                        ? "bg-red-700/40 border-red-500"
                                        : "bg-white/5 border-white/10 hover:border-white/30"
                                }`}
                            >
                                <Icon
                                    name="user"
                                    size="md"
                                    className="text-parchment-400"
                                />
                                <span className="text-parchment-100">
                                    {player.name}
                                </span>
                                {selectedTarget === player.id && (
                                    <Icon
                                        name="check"
                                        size="md"
                                        className="text-red-400 ml-auto"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-red-500/30 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedTarget}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-red-600 to-orange-700 font-tarot uppercase tracking-wider"
                    >
                        <Icon name="crosshair" size="md" className="mr-2" />
                        {t.game.confirmSlayerShot}
                    </Button>
                </div>
            </div>
        </div>
    );
}
