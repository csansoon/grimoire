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
} from "../../../../components/items";
import { SelectablePlayerItem, SelectableRoleItem } from "../../../../components/inputs";
import { Button, Icon } from "../../../../components/atoms";

type Phase = "narrator_setup" | "player_view";

const definition: RoleDefinition = {
    id: "washerwoman",
    team: "townsfolk",
    icon: "shirt",
    nightOrder: 10,
    firstNightOnly: true,

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [phase, setPhase] = useState<Phase>("narrator_setup");
        const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
        const [selectedTownsfolk, setSelectedTownsfolk] = useState<string | null>(null);

        const otherPlayers = state.players.filter((p) => p.id !== player.id);

        const townsfolkInSelection = selectedPlayers.filter((playerId) => {
            const p = state.players.find((pl) => pl.id === playerId);
            if (!p) return false;
            const role = getRole(p.roleId);
            return role?.team === "townsfolk";
        });

        const canProceedToPlayer =
            selectedPlayers.length === 2 &&
            townsfolkInSelection.length >= 1 &&
            selectedTownsfolk !== null;

        const handlePlayerToggle = (playerId: string) => {
            setSelectedPlayers((prev) => {
                if (prev.includes(playerId)) {
                    if (playerId === selectedTownsfolk) {
                        setSelectedTownsfolk(null);
                    }
                    return prev.filter((id) => id !== playerId);
                } else if (prev.length < 2) {
                    return [...prev, playerId];
                }
                return prev;
            });
        };

        const handleShowToPlayer = () => {
            if (!canProceedToPlayer) return;
            setPhase("player_view");
        };

        const handleComplete = () => {
            if (!selectedTownsfolk) return;

            const townsfolkPlayer = state.players.find((p) => p.id === selectedTownsfolk);
            if (!townsfolkPlayer) return;

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
                                key: "roles.washerwoman.history.discoveredTownsfolk",
                                params: {
                                    player: player.id,
                                    player1: player1.id,
                                    player2: player2.id,
                                    role: townsfolkPlayer.roleId,
                                },
                            },
                        ],
                        data: {
                            roleId: "washerwoman",
                            playerId: player.id,
                            action: "see_townsfolk",
                            shownPlayers: selectedPlayers,
                            townsfolkId: selectedTownsfolk,
                            townsfolkRoleId: townsfolkPlayer.roleId,
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

        // Narrator Setup Phase
        if (phase === "narrator_setup") {
            return (
                <NarratorSetupLayout
                    icon="shirt"
                    roleName={getRoleName("washerwoman")}
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
                            const isTownsfolk = role?.team === "townsfolk";

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={getRoleName(p.roleId)}
                                    roleIcon={role?.icon ?? "user"}
                                    isSelected={isSelected}
                                    isDisabled={!isSelected && selectedPlayers.length >= 2}
                                    highlightTeam={isTownsfolk ? "townsfolk" : undefined}
                                    teamLabel={isTownsfolk ? t.teams.townsfolk.name : undefined}
                                    onClick={() => handlePlayerToggle(p.id)}
                                />
                            );
                        })}
                    </StepSection>

                    {selectedPlayers.length === 2 && townsfolkInSelection.length > 0 && (
                        <StepSection step={2} label={t.game.selectWhichRoleToShow}>
                            {townsfolkInSelection.map((playerId) => {
                                const p = state.players.find((pl) => pl.id === playerId);
                                if (!p) return null;
                                const role = getRole(p.roleId);

                                return (
                                    <SelectableRoleItem
                                        key={playerId}
                                        playerName={p.name}
                                        roleName={getRoleName(p.roleId)}
                                        roleIcon={role?.icon ?? "user"}
                                        isSelected={selectedTownsfolk === playerId}
                                        onClick={() => setSelectedTownsfolk(playerId)}
                                    />
                                );
                            })}
                        </StepSection>
                    )}

                    {selectedPlayers.length === 2 && townsfolkInSelection.length === 0 && (
                        <AlertBox message={t.game.mustIncludeTownsfolk} />
                    )}
                </NarratorSetupLayout>
            );
        }

        // Player View Phase
        const townsfolkPlayer = state.players.find((p) => p.id === selectedTownsfolk);
        const townsfolkRole = townsfolkPlayer ? getRole(townsfolkPlayer.roleId) : null;
        const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
        const player2 = state.players.find((p) => p.id === selectedPlayers[1]);

        return (
            <NightActionLayout
                player={player}
                title={t.game.washerwomanInfo}
                description={t.game.oneOfTheseIsTheTownsfolk}
            >
                <div className="space-y-3 mb-6">
                    {player1 && <PlayerNameCard name={player1.name} />}
                    {player2 && <PlayerNameCard name={player2.name} />}
                </div>

                <MysticDivider />

                {townsfolkRole && (
                    <RoleRevealBadge
                        icon={townsfolkRole.icon}
                        roleName={getRoleName(townsfolkRole.id)}
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
