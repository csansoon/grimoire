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
    RoleRevealBadge,
    InfoBox,
} from "../../../../components/items";
import { SelectablePlayerItem, SelectableRoleItem } from "../../../../components/inputs";
import { Button, Icon } from "../../../../components/atoms";
import { perceive, canRegisterAsTeam } from "../../../pipeline";

type Phase = "narrator_setup" | "player_view" | "no_outsiders_view";

const definition: RoleDefinition = {
    id: "librarian",
    team: "townsfolk",
    icon: "bookMarked",
    nightOrder: 11,
    shouldWake: (game, player) => isAlive(player) && game.history.at(-1)?.stateAfter.round === 1,

    RoleReveal: ({ player, onContinue, context }) => (
        <RoleCard roleId={player.roleId} onContinue={onContinue} context={context} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        const [phase, setPhase] = useState<Phase>("narrator_setup");
        const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
        const [selectedOutsider, setSelectedOutsider] = useState<string | null>(null);
        const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

        const otherPlayers = state.players.filter((p) => p.id !== player.id);

        // All defined outsider roles (for misregistration role picker)
        const outsiderRoles = getAllRoles().filter((r) => r.team === "outsider");

        const outsidersInGame = state.players.filter((p) => {
            const perception = perceive(p, player, "team", state);
            return perception.team === "outsider" || canRegisterAsTeam(p, "outsider");
        });

        const hasOutsiders = outsidersInGame.length > 0;

        const outsidersInSelection = selectedPlayers.filter((playerId) => {
            const p = state.players.find((pl) => pl.id === playerId);
            if (!p) return false;
            const perception = perceive(p, player, "team", state);
            return perception.team === "outsider" || canRegisterAsTeam(p, "outsider");
        });

        const canProceedToPlayer =
            selectedPlayers.length === 2 &&
            outsidersInSelection.length >= 1 &&
            selectedOutsider !== null &&
            selectedRoleId !== null;

        const handlePlayerToggle = (playerId: string) => {
            setSelectedPlayers((prev) => {
                if (prev.includes(playerId)) {
                    if (playerId === selectedOutsider) {
                        setSelectedOutsider(null);
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
            setSelectedOutsider(playerId);
            setSelectedRoleId(roleId);
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
            if (!selectedOutsider || !selectedRoleId) return;

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
                                    role: selectedRoleId,
                                },
                            },
                        ],
                        data: {
                            roleId: "librarian",
                            playerId: player.id,
                            action: "see_outsider",
                            shownPlayers: selectedPlayers,
                            outsiderId: selectedOutsider,
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
                            const perception = perceive(p, player, "team", state);
                            const isSelected = selectedPlayers.includes(p.id);
                            const registersOutsider = perception.team === "outsider" || canRegisterAsTeam(p, "outsider");

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={getRoleName(p.roleId)}
                                    roleIcon={role?.icon ?? "user"}
                                    isSelected={isSelected}
                                    isDisabled={!isSelected && selectedPlayers.length >= 2}
                                    highlightTeam={registersOutsider ? "outsider" : undefined}
                                    teamLabel={registersOutsider ? t.teams.outsider.name : undefined}
                                    onClick={() => handlePlayerToggle(p.id)}
                                />
                            );
                        })}
                    </StepSection>

                    {selectedPlayers.length === 2 && outsidersInSelection.length > 0 && (
                        <StepSection step={2} label={t.game.selectWhichRoleToShow}>
                            {outsidersInSelection.flatMap((playerId) => {
                                const p = state.players.find((pl) => pl.id === playerId);
                                if (!p) return [];
                                const pPerception = perceive(p, player, "team", state);

                                if (pPerception.team === "outsider") {
                                    // Actual outsider (or configured perceiveAs): show perceived role
                                    const rolePerception = perceive(p, player, "role", state);
                                    const perceivedRole = getRole(rolePerception.roleId);
                                    return [(
                                        <SelectableRoleItem
                                            key={playerId}
                                            playerName={p.name}
                                            roleName={getRoleName(rolePerception.roleId)}
                                            roleIcon={perceivedRole?.icon ?? "user"}
                                            isSelected={selectedOutsider === playerId && selectedRoleId === rolePerception.roleId}
                                            onClick={() => handleSelectRole(playerId, rolePerception.roleId)}
                                        />
                                    )];
                                }

                                // Misregistering player (canRegisterAsTeam): show all outsider roles
                                return outsiderRoles.map((role) => (
                                    <SelectableRoleItem
                                        key={`${playerId}-${role.id}`}
                                        playerName={p.name}
                                        roleName={getRoleName(role.id)}
                                        roleIcon={role.icon}
                                        isSelected={selectedOutsider === playerId && selectedRoleId === role.id}
                                        onClick={() => handleSelectRole(playerId, role.id)}
                                    />
                                ));
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

        // Player View Phase — show the role card with player name context
        const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
        const player2 = state.players.find((p) => p.id === selectedPlayers[1]);

        if (!selectedRoleId) return null;

        return (
            <RoleCard
                roleId={selectedRoleId}
                context={
                    <>
                        <p className="uppercase tracking-widest font-semibold mb-2">
                            {t.game.oneOfThemIsThe}
                        </p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            {player1 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                                    <Icon name="user" size="xs" />
                                    <span className="font-medium">{player1.name}</span>
                                </span>
                            )}
                            {player2 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                                    <Icon name="user" size="xs" />
                                    <span className="font-medium">{player2.name}</span>
                                </span>
                            )}
                        </div>
                    </>
                }
                onContinue={handleComplete}
                buttonLabel={t.common.continue}
            />
        );
    },
};

export default definition;
