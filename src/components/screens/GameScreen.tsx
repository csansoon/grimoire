import { useState, useCallback } from "react";
import { Game, getCurrentState, getPlayer } from "../../lib/types";
import { getRole } from "../../lib/roles";
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
} from "../../lib/game";
import { saveGame } from "../../lib/storage";
import { useI18n, interpolate } from "../../lib/i18n";
import { NarratorPrompt } from "./NarratorPrompt";
import { DayPhase } from "./DayPhase";
import { VotingPhase } from "./VotingPhase";
import { GameOver } from "./GameOver";
import { HistoryView } from "./HistoryView";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Icon } from "../atoms";

type Props = {
    initialGame: Game;
    onMainMenu: () => void;
};

type Screen =
    | { type: "narrator_prompt"; playerId: string; action: "role_reveal" | "night_action" }
    | { type: "role_reveal"; playerId: string }
    | { type: "night_action"; playerId: string; roleId: string }
    | { type: "night_waiting" }
    | { type: "day" }
    | { type: "voting"; nomineeId: string }
    | { type: "game_over" }
    | { type: "history" };

export function GameScreen({ initialGame, onMainMenu }: Props) {
    const { t } = useI18n();
    const [game, setGame] = useState<Game>(initialGame);
    const [screen, setScreen] = useState<Screen>(() => getInitialScreen(initialGame));
    const [showHistory, setShowHistory] = useState(false);

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
    };

    const handleNightActionComplete = (result: Parameters<typeof applyNightAction>[1]) => {
        const newGame = applyNightAction(game, result);
        updateGame(newGame);

        const winner = checkWinCondition(getCurrentState(newGame));
        if (winner) {
            const finalGame = endGame(newGame, winner);
            updateGame(finalGame);
            setScreen({ type: "game_over" });
        } else {
            advanceToNextStep(newGame);
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

    if (showHistory) {
        return <HistoryView game={game} onClose={() => setShowHistory(false)} />;
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
                        state={state}
                        player={player}
                        onComplete={handleNightActionComplete}
                    />
                );
            }

            case "night_waiting":
                return (
                    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6">
                        <Card className="max-w-md w-full">
                            <CardHeader className="text-center">
                                <div className="flex justify-center mb-4">
                                    <Icon name="moon" size="4xl" className="text-indigo-400" />
                                </div>
                                <CardTitle>
                                    {interpolate(t.game.nightComplete, { round: state.round })}
                                </CardTitle>
                                <CardDescription>
                                    {t.game.nightActionsResolved}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={handleStartDay}
                                    fullWidth
                                    size="lg"
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                >
                                    <Icon name="sun" size="md" className="mr-2" />
                                    {t.game.startDay}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                );

            case "day":
                return (
                    <DayPhase
                        state={state}
                        onNominate={handleNominate}
                        onEndDay={handleEndDay}
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
                return <GameOver state={state} onMainMenu={onMainMenu} />;

            default:
                return null;
        }
    };

    const showHistoryButton =
        screen.type !== "role_reveal" &&
        screen.type !== "night_action" &&
        screen.type !== "game_over";

    return (
        <div className="relative">
            {renderScreen()}

            {showHistoryButton && (
                <Button
                    onClick={() => setShowHistory(true)}
                    variant="secondary"
                    size="icon"
                    className="fixed bottom-4 right-4 rounded-full shadow-lg"
                    title={t.common.history}
                >
                    <Icon name="scrollText" size="md" />
                </Button>
            )}
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
