import { useState } from "react";
import { RoleDefinition, EffectToAdd, NightActionResult } from "../../types";
import { getRole, canRegisterAsTeam } from "../../index";
import { isAlive } from "../../../types";
import { useI18n, interpolate } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout, NarratorSetupLayout } from "../../../../components/layouts";
import {
    StepSection,
    MysticDivider,
} from "../../../../components/items";
import { SelectablePlayerItem } from "../../../../components/inputs";
import { Button, Icon } from "../../../../components/atoms";

type Phase = "red_herring_setup" | "narrator_setup" | "registration_setup" | "player_view";

const definition: RoleDefinition = {
    id: "fortune_teller",
    team: "townsfolk",
    icon: "eye",
    nightOrder: 15,
    shouldWake: (_game, player) => isAlive(player),

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

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
        const [pendingEffects, setPendingEffects] = useState<Record<string, EffectToAdd[]>>({});
        const [registrationOverrides, setRegistrationOverrides] = useState<
            Record<string, boolean>
        >({});

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
            setPendingEffects({
                [selectedRedHerring]: [
                    {
                        type: "red_herring",
                        data: { fortuneTellerId: player.id },
                        expiresAt: "never",
                    },
                ],
            });
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

        // Find selected players that can register as demon (via registration config)
        // but are NOT actually demons
        const selectedWithDemonRegistration = selectedPlayers.filter((playerId) => {
            const p = state.players.find((pl) => pl.id === playerId);
            if (!p) return false;
            const role = getRole(p.roleId);
            if (!role) return false;
            // Already a demon → no need to ask
            if (role.team === "demon") return false;
            // Can register as demon via registration config
            return canRegisterAsTeam(role, "demon");
        });

        const handleShowToPlayer = () => {
            if (selectedPlayers.length !== 2) return;
            if (selectedWithDemonRegistration.length > 0) {
                setPhase("registration_setup");
            } else {
                setPhase("player_view");
            }
        };

        const handleRegistrationDone = () => {
            setPhase("player_view");
        };

        // Determine if the check shows "Demon found"
        const isDemonOrRedHerringOrRegistered = (p: { id: string; roleId: string; effects: Array<{ type: string; data?: Record<string, unknown> }> }) => {
            const role = getRole(p.roleId);
            if (role?.team === "demon") return true;
            if (p.effects.some(
                (e) => e.type === "red_herring" && e.data?.fortuneTellerId === player.id
            )) return true;
            // Check registration override
            if (registrationOverrides[p.id]) return true;
            return false;
        };

        const isPendingRedHerring = (p: { id: string }) => {
            return pendingEffects[p.id]?.some(e => e.type === "red_herring");
        };

        const handleComplete = () => {
            if (selectedPlayers.length !== 2) return;

            const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
            const player2 = state.players.find((p) => p.id === selectedPlayers[1]);
            if (!player1 || !player2) return;

            const sawDemon = isDemonOrRedHerringOrRegistered(player1) || isDemonOrRedHerringOrRegistered(player2) ||
                            isPendingRedHerring(player1) || isPendingRedHerring(player2);

            const entries: NightActionResult["entries"] = [];

            if (selectedRedHerring && Object.keys(pendingEffects).length > 0) {
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
                    registrationOverrides:
                        Object.keys(registrationOverrides).length > 0
                            ? registrationOverrides
                            : undefined,
                },
            });

            onComplete({
                entries,
                addEffects: Object.keys(pendingEffects).length > 0 ? pendingEffects : undefined,
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
                            const isEvil = role?.team === "demon" || role?.team === "minion";
                            const hasDemonRegistration = role ? (role.team !== "demon" && canRegisterAsTeam(role, "demon")) : false;
                            const isRedHerring = p.effects.some(
                                (e) => e.type === "red_herring" && e.data?.fortuneTellerId === player.id
                            ) || (pendingEffects[p.id]?.some(e => e.type === "red_herring"));

                            return (
                                <SelectablePlayerItem
                                    key={p.id}
                                    playerName={p.name}
                                    roleName={getRoleName(p.roleId)}
                                    roleIcon={role?.icon ?? "user"}
                                    isSelected={isSelected}
                                    isDisabled={!isSelected && selectedPlayers.length >= 2}
                                    highlightTeam={isEvil ? "demon" : isRedHerring ? "minion" : hasDemonRegistration ? "outsider" : undefined}
                                    teamLabel={isRedHerring ? t.effects.red_herring.name : undefined}
                                    onClick={() => handlePlayerToggle(p.id)}
                                />
                            );
                        })}
                    </StepSection>
                </NarratorSetupLayout>
            );
        }

        // Phase 2.5: Registration Setup - Does a selected player register as Demon?
        if (phase === "registration_setup") {
            const playersForPrompt = selectedWithDemonRegistration.map((playerId) => {
                const p = state.players.find((pl) => pl.id === playerId);
                return { id: playerId, name: p?.name ?? "Unknown" };
            });

            return (
                <NarratorSetupLayout
                    icon="eye"
                    roleName={getRoleName("fortune_teller")}
                    playerName={getPlayerName(player.id)}
                    onShowToPlayer={handleRegistrationDone}
                >
                    <StepSection step={1} label={t.game.reclusePrompt}>
                        {playersForPrompt.map((p) => {
                            const isRegistered = registrationOverrides[p.id] ?? false;

                            return (
                                <div key={p.id} className="mb-4">
                                    <p className="text-sm text-parchment-300 mb-3">
                                        {interpolate(t.game.doesRecluseRegisterAsDemon, {
                                            player: p.name,
                                        })}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setRegistrationOverrides((prev) => ({
                                                    ...prev,
                                                    [p.id]: false,
                                                }))
                                            }
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm ${
                                                !isRegistered
                                                    ? "bg-emerald-700/40 border-emerald-500 text-emerald-200"
                                                    : "bg-white/5 border-white/10 text-parchment-400 hover:border-white/30"
                                            }`}
                                        >
                                            <Icon name="checkCircle" size="sm" className="inline mr-2" />
                                            {t.game.recluseRegistersAsGood}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setRegistrationOverrides((prev) => ({
                                                    ...prev,
                                                    [p.id]: true,
                                                }))
                                            }
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm ${
                                                isRegistered
                                                    ? "bg-red-700/40 border-red-500 text-red-200"
                                                    : "bg-white/5 border-white/10 text-parchment-400 hover:border-white/30"
                                            }`}
                                        >
                                            <Icon name="skull" size="sm" className="inline mr-2" />
                                            {t.game.recluseAsDemon}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </StepSection>
                </NarratorSetupLayout>
            );
        }

        // Phase 3: Player View
        const player1 = state.players.find((p) => p.id === selectedPlayers[0]);
        const player2 = state.players.find((p) => p.id === selectedPlayers[1]);

        const sawDemon = (player1 ? (isDemonOrRedHerringOrRegistered(player1) || isPendingRedHerring(player1)) : false) ||
                        (player2 ? (isDemonOrRedHerringOrRegistered(player2) || isPendingRedHerring(player2)) : false);

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
