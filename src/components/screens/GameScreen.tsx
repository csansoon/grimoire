import { useState, useCallback, useRef } from "react";
import { Game, getCurrentState, getPlayer, PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { RoleCard } from "../items/RoleCard";
import {
    getNextStep,
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
    DayActionResult,
} from "../../lib/pipeline/types";
import { saveGame } from "../../lib/storage";
import { useI18n, interpolate } from "../../lib/i18n";
import { NarratorPrompt } from "./NarratorPrompt";
import { DayPhase } from "./DayPhase";
import { NominationScreen } from "./NominationScreen";
import { VotingPhase } from "./VotingPhase";
import { GameOver } from "./GameOver";
import { HistoryView } from "./HistoryView";
import { HandbackScreen } from "./HandbackScreen";
import { GrimoireModal } from "../items/GrimoireModal";
import { EditEffectsModal } from "../items/EditEffectsModal";
import { MysticDivider } from "../items";
import { Button, Icon, LanguageToggle } from "../atoms";
import { NightActionResult } from "../../lib/roles/types";
import type { FC } from "react";

type Props = {
    initialGame: Game;
    onMainMenu: () => void;
};

type Screen =
    | { type: "narrator_prompt"; playerId: string; action: "role_reveal" | "night_action" }
    | { type: "role_reveal"; playerId: string }
    | { type: "night_action"; playerId: string; roleId: string }
    | { type: "handback"; afterAction: "role_reveal" | "night_action"; playerId: string }
    | { type: "night_waiting" }
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
    const [screen, setScreen] = useState<Screen>(() => getInitialScreen(initialGame));
    const [showHistory, setShowHistory] = useState(false);
    const [showGrimoire, setShowGrimoire] = useState(false);
    const [editEffectsPlayer, setEditEffectsPlayer] = useState<PlayerState | null>(null);

    // Store pending night action result to apply after handback
    const pendingNightActionResult = useRef<NightActionResult | null>(null);

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
     * Process a pipeline result. If resolved/prevented, apply changes and advance.
     * If needs_input, show the pipeline's UI component.
     */
    const processPipelineResult = useCallback(
        (result: PipelineResult, currentGame: Game) => {
            if (result.type === "resolved" || result.type === "prevented") {
                const newGame = applyPipelineChanges(currentGame, result.stateChanges);
                updateGame(newGame);
                setPipelineUI(null);

                const winner = checkWinCondition(getCurrentState(newGame), newGame);
                if (winner) {
                    const finalGame = endGame(newGame, winner);
                    updateGame(finalGame);
                    setScreen({ type: "game_over" });
                } else {
                    advanceToNextStep(newGame);
                }
            } else if (result.type === "needs_input") {
                // Pause — show the pipeline's UI and wait for narrator input
                const resumeFn = result.resume;
                setPipelineUI({
                    Component: result.UIComponent,
                    intent: result.intent,
                    onResult: (uiResult: unknown) => {
                        const resumed = resumeFn(uiResult);
                        processPipelineResult(resumed, currentGame);
                    },
                });
                setScreen({ type: "pipeline_input" });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [updateGame]
    );

    // ========================================================================
    // GAME FLOW
    // ========================================================================

    const advanceToNextStep = useCallback((currentGame: Game) => {
        const step = getNextStep(currentGame);

        switch (step.type) {
            case "role_reveal":
                setScreen({
                    type: "narrator_prompt",
                    playerId: step.playerId,
                    action: "role_reveal",
                });
                break;
            case "night_action":
                setScreen({
                    type: "narrator_prompt",
                    playerId: step.playerId,
                    action: "night_action",
                });
                break;
            case "night_action_skip": {
                const skippedGame = applyNightAction(currentGame, {
                    entries: [
                        {
                            type: "night_skipped",
                            message: [],
                            data: {
                                roleId: step.roleId,
                                playerId: step.playerId,
                                reason: "should_wake_false",
                            },
                        },
                    ],
                });
                updateGame(skippedGame);
                advanceToNextStep(skippedGame);
                break;
            }
            case "night_waiting":
                setScreen({ type: "night_waiting" });
                break;
            case "day":
                setScreen({ type: "day" });
                break;
            case "voting":
                setScreen({ type: "voting", nomineeId: step.nomineeId });
                break;
            case "game_over":
                const finalGame = endGame(currentGame, step.winner);
                updateGame(finalGame);
                setScreen({ type: "game_over" });
                break;
        }
    }, [updateGame]);

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    const handleNarratorProceed = () => {
        if (screen.type !== "narrator_prompt") return;

        if (screen.action === "role_reveal") {
            setScreen({ type: "role_reveal", playerId: screen.playerId });
        } else {
            const player = getPlayer(state, screen.playerId);
            if (player) {
                setScreen({
                    type: "night_action",
                    playerId: screen.playerId,
                    roleId: player.roleId,
                });
            }
        }
    };

    const handleRoleRevealComplete = () => {
        if (screen.type !== "role_reveal") return;
        setScreen({ type: "handback", afterAction: "role_reveal", playerId: screen.playerId });
    };

    const handleNightActionComplete = (result: NightActionResult) => {
        if (screen.type !== "night_action") return;
        pendingNightActionResult.current = result;
        setScreen({ type: "handback", afterAction: "night_action", playerId: screen.playerId });
    };

    const handleHandbackComplete = () => {
        if (screen.type !== "handback") return;

        if (screen.afterAction === "role_reveal") {
            const newGame = markRoleRevealed(game, screen.playerId);
            updateGame(newGame);

            const revealedCount = newGame.history.filter(
                (e) => e.type === "role_revealed"
            ).length;
            const totalPlayers = state.players.length;

            if (revealedCount >= totalPlayers) {
                const nightGame = startNight(newGame);
                updateGame(nightGame);
                advanceToNextStep(nightGame);
            } else {
                advanceToNextStep(newGame);
            }
        } else if (screen.afterAction === "night_action") {
            const result = pendingNightActionResult.current;
            if (!result) {
                advanceToNextStep(game);
                return;
            }

            // Apply direct entries/effects (not the intent)
            const newGame = applyNightAction(game, result);
            updateGame(newGame);
            pendingNightActionResult.current = null;

            if (result.intent) {
                // Resolve the intent through the pipeline
                const pipelineResult = resolveIntent(
                    result.intent,
                    getCurrentState(newGame),
                    newGame
                );
                processPipelineResult(pipelineResult, newGame);
            } else {
                // No intent — standard flow
                const winner = checkWinCondition(getCurrentState(newGame), newGame);
                if (winner) {
                    const finalGame = endGame(newGame, winner);
                    updateGame(finalGame);
                    setScreen({ type: "game_over" });
                } else {
                    advanceToNextStep(newGame);
                }
            }
        }
    };

    const handleNightActionSkip = () => {
        if (screen.type !== "night_action") return;

        const newGame = skipNightAction(game, screen.roleId, screen.playerId);
        updateGame(newGame);
        advanceToNextStep(newGame);
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
    // OTHER HANDLERS
    // ========================================================================

    const handleOpenEditEffects = (player: PlayerState) => {
        setEditEffectsPlayer(player);
    };

    const handleAddEffect = (playerId: string, effectType: string) => {
        const newGame = addEffectToPlayer(game, playerId, effectType);
        updateGame(newGame);
        const updatedState = getCurrentState(newGame);
        const updatedPlayer = updatedState.players.find(p => p.id === playerId);
        if (updatedPlayer) {
            setEditEffectsPlayer(updatedPlayer);
        }
    };

    const handleRemoveEffect = (playerId: string, effectType: string) => {
        const newGame = removeEffectFromPlayer(game, playerId, effectType);
        updateGame(newGame);
        const updatedState = getCurrentState(newGame);
        const updatedPlayer = updatedState.players.find(p => p.id === playerId);
        if (updatedPlayer) {
            setEditEffectsPlayer(updatedPlayer);
        }
    };

    const handleVoteComplete = (votesFor: string[], votesAgainst: string[]) => {
        if (screen.type !== "voting") return;

        const newGame = resolveVote(game, screen.nomineeId, votesFor, votesAgainst);
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
        updateGame(newGame);
        advanceToNextStep(newGame);
    };

    const handleCancelVote = () => {
        setScreen({ type: "day" });
    };

    const handleBackFromNomination = () => {
        setScreen({ type: "day" });
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
                <HistoryView game={game} onClose={() => setShowHistory(false)} />
                <div className="fixed top-4 right-4 z-50">
                    <LanguageToggle variant="floating" />
                </div>
            </div>
        );
    }

    const renderScreen = () => {
        switch (screen.type) {
            case "narrator_prompt": {
                const player = getPlayer(state, screen.playerId);
                if (!player) return null;
                return (
                    <NarratorPrompt
                        player={player}
                        action={screen.action}
                        onProceed={handleNarratorProceed}
                        onMainMenu={onMainMenu}
                    />
                );
            }

            case "role_reveal": {
                const player = getPlayer(state, screen.playerId);
                if (!player) return null;
                const role = getRole(player.roleId);
                if (!role) return null;

                return (
                    <role.RoleReveal
                        player={player}
                        onContinue={handleRoleRevealComplete}
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

            case "handback":
                return (
                    <HandbackScreen onContinue={handleHandbackComplete} />
                );

            case "night_waiting":
                return (
                    <div className="min-h-app bg-gradient-to-b from-indigo-950 via-grimoire-purple to-grimoire-darker flex flex-col">
                        <div className="px-4 py-4">
                            <button
                                onClick={onMainMenu}
                                className="flex items-center gap-1 p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                            >
                                <Icon name="arrowLeft" size="md" />
                                <span className="text-xs">{t.common.mainMenu}</span>
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="max-w-sm w-full text-center">
                                <div className="mb-8">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center">
                                        <Icon name="moon" size="3xl" className="text-indigo-400" />
                                    </div>
                                </div>

                                <h1 className="font-tarot text-2xl text-parchment-100 tracking-wider uppercase mb-2">
                                    {interpolate(t.game.nightComplete, { round: state.round })}
                                </h1>
                                <p className="text-parchment-400 text-sm mb-8">
                                    {t.game.nightActionsResolved}
                                </p>

                                <MysticDivider className="mb-8" iconClassName="text-indigo-400/40" />

                                <Button
                                    onClick={handleStartDay}
                                    fullWidth
                                    size="lg"
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-grimoire-dark font-tarot uppercase tracking-wider"
                                >
                                    <Icon name="sun" size="md" className="mr-2" />
                                    {t.game.startDay}
                                </Button>
                            </div>
                        </div>
                    </div>
                );

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
                return (
                    <RoleCard
                        player={player}
                        onContinue={handleRoleCardClose}
                    />
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
                return <GameOver state={state} onMainMenu={onMainMenu} onShowHistory={() => setShowHistory(true)} />;

            default:
                return null;
        }
    };

    // Determine which floating buttons to show
    const isPlayerFacingScreen =
        screen.type === "role_reveal" ||
        screen.type === "night_action" ||
        screen.type === "grimoire_role_card" ||
        screen.type === "handback";

    const showFloatingButtons = !isPlayerFacingScreen && screen.type !== "game_over";

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
    const step = getNextStep(game);

    switch (step.type) {
        case "role_reveal":
            return {
                type: "narrator_prompt",
                playerId: step.playerId,
                action: "role_reveal",
            };
        case "night_action":
            return {
                type: "narrator_prompt",
                playerId: step.playerId,
                action: "night_action",
            };
        case "night_action_skip":
            return { type: "night_waiting" };
        case "night_waiting":
            return { type: "night_waiting" };
        case "day":
            return { type: "day" };
        case "voting":
            return { type: "voting", nomineeId: step.nomineeId };
        case "game_over":
            return { type: "game_over" };
        default: {
            const _exhaustive: never = step;
            return _exhaustive;
        }
    }
}
