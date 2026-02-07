import { useState } from "react";
import { RoleDefinition } from "../../types";
import { getRole, isPerceivedEvil, filterPlayersWithAlignmentRegistration } from "../../index";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout, NarratorSetupLayout } from "../../../../components/layouts";
import { RoleRevealBadge, StepSection, AlignmentRegistrationPrompt } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";
import { GameState, isAlive } from "../../../types";

type Phase = "registration_setup" | "player_view";

/**
 * Calculate the number of pairs of evil players sitting next to each other.
 * Uses the generic `isPerceivedEvil` to account for registration overrides.
 */
function countEvilPairs(
    state: GameState,
    getRoleFn: typeof getRole,
    overrides?: Record<string, boolean>
): number {
    const alivePlayers = state.players.filter(isAlive);
    if (alivePlayers.length < 2) return 0;

    const aliveIndices = state.players
        .map((p, i) => (isAlive(p) ? i : -1))
        .filter((i) => i !== -1);

    let evilPairs = 0;

    for (let i = 0; i < aliveIndices.length; i++) {
        const currentIdx = aliveIndices[i];
        const nextIdx = aliveIndices[(i + 1) % aliveIndices.length];

        const currentPlayer = state.players[currentIdx];
        const nextPlayer = state.players[nextIdx];

        const currentRole = getRoleFn(currentPlayer.roleId);
        const nextRole = getRoleFn(nextPlayer.roleId);

        const currentIsEvil = currentRole
            ? isPerceivedEvil(currentRole, currentPlayer, overrides)
            : false;
        const nextIsEvil = nextRole
            ? isPerceivedEvil(nextRole, nextPlayer, overrides)
            : false;

        if (currentIsEvil && nextIsEvil) {
            evilPairs++;
        }
    }

    return evilPairs;
}

const definition: RoleDefinition = {
    id: "chef",
    team: "townsfolk",
    icon: "chefHat",
    nightOrder: 13,
    shouldWake: (game, player) =>
        isAlive(player) && game.history.at(-1)?.stateAfter.round === 1,

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();

        // Check if any alive player has alignment registration
        const alivePlayers = state.players.filter(isAlive);
        const playersWithRegistration = filterPlayersWithAlignmentRegistration(
            alivePlayers,
            getRole
        );
        const hasRegistration = playersWithRegistration.length > 0;

        const [phase, setPhase] = useState<Phase>(
            hasRegistration ? "registration_setup" : "player_view"
        );
        const [registrationOverrides, setRegistrationOverrides] = useState<
            Record<string, boolean>
        >({});

        // Calculate evil pairs with overrides
        const evilPairs = countEvilPairs(
            state,
            getRole,
            hasRegistration ? registrationOverrides : undefined
        );

        const handleComplete = () => {
            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.chef.history.sawEvilPairs",
                                params: {
                                    player: player.id,
                                    count: evilPairs.toString(),
                                },
                            },
                        ],
                        data: {
                            roleId: "chef",
                            playerId: player.id,
                            action: "count_evil_pairs",
                            evilPairs,
                            registrationOverrides:
                                Object.keys(registrationOverrides).length > 0
                                    ? registrationOverrides
                                    : undefined,
                        },
                    },
                ],
            });
        };

        const getRoleName = (roleId: string) => {
            const key = roleId as keyof typeof t.roles;
            return t.roles[key]?.name ?? roleId;
        };

        const getPlayerName = (playerId: string) => {
            return (
                state.players.find((p) => p.id === playerId)?.name ?? "Unknown"
            );
        };

        // Registration Setup Phase
        if (phase === "registration_setup") {
            return (
                <NarratorSetupLayout
                    icon="chefHat"
                    roleName={getRoleName("chef")}
                    playerName={getPlayerName(player.id)}
                    onShowToPlayer={() => setPhase("player_view")}
                >
                    <StepSection step={1} label={t.game.reclusePrompt}>
                        <AlignmentRegistrationPrompt
                            players={playersWithRegistration}
                            values={registrationOverrides}
                            onChange={(id, val) =>
                                setRegistrationOverrides((prev) => ({
                                    ...prev,
                                    [id]: val,
                                }))
                            }
                        />
                    </StepSection>
                </NarratorSetupLayout>
            );
        }

        // Player View Phase
        return (
            <NightActionLayout
                player={player}
                title={t.game.chefInfo}
                description={t.game.evilPairsExplanation}
            >
                <div className="text-center mb-6">
                    <p className="text-parchment-400 text-sm mb-4">
                        {t.game.evilPairsCount}
                    </p>
                    <RoleRevealBadge
                        icon="chefHat"
                        roleName={evilPairs.toString()}
                    />
                </div>

                <Button
                    onClick={handleComplete}
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 font-tarot uppercase tracking-wider"
                >
                    <Icon name="check" size="md" className="mr-2" />
                    {t.common.iUnderstandMyRole}
                </Button>
            </NightActionLayout>
        );
    },
};

export default definition;
