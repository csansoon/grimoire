import { useState } from "react";
import { RoleDefinition } from "../types";
import { isAlive } from "../../types";
import { useI18n } from "../../i18n";
import { DefaultRoleReveal } from "../../../components/items/DefaultRoleReveal";
import { NightActionLayout } from "../../../components/layouts/NightActionLayout";
import { PlayerSelector } from "../../../components/inputs";
import { Button, Icon } from "../../../components/atoms";

/**
 * The Imp — Demon role.
 *
 * Simplified: the Imp just selects a target and emits a kill intent.
 * All effect interactions (Safe protection, Bounce redirect) are handled
 * by the pipeline through effect handlers. The Imp has zero knowledge
 * of other roles.
 */
const definition: RoleDefinition = {
    id: "imp",
    team: "demon",
    icon: "skull",
    nightOrder: 30,
    shouldWake: (game, player) =>
        isAlive(player) &&
        (game.history.at(-1)?.stateAfter.round ?? 0) > 1,

    RoleReveal: DefaultRoleReveal,

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [selectedTarget, setSelectedTarget] = useState<string | null>(
            null
        );

        const alivePlayers = state.players.filter((p) => isAlive(p));

        const handleConfirm = () => {
            if (!selectedTarget) return;

            const target = state.players.find(
                (p) => p.id === selectedTarget
            );
            if (!target) return;

            onComplete({
                // Log the Imp's choice (always recorded regardless of outcome)
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.imp.history.choseToKill",
                                params: {
                                    player: player.id,
                                    target: target.id,
                                },
                            },
                        ],
                        data: {
                            roleId: "imp",
                            playerId: player.id,
                            action: "kill",
                            targetId: target.id,
                        },
                    },
                ],
                // Emit intent — pipeline handles safe/bounce/death
                intent: {
                    type: "kill",
                    sourceId: player.id,
                    targetId: target.id,
                    cause: "demon",
                },
            });
        };

        return (
            <NightActionLayout
                player={player}
                title={t.game.choosePlayerToKill}
                description={t.game.selectVictim}
            >
                <div className="mb-6">
                    <PlayerSelector
                        players={alivePlayers}
                        selected={selectedTarget}
                        onSelect={setSelectedTarget}
                        selectedIcon="skull"
                        variant="red"
                    />
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
