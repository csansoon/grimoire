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
    hasExecutionToday,
} from "../../lib/game";
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
import { MysticDivider } from "../items";
import { Button, Icon, LanguageToggle } from "../atoms";
import { NightActionResult } from "../../lib/roles/types";

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
    | { type: "voting"; nomineeId: string }
    | { type: "game_over" }
    | { type: "grimoire_role_card"; playerId: string; returnTo: Screen };

export function GameScreen({ initialGame, onMainMenu }: Props) {
    const { t } = useI18n();
    const [game, setGame] = useState<Game>(initialGame);
    const [screen, setScreen] = useState<Screen>(() => getInitialScreen(initialGame));
    const [showHistory, setShowHistory] = useState(false);
    const [showGrimoire, setShowGrimoire] = useState(false);
    
    // Store pending night action result to apply after handback
    const pendingNightActionResult = useRef<NightActionResult | null>(null);

    const state = getCurrentState(game);

    const updateGame = useCallback((newGame: Game) => {
        setGame(newGame);
        saveGame(newGame);
    }, []);

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
                // Role's shouldWake returned false - auto-skip (no visible history entry)
                const skippedGame = applyNightAction(currentGame, {
                    entries: [
                        {
                            type: "night_skipped",
                            message: [], // Empty message = hidden from history UI
                            data: {
                                roleId: step.roleId,
                                playerId: step.playerId,
                                reason: "should_wake_false",
                            },
                        },
                    ],
                });
                updateGame(skippedGame);
                // Recursively advance to next step
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

        // Go to handback screen before processing
        setScreen({ type: "handback", afterAction: "role_reveal", playerId: screen.playerId });
    };

    const handleNightActionComplete = (result: NightActionResult) => {
        if (screen.type !== "night_action") return;

        // Store result and go to handback screen
        pendingNightActionResult.current = result;
        setScreen({ type: "handback", afterAction: "night_action", playerId: screen.playerId });
    };

    const handleHandbackComplete = () => {
        if (screen.type !== "handback") return;

        if (screen.afterAction === "role_reveal") {
            // Process role reveal
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
            // Process night action
            const result = pendingNightActionResult.current;
            if (!result) {
                advanceToNextStep(game);
                return;
            }

            const newGame = applyNightAction(game, result);
            updateGame(newGame);
            pendingNightActionResult.current = null;

            const winner = checkWinCondition(getCurrentState(newGame));
            if (winner) {
                const finalGame = endGame(newGame, winner);
                updateGame(finalGame);
                setScreen({ type: "game_over" });
            } else {
                advanceToNextStep(newGame);
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

        const winner = checkWinCondition(getCurrentState(newGame));
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
        setScreen({ type: "voting", nomineeId });
    };

    const handleVoteComplete = (votesFor: string[], votesAgainst: string[]) => {
        if (screen.type !== "voting") return;

        const newGame = resolveVote(game, screen.nomineeId, votesFor, votesAgainst);
        updateGame(newGame);

        const winner = checkWinCondition(getCurrentState(newGame));
        if (winner) {
            const finalGame = endGame(newGame, winner);
            updateGame(finalGame);
            setScreen({ type: "game_over" });
        } else {
            setScreen({ type: "day" });
        }
    };

    const handleEndDay = () => {
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
            returnTo: screen 
        });
    };

    const handleRoleCardClose = () => {
        if (screen.type === "grimoire_role_card") {
            setScreen(screen.returnTo);
        }
    };

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
                        {/* Back button */}
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
                                {/* Moon icon */}
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

            case "day":
                return (
                    <DayPhase
                        state={state}
                        canNominate={!hasExecutionToday(game)}
                        onNominate={handleOpenNomination}
                        onEndDay={handleEndDay}
                        onMainMenu={onMainMenu}
                        onShowRoleCard={handleShowRoleCard}
                    />
                );

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

            {/* Floating Language Toggle - always available */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageToggle variant="floating" />
            </div>

            {/* Floating Action Buttons */}
            {showFloatingButtons && (
                <div className="fixed bottom-4 right-4 flex flex-col gap-2">
                    {/* Grimoire Button */}
                    <button
                        onClick={() => setShowGrimoire(true)}
                        className="w-12 h-12 rounded-full bg-grimoire-dark/90 border border-mystic-gold/30 text-mystic-gold flex items-center justify-center shadow-lg hover:bg-grimoire-dark hover:border-mystic-gold/50 transition-colors"
                        title="Grimoire"
                    >
                        <Icon name="scrollText" size="md" />
                    </button>
                    
                    {/* History Button */}
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
            // This shouldn't happen on initial load, but handle it gracefully
            // The component will handle this via advanceToNextStep after mount
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
