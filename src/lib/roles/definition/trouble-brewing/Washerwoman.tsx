import { useState } from "react";
import { RoleDefinition } from "../../types";
import { isAlive } from "../../../types";
import { getRole, getAllRoles } from "../../index";
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
import { perceive, canRegisterAsTeam } from "../../../pipeline";

type Phase = "narrator_setup" | "player_view";

const definition: RoleDefinition = {
    id: "washerwoman",
    team: "townsfolk",
    icon: "shirt",
    nightOrder: 10,
    shouldWake: (game, player) => isAlive(player) && game.history.at(-1)?.stateAfter.round === 1,

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [phase, setPhase] = useState<Phase>("narrator_setup");
        const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
        const [selectedTownsfolk, setSelectedTownsfolk] = useState<string | null>(null);
        const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

        const otherPlayers = state.players.filter((p) => p.id !== player.id);

        // All defined townsfolk roles (for misregistration role picker)
        const townsfolkRoles = getAllRoles().filter((r) => r.team === "townsfolk");

        const townsfolkInSelection = selectedPlayers.filter((playerId) => {
            const p = state.players.find((pl) => pl.id === playerId);
            if (!p) return false;
            const perception = perceive(p, player, "team", state);
            return perception.team === "townsfolk" || canRegisterAsTeam(p, "townsfolk");
        });

        const canProceedToPlayer =
            selectedPlayers.length === 2 &&
            townsfolkInSelection.length >= 1 &&
            selectedTownsfolk !== null &&
            selectedRoleId !== null;

        const handlePlayerToggle = (playerId: string) => {
            setSelectedPlayers((prev) => {
                if (prev.includes(playerId)) {
                    if (playerId === selectedTownsfolk) {
                        setSelectedTownsfolk(null);
                        setSelectedRoleId(null);
                    }
                    return prev.filter((id) => id !== playerId);
                } else if (prev.length < 2) {
                    return [...prev, playerId];
                }
                return prev;
            });
        };

        const handleSelectRole = (playerId: string, roleId: string) => {
            setSelectedTownsfolk(playerId);
            setSelectedRoleId(roleId);
        };

        const handleShowToPlayer = () => {
            if (!canProceedToPlayer) return;
            setPhase("player_view");
        };

        const handleComplete = () => {
            if (!selectedTownsfolk || !selectedRoleId) return;

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
                                    role: selectedRoleId,
                                },
                            },
                        ],
                        data: {
                            roleId: "washerwoman",
                            playerId: player.id,
                            action: "see_townsfolk",
                            shownPlayers: selectedPlayers,
                            townsfolkId: selectedTownsfolk,
                            shownRoleId: selectedRoleId,
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
                            const perception = perceive(p, player, "team", state);
                            const isSelected = selectedPlayers.includes(p.id);
                            const registersTownsfolk = perception.team === "townsfolk" || canRegisterAsTeam(p, "townsfolk");

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={getRoleName(p.roleId)}
                                    roleIcon={role?.icon ?? "user"}
                                    isSelected={isSelected}
                                    isDisabled={!isSelected && selectedPlayers.length >= 2}
                                    highlightTeam={registersTownsfolk ? "townsfolk" : undefined}
                                    teamLabel={registersTownsfolk ? t.teams.townsfolk.name : undefined}
                                    onClick={() => handlePlayerToggle(p.id)}
                                />
                            );
                        })}
                    </StepSection>

                    {selectedPlayers.length === 2 && townsfolkInSelection.length > 0 && (
                        <StepSection step={2} label={t.game.selectWhichRoleToShow}>
                            {townsfolkInSelection.flatMap((playerId) => {
                                const p = state.players.find((pl) => pl.id === playerId);
                                if (!p) return [];
                                const pPerception = perceive(p, player, "team", state);

                                if (pPerception.team === "townsfolk") {
                                    // Actual townsfolk (or configured perceiveAs): show perceived role
                                    const rolePerception = perceive(p, player, "role", state);
                                    const perceivedRole = getRole(rolePerception.roleId);
                                    return [(
                                        <SelectableRoleItem
                                            key={playerId}
                                            playerName={p.name}
                                            roleName={getRoleName(rolePerception.roleId)}
                                            roleIcon={perceivedRole?.icon ?? "user"}
                                            isSelected={selectedTownsfolk === playerId && selectedRoleId === rolePerception.roleId}
                                            onClick={() => handleSelectRole(playerId, rolePerception.roleId)}
                                        />
                                    )];
                                }

                                // Misregistering player (canRegisterAsTeam): show all townsfolk roles
                                return townsfolkRoles.map((role) => (
                                    <SelectableRoleItem
                                        key={`${playerId}-${role.id}`}
                                        playerName={p.name}
                                        roleName={getRoleName(role.id)}
                                        roleIcon={role.icon}
                                        isSelected={selectedTownsfolk === playerId && selectedRoleId === role.id}
                                        onClick={() => handleSelectRole(playerId, role.id)}
                                    />
                                ));
                            })}
                        </StepSection>
                    )}

                    {selectedPlayers.length === 2 && townsfolkInSelection.length === 0 && (
                        <AlertBox message={t.game.mustIncludeTownsfolk} />
                    )}
                </NarratorSetupLayout>
            );
        }

        // Player View Phase — use the narrator's chosen role
        const shownRole = selectedRoleId ? getRole(selectedRoleId) : null;
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

                {shownRole && (
                    <RoleRevealBadge
                        icon={shownRole.icon}
                        roleName={getRoleName(shownRole.id)}
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
