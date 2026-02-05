import { useState } from "react";
import { RoleDefinition } from "../../types";
import { getRole } from "../../index";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout, NarratorSetupLayout } from "../../../../components/layouts";
import {
    StepSection,
    AlertBox,
    PlayerNameCard,
    RoleRevealBadge,
    MysticDivider,
    InfoBox,
} from "../../../../components/items";
import { SelectablePlayerItem, SelectableRoleItem } from "../../../../components/inputs";
import { Button, Icon } from "../../../../components/atoms";

type Phase = "narrator_setup" | "player_view" | "no_outsiders_view";

const definition: RoleDefinition = {
    id: "librarian",
    team: "townsfolk",
    icon: "bookMarked",
    nightOrder: 11,
    firstNightOnly: true,

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [phase, setPhase] = useState<Phase>("narrator_setup");
        const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
        const [selectedOutsider, setSelectedOutsider] = useState<string | null>(null);

        const otherPlayers = state.players.filter((p) => p.id !== player.id);

        const outsidersInGame = state.players.filter((p) => {
            const role = getRole(p.roleId);
            return role?.team === "outsider";
        });

        const hasOutsiders = outsidersInGame.length > 0;

        const outsidersInSelection = selectedPlayers.filter((playerId) => {
            const p = state.players.find((pl) => pl.id === playerId);
            if (!p) return false;
            const role = getRole(p.roleId);
            return role?.team === "outsider";
        });

        const canProceedToPlayer =
            selectedPlayers.length === 2 &&
            outsidersInSelection.length >= 1 &&
            selectedOutsider !== null;

        const handlePlayerToggle = (playerId: string) => {
            setSelectedPlayers((prev) => {
                if (prev.includes(playerId)) {
                    if (playerId === selectedOutsider) {
                        setSelectedOutsider(null);
                    }
                    return prev.filter((id) => id !== playerId);
                } else if (prev.length < 2) {
                    return [...prev, playerId];
                }
                return prev;
            });
        };

        const handleShowToPlayer = () => {
            if (!hasOutsiders) {
                setPhase("no_outsiders_view");
                return;
            }
            if (!canProceedToPlayer) return;
            setPhase("player_view");
        };

        const handleCompleteNoOutsiders = () => {
            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.librarian.history.noOutsiders",
                                params: { player: player.id },
                            },
                        ],
                        data: {
                            roleId: "librarian",
                            playerId: player.id,
                            action: "no_outsiders",
                        },
                    },
                ],
            });
        };

        const handleComplete = () => {
            if (!selectedOutsider) return;

            const outsiderPlayer = state.players.find((p) => p.id === selectedOutsider);
            if (!outsiderPlayer) return;

            const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
            const player2 = state.players.find((p) => p.id === selectedPlayers[1]);
            if (!player1 || !player2) return;

            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.librarian.history.discoveredOutsider",
                                params: {
                                    player: player.id,
                                    player1: player1.id,
                                    player2: player2.id,
                                    role: outsiderPlayer.roleId,
                                },
                            },
                        ],
                        data: {
                            roleId: "librarian",
                            playerId: player.id,
                            action: "see_outsider",
                            shownPlayers: selectedPlayers,
                            outsiderId: selectedOutsider,
                            outsiderRoleId: outsiderPlayer.roleId,
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
            return state.players.find((p) => p.id === playerId)?.name ?? "Unknown";
        };

        // Narrator Setup Phase - No Outsiders
        if (phase === "narrator_setup" && !hasOutsiders) {
            return (
                <NarratorSetupLayout
                    icon="bookMarked"
                    roleName={getRoleName("librarian")}
                    playerName={getPlayerName(player.id)}
                    onShowToPlayer={handleShowToPlayer}
                    showToPlayerLabel={t.game.confirmNoOutsiders}
                >
                    <div className="flex-1 flex items-center justify-center">
                        <InfoBox
                            icon="bookMarked"
                            title={t.game.noOutsidersInGame}
                            description={t.game.noOutsidersMessage}
                        />
                    </div>
                </NarratorSetupLayout>
            );
        }

        // Narrator Setup Phase - Normal
        if (phase === "narrator_setup") {
            return (
                <NarratorSetupLayout
                    icon="bookMarked"
                    roleName={getRoleName("librarian")}
                    playerName={getPlayerName(player.id)}
                    onShowToPlayer={handleShowToPlayer}
                    showToPlayerDisabled={!canProceedToPlayer}
                >
                    <StepSection
                        step={1}
                        label={t.game.selectTwoPlayers}
                        count={{ current: selectedPlayers.length, max: 2 }}
                    >
                        {otherPlayers.map((p) => {
                            const role = getRole(p.roleId);
                            const isSelected = selectedPlayers.includes(p.id);
                            const isOutsider = role?.team === "outsider";

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={getRoleName(p.roleId)}
                                    roleIcon={role?.icon ?? "user"}
                                    isSelected={isSelected}
                                    isDisabled={!isSelected && selectedPlayers.length >= 2}
                                    highlightTeam={isOutsider ? "outsider" : undefined}
                                    teamLabel={isOutsider ? t.teams.outsider.name : undefined}
                                    onClick={() => handlePlayerToggle(p.id)}
                                />
                            );
                        })}
                    </StepSection>

                    {selectedPlayers.length === 2 && outsidersInSelection.length > 0 && (
                        <StepSection step={2} label={t.game.selectWhichRoleToShow}>
                            {outsidersInSelection.map((playerId) => {
                                const p = state.players.find((pl) => pl.id === playerId);
                                if (!p) return null;
                                const role = getRole(p.roleId);

                                return (
                                    <SelectableRoleItem
                                        key={playerId}
                                        playerName={p.name}
                                        roleName={getRoleName(p.roleId)}
                                        roleIcon={role?.icon ?? "user"}
                                        isSelected={selectedOutsider === playerId}
                                        onClick={() => setSelectedOutsider(playerId)}
                                    />
                                );
                            })}
                        </StepSection>
                    )}

                    {selectedPlayers.length === 2 && outsidersInSelection.length === 0 && (
                        <AlertBox message={t.game.mustIncludeOutsider} />
                    )}
                </NarratorSetupLayout>
            );
        }

        // No Outsiders View Phase
        if (phase === "no_outsiders_view") {
            return (
                <NightActionLayout
                    player={player}
                    title={t.game.librarianInfo}
                    description={t.game.noOutsidersMessage}
                >
                    <RoleRevealBadge
                        icon="sparkles"
                        roleName={t.game.noOutsidersInGame}
                    />

                    <Button
                        onClick={handleCompleteNoOutsiders}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 font-tarot uppercase tracking-wider"
                    >
                        <Icon name="check" size="md" className="mr-2" />
                        {t.common.iUnderstandMyRole}
                    </Button>
                </NightActionLayout>
            );
        }

        // Player View Phase
        const outsiderPlayer = state.players.find((p) => p.id === selectedOutsider);
        const outsiderRole = outsiderPlayer ? getRole(outsiderPlayer.roleId) : null;
        const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
        const player2 = state.players.find((p) => p.id === selectedPlayers[1]);

        return (
            <NightActionLayout
                player={player}
                title={t.game.librarianInfo}
                description={t.game.oneOfTheseIsTheOutsider}
            >
                <div className="space-y-3 mb-6">
                    {player1 && <PlayerNameCard name={player1.name} />}
                    {player2 && <PlayerNameCard name={player2.name} />}
                </div>

                <MysticDivider />

                {outsiderRole && (
                    <RoleRevealBadge
                        icon={outsiderRole.icon}
                        roleName={getRoleName(outsiderRole.id)}
                        label={t.game.oneOfThemIsThe}
                    />
                )}

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
