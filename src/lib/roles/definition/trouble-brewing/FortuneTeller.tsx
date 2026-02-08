import { useState } from "react";
import { RoleDefinition, NightActionResult } from "../../types";
import { getRole } from "../../index";
import { isAlive } from "../../../types";
import { useI18n } from "../../../i18n";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";
import { NightActionLayout, NarratorSetupLayout } from "../../../../components/layouts";
import {
    StepSection,
    MysticDivider,
} from "../../../../components/items";
import { SelectablePlayerItem } from "../../../../components/inputs";
import { Button, Icon } from "../../../../components/atoms";
import { perceive } from "../../../pipeline";

type Phase = "red_herring_setup" | "narrator_setup" | "player_view";

const definition: RoleDefinition = {
    id: "fortune_teller",
    team: "townsfolk",
    icon: "eye",
    nightOrder: 15, // After info roles like Washerwoman, before protection roles like Monk
    shouldWake: (_game, player) => isAlive(player),

    RoleReveal: DefaultRoleReveal,

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();
        
        // Check if this Fortune Teller already has a Red Herring assigned
        const hasRedHerring = state.players.some(p => 
            p.effects.some(e => 
                e.type === "red_herring" && 
                e.data?.fortuneTellerId === player.id
            )
        );
        
        const isFirstNight = state.round === 1;
        const needsRedHerringSetup = isFirstNight && !hasRedHerring;
        
        const [phase, setPhase] = useState<Phase>(
            needsRedHerringSetup ? "red_herring_setup" : "narrator_setup"
        );
        const [selectedRedHerring, setSelectedRedHerring] = useState<string | null>(null);
        const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

        // Get good players for Red Herring selection (not the Fortune Teller themselves)
        const goodPlayers = state.players.filter((p) => {
            if (p.id === player.id) return false;
            const role = getRole(p.roleId);
            return role?.team === "townsfolk" || role?.team === "outsider";
        });

        // Get all other players for the nightly check
        const otherPlayers = state.players.filter((p) => p.id !== player.id);

        const handleSelectRandomRedHerring = () => {
            if (goodPlayers.length === 0) return;
            const randomIndex = Math.floor(Math.random() * goodPlayers.length);
            setSelectedRedHerring(goodPlayers[randomIndex].id);
        };

        const handleConfirmRedHerring = () => {
            if (!selectedRedHerring) return;
            setPhase("narrator_setup");
        };

        const handlePlayerToggle = (playerId: string) => {
            setSelectedPlayers((prev) => {
                if (prev.includes(playerId)) {
                    return prev.filter((id) => id !== playerId);
                } else if (prev.length < 2) {
                    return [...prev, playerId];
                }
                return prev;
            });
        };

        const handleShowToPlayer = () => {
            if (selectedPlayers.length !== 2) return;
            setPhase("player_view");
        };

        const handleComplete = () => {
            if (selectedPlayers.length !== 2) return;

            const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
            const player2 = state.players.find((p) => p.id === selectedPlayers[1]);
            if (!player1 || !player2) return;

            // Check if either selected player registers as a Demon
            // Perception handles: actual demons, Red Herring (via perception modifier), Recluse/Spy
            const registersDemon = (p: typeof player1) => {
                const perception = perceive(p, player, "role", state);
                if (perception.team === "demon") return true;
                // First night: pending red herring not yet applied to player state
                if (selectedRedHerring === p.id) return true;
                return false;
            };

            const sawDemon = registersDemon(player1) || registersDemon(player2);

            const entries: NightActionResult["entries"] = [];

            // If we just assigned a Red Herring, log it first
            if (needsRedHerringSetup && selectedRedHerring) {
                const redHerringPlayer = state.players.find((p) => p.id === selectedRedHerring);
                if (redHerringPlayer) {
                    entries.push({
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.fortune_teller.history.redHerringAssigned",
                                params: {
                                    redHerring: redHerringPlayer.id,
                                    player: player.id,
                                },
                            },
                        ],
                        data: {
                            roleId: "fortune_teller",
                            playerId: player.id,
                            action: "assign_red_herring",
                            redHerringId: selectedRedHerring,
                        },
                    });
                }
            }

            // Log the check result
            entries.push({
                type: "night_action",
                message: [
                    {
                        type: "i18n",
                        key: sawDemon 
                            ? "roles.fortune_teller.history.sawDemon"
                            : "roles.fortune_teller.history.sawNoDemon",
                        params: {
                            player: player.id,
                            player1: player1.id,
                            player2: player2.id,
                        },
                    },
                ],
                data: {
                    roleId: "fortune_teller",
                    playerId: player.id,
                    action: "check",
                    checkedPlayers: selectedPlayers,
                    result: sawDemon ? "yes" : "no",
                },
            });

            onComplete({
                entries,
                addEffects: needsRedHerringSetup && selectedRedHerring ? {
                    [selectedRedHerring]: [{
                        type: "red_herring",
                        data: { fortuneTellerId: player.id },
                        expiresAt: "never",
                    }],
                } : undefined,
            });
        };

        const getRoleName = (roleId: string) => {
            const key = roleId as keyof typeof t.roles;
            return t.roles[key]?.name ?? roleId;
        };

        const getPlayerName = (playerId: string) => {
            return state.players.find((p) => p.id === playerId)?.name ?? "Unknown";
        };

        // Phase 1: Red Herring Setup (first night only)
        if (phase === "red_herring_setup") {
            return (
                <NarratorSetupLayout
                    icon="eye"
                    roleName={getRoleName("fortune_teller")}
                    playerName={getPlayerName(player.id)}
                    onShowToPlayer={handleConfirmRedHerring}
                    showToPlayerDisabled={!selectedRedHerring}
                    showToPlayerLabel={t.common.confirm}
                >
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-amber-200">
                            {t.game.selectRedHerring}
                        </h3>
                        <p className="text-sm text-stone-400 mt-1">
                            {t.game.redHerringInfo}
                        </p>
                    </div>

                    <div className="flex justify-center mb-4">
                        <Button
                            variant="secondary"
                            onClick={handleSelectRandomRedHerring}
                        >
                            <Icon name="shuffle" size="sm" className="mr-2" />
                            {t.game.selectRandomRedHerring}
                        </Button>
                    </div>

                    <StepSection
                        step={1}
                        label={t.game.selectGoodPlayerAsRedHerring}
                    >
                        {goodPlayers.map((p) => {
                            const role = getRole(p.roleId);
                            const isSelected = selectedRedHerring === p.id;

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={getRoleName(p.roleId)}
                                    roleIcon={role?.icon ?? "user"}
                                    isSelected={isSelected}
                                    isDisabled={false}
                                    highlightTeam={role?.team === "townsfolk" ? "townsfolk" : "outsider"}
                                    teamLabel={role?.team === "townsfolk" ? t.teams.townsfolk.name : t.teams.outsider.name}
                                    onClick={() => setSelectedRedHerring(p.id)}
                                />
                            );
                        })}
                    </StepSection>
                </NarratorSetupLayout>
            );
        }

        // Phase 2: Narrator Setup - Select 2 players to check
        if (phase === "narrator_setup") {
            return (
                <NarratorSetupLayout
                    icon="eye"
                    roleName={getRoleName("fortune_teller")}
                    playerName={getPlayerName(player.id)}
                    onShowToPlayer={handleShowToPlayer}
                    showToPlayerDisabled={selectedPlayers.length !== 2}
                >
                    <StepSection
                        step={1}
                        label={t.game.selectTwoPlayersToCheck}
                        count={{ current: selectedPlayers.length, max: 2 }}
                    >
                        {otherPlayers.map((p) => {
                            const role = getRole(p.roleId);
                            const isSelected = selectedPlayers.includes(p.id);
                            const isActuallyEvil = role ? (role.team === "demon" || role.team === "minion") : false;
                            // Red herring: pending first-night assignment, or has the effect (subsequent nights)
                            const isRedHerring = selectedRedHerring === p.id ||
                                p.effects.some((e) => e.type === "red_herring" && e.data?.fortuneTellerId === player.id);

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={getRoleName(p.roleId)}
                                    roleIcon={role?.icon ?? "user"}
                                    isSelected={isSelected}
                                    isDisabled={!isSelected && selectedPlayers.length >= 2}
                                    highlightTeam={isActuallyEvil ? "demon" : isRedHerring ? "minion" : undefined}
                                    teamLabel={isRedHerring ? t.effects.red_herring.name : undefined}
                                    onClick={() => handlePlayerToggle(p.id)}
                                />
                            );
                        })}
                    </StepSection>
                </NarratorSetupLayout>
            );
        }

        // Phase 3: Player View - Show the result
        const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
        const player2 = state.players.find((p) => p.id === selectedPlayers[1]);

        // Calculate result for display — perception handles demons, Red Herring, Recluse/Spy
        const registersDemon = (p: typeof player1) => {
            if (!p) return false;
            const perception = perceive(p, player, "role", state);
            if (perception.team === "demon") return true;
            // First night: pending red herring not yet applied to player state
            if (selectedRedHerring === p.id) return true;
            return false;
        };

        const sawDemon = registersDemon(player1) || registersDemon(player2);

        return (
            <NightActionLayout
                player={player}
                title={t.game.fortuneTellerInfo}
                description={t.game.selectTwoPlayersToCheck}
            >
                <div className="space-y-3 mb-6">
                    {player1 && (
                        <div className="text-center p-3 bg-stone-800/50 rounded-lg border border-stone-700">
                            <span className="text-lg font-medium text-stone-200">{player1.name}</span>
                        </div>
                    )}
                    {player2 && (
                        <div className="text-center p-3 bg-stone-800/50 rounded-lg border border-stone-700">
                            <span className="text-lg font-medium text-stone-200">{player2.name}</span>
                        </div>
                    )}
                </div>

                <MysticDivider />

                <div className={`text-center p-6 rounded-lg mb-6 ${
                    sawDemon 
                        ? "bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-700/50" 
                        : "bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/50"
                }`}>
                    <Icon 
                        name={sawDemon ? "alertTriangle" : "checkCircle"} 
                        size="2xl" 
                        className={sawDemon ? "text-red-400 mx-auto mb-3" : "text-emerald-400 mx-auto mb-3"} 
                    />
                    <p className={`text-xl font-bold ${sawDemon ? "text-red-300" : "text-emerald-300"}`}>
                        {sawDemon ? t.game.yesOneIsDemon : t.game.noNeitherIsDemon}
                    </p>
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
