import { useState } from "react";
import { RoleDefinition } from "../../types";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout } from "../../../../components/layouts";
import { PlayerSelector } from "../../../../components/inputs";
import { Button, Icon } from "../../../../components/atoms";
import { isAlive } from "../../../types";

const definition: RoleDefinition = {
    id: "monk",
    team: "townsfolk",
    icon: "church",
    nightOrder: 20, // Monk wakes before the Demon
    shouldWake: (game, player) => isAlive(player) && (game.history.at(-1)?.stateAfter.round ?? 0) > 1,

    RoleReveal: ({ player, onContinue, context }) => (
        <RoleCard roleId={player.roleId} onContinue={onContinue} context={context} />
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
                <div className="mb-6">
                    <PlayerSelector
                        players={otherAlivePlayers}
                        selected={selectedTarget}
                        onSelect={setSelectedTarget}
                        selectedIcon="shield"
                        variant="blue"
                    />
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
