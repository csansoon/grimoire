import { useState } from "react";
import { RoleDefinition } from "../../types";
import { isAlive } from "../../../types";
import { getRole, getAllRoles } from "../../index";
import { getTeam } from "../../../teams";
import { useI18n } from "../../../i18n";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";
import { RoleCard } from "../../../../components/items/RoleCard";
import { TeamBackground, CardLink } from "../../../../components/items/TeamBackground";
import { NarratorSetupLayout } from "../../../../components/layouts";
import {
    StepSection,
    AlertBox,
} from "../../../../components/items";
import { SelectablePlayerItem, SelectableRoleItem } from "../../../../components/inputs";
import { Icon } from "../../../../components/atoms";
import { perceive, canRegisterAsTeam } from "../../../pipeline";

type Phase = "narrator_setup" | "player_view";

const definition: RoleDefinition = {
    id: "washerwoman",
    team: "townsfolk",
    icon: "shirt",
    nightOrder: 10,
    shouldWake: (game, player) => isAlive(player) && game.history.at(-1)?.stateAfter.round === 1,

    RoleReveal: DefaultRoleReveal,

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

        // Player View Phase — show the role card with player name context
        const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
        const player2 = state.players.find((p) => p.id === selectedPlayers[1]);

        if (!selectedRoleId) return null;

        const shownRole = getRole(selectedRoleId);
        const shownTeamId = shownRole?.team ?? "townsfolk";
        const shownTeam = getTeam(shownTeamId);

        return (
            <TeamBackground teamId={shownTeamId}>
                <div className={`text-center text-xs mb-4 max-w-sm mx-auto ${shownTeam.isEvil ? "text-red-300/80" : "text-parchment-300/80"}`}>
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
                </div>

                <RoleCard roleId={selectedRoleId} />

                <CardLink onClick={handleComplete} isEvil={shownTeam.isEvil}>
                    {t.common.continue}
                </CardLink>
            </TeamBackground>
        );
    },
};

export default definition;
