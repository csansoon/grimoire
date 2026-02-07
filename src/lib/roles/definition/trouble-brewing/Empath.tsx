import { useState } from "react";
import { RoleDefinition } from "../../types";
import { getRole, isPerceivedEvil, filterPlayersWithAlignmentRegistration } from "../../index";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout, NarratorSetupLayout } from "../../../../components/layouts";
import { RoleRevealBadge, StepSection, AlignmentRegistrationPrompt } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";
import { getAliveNeighbors, isAlive } from "../../../types";

type Phase = "registration_setup" | "player_view";

const definition: RoleDefinition = {
    id: "empath",
    team: "townsfolk",
    icon: "handHeart",
    nightOrder: 14,
    shouldWake: (_game, player) => isAlive(player),

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();

        // Get alive neighbors
        const [leftNeighbor, rightNeighbor] = getAliveNeighbors(state, player.id);

        // Collect unique neighbors
        const neighbors = [leftNeighbor, rightNeighbor].filter(
            (n, i, arr) => n !== null && (i === 0 || n.id !== arr[0]?.id)
        ) as import("../../../types").PlayerState[];

        // Check if any neighbor has alignment registration overrides
        const neighborsWithRegistration = filterPlayersWithAlignmentRegistration(
            neighbors,
            getRole
        );
        const hasRegistrationNeighbors = neighborsWithRegistration.length > 0;

        const [phase, setPhase] = useState<Phase>(
            hasRegistrationNeighbors ? "registration_setup" : "player_view"
        );
        const [registrationOverrides, setRegistrationOverrides] = useState<
            Record<string, boolean>
        >({});

        // Calculate evil neighbors using the generic perceived-evil check
        const calculateEvilNeighbors = () => {
            let evilNeighbors = 0;
            for (const neighbor of neighbors) {
                const role = getRole(neighbor.roleId);
                if (role && isPerceivedEvil(role, neighbor, registrationOverrides)) {
                    evilNeighbors++;
                }
            }
            return evilNeighbors;
        };

        const evilNeighbors = calculateEvilNeighbors();

        const handleComplete = () => {
            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.empath.history.sawEvilNeighbors",
                                params: {
                                    player: player.id,
                                    count: evilNeighbors.toString(),
                                },
                            },
                        ],
                        data: {
                            roleId: "empath",
                            playerId: player.id,
                            action: "count_evil_neighbors",
                            evilNeighbors,
                            leftNeighborId: leftNeighbor?.id,
                            rightNeighborId: rightNeighbor?.id,
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
                    icon="handHeart"
                    roleName={getRoleName("empath")}
                    playerName={getPlayerName(player.id)}
                    onShowToPlayer={() => setPhase("player_view")}
                >
                    <StepSection step={1} label={t.game.reclusePrompt}>
                        <AlignmentRegistrationPrompt
                            players={neighborsWithRegistration}
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
                title={t.game.empathInfo}
                description={t.game.evilNeighborsExplanation}
            >
                <div className="text-center mb-6">
                    <p className="text-parchment-400 text-sm mb-4">
                        {t.game.evilNeighborsCount}
                    </p>
                    <RoleRevealBadge
                        icon="handHeart"
                        roleName={evilNeighbors.toString()}
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
