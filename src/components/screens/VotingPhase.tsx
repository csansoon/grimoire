import { useState } from "react";
import { GameState, PlayerState, isAlive, hasEffect, getAlivePlayers } from "../../lib/types";
import { getEffect } from "../../lib/effects";
import { useI18n, interpolate } from "../../lib/i18n";
import { Button, Icon } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    state: GameState;
    nomineeId: string;
    onVoteComplete: (votesFor: string[], votesAgainst: string[]) => void;
    onCancel: () => void;
};

type VoteValue = "for" | "against" | "abstain" | null;

export function VotingPhase({ state, nomineeId, onVoteComplete, onCancel }: Props) {
    const { t } = useI18n();
    const nominee = state.players.find((p) => p.id === nomineeId);
    const [votes, setVotes] = useState<Record<string, VoteValue>>({});

    const canPlayerVote = (player: PlayerState): boolean => {
        if (!isAlive(player)) {
            const deadEffect = getEffect("dead");
            if (deadEffect?.canVote) {
                return deadEffect.canVote(player, state);
            }
            return false;
        }
        return true;
    };

    const eligibleVoters = state.players.filter((p) => p.id !== nomineeId && canPlayerVote(p));

    const handleVote = (playerId: string, vote: VoteValue) => {
        setVotes({ ...votes, [playerId]: vote });
    };

    const handleConfirm = () => {
        const votesFor = Object.entries(votes).filter(([_, vote]) => vote === "for").map(([id]) => id);
        const votesAgainst = Object.entries(votes).filter(([_, vote]) => vote === "against").map(([id]) => id);
        onVoteComplete(votesFor, votesAgainst);
    };

    const votesForCount = Object.values(votes).filter((v) => v === "for").length;
    const votesAgainstCount = Object.values(votes).filter((v) => v === "against").length;
    const abstentions = Object.values(votes).filter((v) => v === "abstain").length;

    const aliveCount = getAlivePlayers(state).length;
    const majority = Math.ceil(aliveCount / 2);
    const willPass = votesForCount >= majority;

    if (!nominee) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-950 via-grimoire-blood to-grimoire-darker flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-red-900/50 to-transparent px-4 py-6 text-center">
                <div className="flex justify-center mb-2">
                    <Icon name="scale" size="3xl" className="text-red-400" />
                </div>
                <h1 className="font-tarot text-xl text-parchment-100 tracking-wider uppercase">
                    {interpolate(t.game.executePlayer, { player: nominee.name })}
                </h1>
                <p className="text-parchment-400 text-sm">
                    {interpolate(t.game.majorityNeeded, { count: majority })}
                </p>
            </div>

            {/* Vote Tally */}
            <div className="px-4 max-w-lg mx-auto w-full">
                <div className="flex justify-around py-4 border-b border-white/10">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{votesForCount}</div>
                        <div className="text-green-300/70 text-xs uppercase tracking-wider">{t.game.votesFor}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{votesAgainstCount}</div>
                        <div className="text-red-300/70 text-xs uppercase tracking-wider">{t.game.votesAgainst}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-parchment-500">{abstentions}</div>
                        <div className="text-parchment-500/70 text-xs uppercase tracking-wider">{t.game.abstain}</div>
                    </div>
                </div>
            </div>

            {/* Voters */}
            <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full overflow-y-auto">
                <div className="space-y-2">
                    {eligibleVoters.map((player) => {
                        const isDead = hasEffect(player, "dead");
                        const currentVote = votes[player.id];

                        return (
                            <div key={player.id} className="border border-white/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    {isDead && <Icon name="skull" size="sm" className="text-parchment-500" />}
                                    <span className="text-parchment-200 text-sm flex-1">{player.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleVote(player.id, "for")}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1",
                                            currentVote === "for"
                                                ? "bg-green-600 text-white"
                                                : "bg-white/5 text-parchment-400 hover:bg-white/10"
                                        )}
                                    >
                                        <Icon name="thumbsUp" size="sm" />
                                    </button>
                                    <button
                                        onClick={() => handleVote(player.id, "against")}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1",
                                            currentVote === "against"
                                                ? "bg-red-600 text-white"
                                                : "bg-white/5 text-parchment-400 hover:bg-white/10"
                                        )}
                                    >
                                        <Icon name="thumbsDown" size="sm" />
                                    </button>
                                    <button
                                        onClick={() => handleVote(player.id, "abstain")}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1",
                                            currentVote === "abstain"
                                                ? "bg-parchment-500 text-grimoire-dark"
                                                : "bg-white/5 text-parchment-400 hover:bg-white/10"
                                        )}
                                    >
                                        <Icon name="minus" size="sm" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Execution Preview */}
            <div className="px-4 max-w-lg mx-auto w-full">
                <div
                    className={cn(
                        "rounded-lg p-3 text-center border mb-4",
                        willPass
                            ? "bg-red-900/30 border-red-600/50"
                            : "bg-green-900/30 border-green-600/50"
                    )}
                >
                    {willPass ? (
                        <p className="text-red-200 text-sm">
                            ⚰️ {interpolate(t.game.willBeExecuted, { player: nominee.name, votes: votesForCount, majority })}
                        </p>
                    ) : (
                        <p className="text-green-200 text-sm">
                            ✓ {interpolate(t.game.willNotBeExecuted, { player: nominee.name, votes: votesForCount, majority })}
                        </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-red-500/30 px-4 py-4">
                <div className="max-w-lg mx-auto space-y-2">
                    <Button
                        onClick={handleConfirm}
                        fullWidth
                        className="bg-gradient-to-r from-red-700 to-red-900 font-tarot uppercase tracking-wider"
                    >
                        {t.game.confirmVotes}
                    </Button>
                    <Button onClick={onCancel} fullWidth variant="ghost" className="text-parchment-400">
                        {t.game.cancelNomination}
                    </Button>
                </div>
            </div>
        </div>
    );
}
