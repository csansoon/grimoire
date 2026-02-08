import { useState, useCallback } from "react";
import { Game, getCurrentState, getPlayer, PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { RoleCard } from "../items/RoleCard";
import { TeamBackground, CardLink } from "../items/TeamBackground";
import {
    markRoleRevealed,
    startNight,
    startDay,
    applyNightAction,
    skipNightAction,
    nominate,
    resolveVote,
    endGame,
    checkWinCondition,
    checkEndOfDayWinConditions,
    hasExecutionToday,
    addEffectToPlayer,
    removeEffectFromPlayer,
    processAutoSkips,
} from "../../lib/game";
import {
    resolveIntent,
    applyPipelineChanges,
    getAvailableDayActions,
} from "../../lib/pipeline";
import {
    PipelineResult,
    PipelineInputProps,
    AvailableDayAction,
    AvailableNightFollowUp,
    NightFollowUpResult,
    DayActionResult,
} from "../../lib/pipeline/types";
import { saveGame } from "../../lib/storage";
import { useI18n } from "../../lib/i18n";
import { RoleRevelationScreen } from "./RoleRevelationScreen";
import { NightDashboard } from "./NightDashboard";
import { DayPhase } from "./DayPhase";
import { NominationScreen } from "./NominationScreen";
import { VotingPhase } from "./VotingPhase";
import { GameOver } from "./GameOver";
import { HistoryView } from "./HistoryView";
import { GrimoireModal } from "../items/GrimoireModal";
import { EditEffectsModal } from "../items/EditEffectsModal";
import { Icon, LanguageToggle } from "../atoms";
import { NightActionResult } from "../../lib/roles/types";
import type { FC } from "react";

type Props = {
    initialGame: Game;
    onMainMenu: () => void;
};

type Screen =
    | { type: "role_revelation" }
    | { type: "showing_role"; playerId: string }
    | { type: "night_dashboard" }
    | { type: "night_action"; playerId: string; roleId: string }
    | { type: "night_follow_up"; followUp: AvailableNightFollowUp }
    | { type: "day" }
    | { type: "nomination" }
    | { type: "day_action"; action: AvailableDayAction }
    | { type: "voting"; nomineeId: string }
    | { type: "pipeline_input" }
    | { type: "game_over" }
    | { type: "grimoire_role_card"; playerId: string; returnTo: Screen };

export function GameScreen({ initialGame, onMainMenu }: Props) {
    const { t } = useI18n();
    const [game, setGame] = useState<Game>(initialGame);
    const [screen, setScreen] = useState<Screen>(() =>
        getInitialScreen(initialGame),
    );
    const [showHistory, setShowHistory] = useState(false);
    const [showGrimoire, setShowGrimoire] = useState(false);
    const [editEffectsPlayer, setEditEffectsPlayer] =
        useState<PlayerState | null>(null);

    // Pipeline UI state — shown when an intent needs narrator input mid-resolution
    const [pipelineUI, setPipelineUI] = useState<{
        Component: FC<PipelineInputProps>;
        intent: import("../../lib/pipeline/types").Intent;
        onResult: (result: unknown) => void;
    } | null>(null);

    const state = getCurrentState(game);

    const updateGame = useCallback((newGame: Game) => {
        setGame(newGame);
        saveGame(newGame);
    }, []);

    // ========================================================================
    // PIPELINE INTEGRATION
    // ========================================================================

    /**
     * Process a pipeline result. If resolved/prevented, apply changes.
     * If needs_input, show the pipeline's UI component.
     * Returns the updated game, or null if waiting for UI input.
     */
    const processPipelineResult = useCallback(
        (
            result: PipelineResult,
            currentGame: Game,
            afterComplete: (updatedGame: Game) => void,
        ) => {
            if (result.type === "resolved" || result.type === "prevented") {
                const newGame = applyPipelineChanges(
                    currentGame,
                    result.stateChanges,
                );
                updateGame(newGame);
                setPipelineUI(null);
                afterComplete(newGame);
            } else if (result.type === "needs_input") {
                const resumeFn = result.resume;
                setPipelineUI({
                    Component: result.UIComponent,
                    intent: result.intent,
                    onResult: (uiResult: unknown) => {
                        const resumed = resumeFn(uiResult);
                        processPipelineResult(
                            resumed,
                            currentGame,
                            afterComplete,
                        );
                    },
                });
                setScreen({ type: "pipeline_input" });
            }
        },
        [updateGame],
    );

    // ========================================================================
    // ROLE REVELATION FLOW
    // ========================================================================

    const handleRevealRole = (playerId: string) => {
        setScreen({ type: "showing_role", playerId });
    };

    const handleRoleRevealDismiss = () => {
        if (screen.type !== "showing_role") return;

        const newGame = markRoleRevealed(game, screen.playerId);
        updateGame(newGame);
        setScreen({ type: "role_revelation" });
    };

    const handleStartFirstNight = () => {
        const nightGame = startNight(game);
        // Process auto-skips so the dashboard is ready
        const readyGame = processAutoSkips(nightGame);
        updateGame(readyGame);
        setScreen({ type: "night_dashboard" });
    };

    // ========================================================================
    // NIGHT DASHBOARD FLOW
    // ========================================================================

    const handleOpenNightAction = (playerId: string, roleId: string) => {
        const player = getPlayer(state, playerId);
        if (!player) return;

        const role = getRole(roleId);
        if (!role || !role.NightAction) {
            // Role has no night action component — auto-skip
            const newGame = skipNightAction(game, roleId, playerId);
            const readyGame = processAutoSkips(newGame);
            updateGame(readyGame);
            setScreen({ type: "night_dashboard" });
            return;
        }

        setScreen({ type: "night_action", playerId, roleId });
    };

    const handleOpenNightFollowUp = (followUp: AvailableNightFollowUp) => {
        setScreen({ type: "night_follow_up", followUp });
    };

    const handleNightActionComplete = (result: NightActionResult) => {
        if (screen.type !== "night_action") return;

        // Apply direct entries/effects (not the intent)
        const newGame = applyNightAction(game, result);
        updateGame(newGame);

        if (result.intent) {
            // Resolve the intent through the pipeline
            const pipelineResult = resolveIntent(
                result.intent,
                getCurrentState(newGame),
                newGame,
            );
            processPipelineResult(pipelineResult, newGame, (updatedGame) => {
                // After pipeline resolution, check win conditions and return to dashboard
                const winner = checkWinCondition(
                    getCurrentState(updatedGame),
                    updatedGame,
                );
                if (winner) {
                    const finalGame = endGame(updatedGame, winner);
                    updateGame(finalGame);
                    setScreen({ type: "game_over" });
                } else {
                    // Process auto-skips and return to night dashboard
                    const readyGame = processAutoSkips(updatedGame);
                    updateGame(readyGame);
                    setScreen({ type: "night_dashboard" });
                }
            });
        } else {
            // No intent — check win conditions and return to dashboard
            const winner = checkWinCondition(
                getCurrentState(newGame),
                newGame,
            );
            if (winner) {
                const finalGame = endGame(newGame, winner);
                updateGame(finalGame);
                setScreen({ type: "game_over" });
            } else {
                // Process auto-skips and return to night dashboard
                const readyGame = processAutoSkips(newGame);
                updateGame(readyGame);
                setScreen({ type: "night_dashboard" });
            }
        }
    };

    const handleNightActionSkip = () => {
        if (screen.type !== "night_action") return;

        const newGame = skipNightAction(
            game,
            screen.roleId,
            screen.playerId,
        );
        const readyGame = processAutoSkips(newGame);
        updateGame(readyGame);
        setScreen({ type: "night_dashboard" });
    };

    const handleStartDay = () => {
        const newGame = startDay(game);
        updateGame(newGame);

        const winner = checkWinCondition(getCurrentState(newGame), newGame);
        if (winner) {
            const finalGame = endGame(newGame, winner);
            updateGame(finalGame);
            setScreen({ type: "game_over" });
        } else {
            setScreen({ type: "day" });
        }
    };

    // ========================================================================
    // DAY FLOW
    // ========================================================================

    const handleOpenNomination = () => {
        setScreen({ type: "nomination" });
    };

    const handleNominate = (nominatorId: string, nomineeId: string) => {
        const newGame = nominate(game, nominatorId, nomineeId);
        updateGame(newGame);

        const newState = getCurrentState(newGame);
        if (newState.phase === "voting") {
            setScreen({ type: "voting", nomineeId });
        } else {
            // Effect intercepted (e.g., Virgin) — check win condition
            const winner = checkWinCondition(newState, newGame);
            if (winner) {
                const finalGame = endGame(newGame, winner);
                updateGame(finalGame);
                setScreen({ type: "game_over" });
            } else {
                setScreen({ type: "day" });
            }
        }
    };

    const handleVoteComplete = (
        votesFor: string[],
        votesAgainst: string[],
    ) => {
        if (screen.type !== "voting") return;

        const newGame = resolveVote(
            game,
            screen.nomineeId,
            votesFor,
            votesAgainst,
        );
        updateGame(newGame);

        const winner = checkWinCondition(getCurrentState(newGame), newGame);
        if (winner) {
            const finalGame = endGame(newGame, winner);
            updateGame(finalGame);
            setScreen({ type: "game_over" });
        } else {
            setScreen({ type: "day" });
        }
    };

    const handleEndDay = () => {
        // Check dynamic end-of-day win conditions (e.g., Mayor's peaceful victory)
        const endOfDayWinner = checkEndOfDayWinConditions(state, game);
        if (endOfDayWinner) {
            const finalGame = endGame(game, endOfDayWinner);
            updateGame(finalGame);
            setScreen({ type: "game_over" });
            return;
        }

        const newGame = startNight(game);
        // Process auto-skips so the dashboard is ready
        const readyGame = processAutoSkips(newGame);
        updateGame(readyGame);
        setScreen({ type: "night_dashboard" });
    };

    const handleCancelVote = () => {
        setScreen({ type: "day" });
    };

    const handleBackFromNomination = () => {
        setScreen({ type: "day" });
    };

    // ========================================================================
    // GENERIC DAY ACTIONS
    // ========================================================================

    const handleOpenDayAction = (action: AvailableDayAction) => {
        setScreen({ type: "day_action", action });
    };

    const handleDayActionComplete = (result: DayActionResult) => {
        const changes = {
            entries: result.entries,
            addEffects: result.addEffects,
            removeEffects: result.removeEffects,
        };
        const newGame = applyPipelineChanges(game, changes);
        updateGame(newGame);

        const winner = checkWinCondition(getCurrentState(newGame), newGame);
        if (winner) {
            const finalGame = endGame(newGame, winner);
            updateGame(finalGame);
            setScreen({ type: "game_over" });
        } else {
            setScreen({ type: "day" });
        }
    };

    const handleBackFromDayAction = () => {
        setScreen({ type: "day" });
    };

    // ========================================================================
    // NIGHT FOLLOW-UPS
    // ========================================================================

    const handleNightFollowUpComplete = (result: NightFollowUpResult) => {
        const changes = {
            entries: result.entries,
            addEffects: result.addEffects,
            removeEffects: result.removeEffects,
        };
        const newGame = applyPipelineChanges(game, changes);
        updateGame(newGame);
        setScreen({ type: "night_dashboard" });
    };

    // ========================================================================
    // OTHER HANDLERS
    // ========================================================================

    const handleOpenEditEffects = (player: PlayerState) => {
        setEditEffectsPlayer(player);
    };

    const handleAddEffect = (playerId: string, effectType: string) => {
        const newGame = addEffectToPlayer(game, playerId, effectType);
        updateGame(newGame);
        const updatedState = getCurrentState(newGame);
        const updatedPlayer = updatedState.players.find(
            (p) => p.id === playerId,
        );
        if (updatedPlayer) {
            setEditEffectsPlayer(updatedPlayer);
        }
    };

    const handleRemoveEffect = (playerId: string, effectType: string) => {
        const newGame = removeEffectFromPlayer(game, playerId, effectType);
        updateGame(newGame);
        const updatedState = getCurrentState(newGame);
        const updatedPlayer = updatedState.players.find(
            (p) => p.id === playerId,
        );
        if (updatedPlayer) {
            setEditEffectsPlayer(updatedPlayer);
        }
    };

    const handleShowRoleCard = (player: PlayerState) => {
        setShowGrimoire(false);
        setScreen({
            type: "grimoire_role_card",
            playerId: player.id,
            returnTo: screen,
        });
    };

    const handleRoleCardClose = () => {
        if (screen.type === "grimoire_role_card") {
            setScreen(screen.returnTo);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    if (showHistory) {
        return (
            <div className="relative">
                <HistoryView
                    game={game}
                    onClose={() => setShowHistory(false)}
                />
                <div className="fixed top-4 right-4 z-50">
                    <LanguageToggle variant="floating" />
                </div>
            </div>
        );
    }

    const renderScreen = () => {
        switch (screen.type) {
            case "role_revelation":
                return (
                    <RoleRevelationScreen
                        game={game}
                        state={state}
                        onRevealRole={handleRevealRole}
                        onStartNight={handleStartFirstNight}
                        onMainMenu={onMainMenu}
                    />
                );

            case "showing_role": {
                const player = getPlayer(state, screen.playerId);
                if (!player) return null;
                const role = getRole(player.roleId);
                if (!role) return null;

                return (
                    <role.RoleReveal
                        player={player}
                        onContinue={handleRoleRevealDismiss}
                    />
                );
            }

            case "night_dashboard":
                return (
                    <NightDashboard
                        game={game}
                        state={state}
                        onOpenNightAction={handleOpenNightAction}
                        onOpenNightFollowUp={handleOpenNightFollowUp}
                        onStartDay={handleStartDay}
                        onMainMenu={onMainMenu}
                        onShowRoleCard={handleShowRoleCard}
                        onEditEffects={handleOpenEditEffects}
                    />
                );

            case "night_follow_up": {
                const FollowUpComponent = screen.followUp.ActionComponent;
                return (
                    <FollowUpComponent
                        state={state}
                        game={game}
                        playerId={screen.followUp.playerId}
                        onComplete={handleNightFollowUpComplete}
                    />
                );
            }

            case "night_action": {
                const player = getPlayer(state, screen.playerId);
                if (!player) return null;
                const role = getRole(screen.roleId);
                if (!role) return null;

                if (!role.NightAction) {
                    handleNightActionSkip();
                    return null;
                }

                return (
                    <role.NightAction
                        game={game}
                        state={state}
                        player={player}
                        onComplete={handleNightActionComplete}
                    />
                );
            }

            case "day": {
                // Collect available day actions from active effects
                const dayActions = getAvailableDayActions(state, t);

                return (
                    <DayPhase
                        state={state}
                        canNominate={!hasExecutionToday(game)}
                        dayActions={dayActions}
                        onNominate={handleOpenNomination}
                        onDayAction={handleOpenDayAction}
                        onEndDay={handleEndDay}
                        onMainMenu={onMainMenu}
                        onShowRoleCard={handleShowRoleCard}
                        onEditEffects={handleOpenEditEffects}
                    />
                );
            }

            case "day_action": {
                const ActionComponent = screen.action.ActionComponent;
                return (
                    <ActionComponent
                        state={state}
                        playerId={screen.action.playerId}
                        onComplete={handleDayActionComplete}
                        onBack={handleBackFromDayAction}
                    />
                );
            }

            case "pipeline_input": {
                if (!pipelineUI) return null;
                const PipelineComponent = pipelineUI.Component;
                return (
                    <PipelineComponent
                        state={state}
                        intent={pipelineUI.intent}
                        onComplete={pipelineUI.onResult}
                    />
                );
            }

            case "grimoire_role_card": {
                const player = getPlayer(state, screen.playerId);
                if (!player) return null;
                const cardRole = getRole(player.roleId);
                const cardTeamId = cardRole?.team ?? "townsfolk";
                const cardTeam = getTeam(cardTeamId);
                return (
                    <TeamBackground teamId={cardTeamId}>
                        <RoleCard roleId={player.roleId} />
                        <CardLink onClick={handleRoleCardClose} isEvil={cardTeam.isEvil}>
                            {t.common.back}
                        </CardLink>
                    </TeamBackground>
                );
            }

            case "nomination":
                return (
                    <NominationScreen
                        state={state}
                        onNominate={handleNominate}
                        onBack={handleBackFromNomination}
                    />
                );

            case "voting":
                return (
                    <VotingPhase
                        state={state}
                        nomineeId={screen.nomineeId}
                        onVoteComplete={handleVoteComplete}
                        onCancel={handleCancelVote}
                    />
                );

            case "game_over":
                return (
                    <GameOver
                        state={state}
                        onMainMenu={onMainMenu}
                        onShowHistory={() => setShowHistory(true)}
                    />
                );

            default:
                return null;
        }
    };

    // Determine which floating buttons to show
    const isPlayerFacingScreen =
        screen.type === "showing_role" ||
        screen.type === "night_follow_up" ||
        screen.type === "night_action" ||
        screen.type === "grimoire_role_card";

    const showFloatingButtons =
        !isPlayerFacingScreen && screen.type !== "game_over";

    return (
        <div className="relative">
            {renderScreen()}

            {/* Floating Language Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageToggle variant="floating" />
            </div>

            {/* Floating Action Buttons */}
            {showFloatingButtons && (
                <div className="fixed bottom-4 right-4 flex flex-col gap-2">
                    <button
                        onClick={() => setShowGrimoire(true)}
                        className="w-12 h-12 rounded-full bg-grimoire-dark/90 border border-mystic-gold/30 text-mystic-gold flex items-center justify-center shadow-lg hover:bg-grimoire-dark hover:border-mystic-gold/50 transition-colors"
                        title="Grimoire"
                    >
                        <Icon name="scrollText" size="md" />
                    </button>

                    <button
                        onClick={() => setShowHistory(true)}
                        className="w-12 h-12 rounded-full bg-grimoire-dark/90 border border-parchment-500/30 text-parchment-400 flex items-center justify-center shadow-lg hover:bg-grimoire-dark hover:border-parchment-400/50 hover:text-parchment-300 transition-colors"
                        title={t.common.history}
                    >
                        <Icon name="clock" size="md" />
                    </button>
                </div>
            )}

            {/* Grimoire Modal */}
            <GrimoireModal
                state={state}
                open={showGrimoire}
                onClose={() => setShowGrimoire(false)}
                onShowRoleCard={handleShowRoleCard}
                onEditEffects={handleOpenEditEffects}
            />

            {/* Edit Effects Modal */}
            <EditEffectsModal
                player={editEffectsPlayer}
                open={editEffectsPlayer !== null}
                onClose={() => setEditEffectsPlayer(null)}
                onAddEffect={handleAddEffect}
                onRemoveEffect={handleRemoveEffect}
            />
        </div>
    );
}

function getInitialScreen(game: Game): Screen {
    const state = getCurrentState(game);

    // Check win conditions
    if (state.phase === "ended") {
        return { type: "game_over" };
    }

    if (state.phase !== "setup") {
        const winner = checkWinCondition(state, game);
        if (winner) {
            return { type: "game_over" };
        }
    }

    switch (state.phase) {
        case "setup":
            return { type: "role_revelation" };
        case "night":
            return { type: "night_dashboard" };
        case "voting": {
            // Find the nominee from the last nomination
            const lastNomination = [...game.history]
                .reverse()
                .find((e) => e.type === "nomination");
            if (lastNomination) {
                return {
                    type: "voting",
                    nomineeId: lastNomination.data.nomineeId as string,
                };
            }
            return { type: "day" };
        }
        case "day":
            return { type: "day" };
        default:
            return { type: "day" };
    }
}
