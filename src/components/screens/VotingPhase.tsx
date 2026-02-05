import { useState } from "react";
import { GameState, PlayerState, isAlive, hasEffect, getAlivePlayers } from "../../lib/types";
import { getEffect } from "../../lib/effects";
import { useI18n, interpolate } from "../../lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Icon } from "../atoms";
import { VoteButton } from "../inputs/VoteButton";
import { cn } from "../../lib/utils";

type Props = {
    state: GameState;
    nomineeId: string;
    onVoteComplete: (votesFor: string[], votesAgainst: string[]) => void;
    onCancel: () => void;
};

type VoteValue = "for" | "against" | "abstain" | null;

export function VotingPhase({
    state,
    nomineeId,
    onVoteComplete,
    onCancel,
}: Props) {
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

    const eligibleVoters = state.players.filter(
        (p) => p.id !== nomineeId && canPlayerVote(p)
    );

    const handleVote = (playerId: string, vote: VoteValue) => {
        setVotes({ ...votes, [playerId]: vote });
    };

    const handleConfirm = () => {
        const votesFor = Object.entries(votes)
            .filter(([_, vote]) => vote === "for")
            .map(([id]) => id);
        const votesAgainst = Object.entries(votes)
            .filter(([_, vote]) => vote === "against")
            .map(([id]) => id);

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
        <div className="min-h-screen bg-gradient-to-br from-red-800 to-orange-900 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <Icon name="scale" size="3xl" className="text-white/80" />
                    </div>
                    <CardTitle>{interpolate(t.game.executePlayer, { player: nominee.name })}</CardTitle>
                    <CardDescription>
                        {interpolate(t.game.majorityNeeded, { count: majority })}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Vote Tally */}
                    <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex justify-around text-center">
                            <div>
                                <div className="text-3xl font-bold text-green-400">
                                    {votesForCount}
                                </div>
                                <div className="text-green-200 text-sm">{t.game.votesFor}</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-400">
                                    {votesAgainstCount}
                                </div>
                                <div className="text-red-200 text-sm">{t.game.votesAgainst}</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-400">
                                    {abstentions}
                                </div>
                                <div className="text-gray-300 text-sm">{t.game.abstain}</div>
                            </div>
                        </div>
                    </div>

                    {/* Voters */}
                    <div className="space-y-2">
                        {eligibleVoters.map((player) => {
                            const isDead = hasEffect(player, "dead");
                            const currentVote = votes[player.id];

                            return (
                                <div
                                    key={player.id}
                                    className="bg-white/5 rounded-xl p-3"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white flex items-center gap-2">
                                            {isDead && (
                                                <Icon name="skull" size="sm" className="text-gray-400" />
                                            )}
                                            {player.name}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <VoteButton
                                            value="for"
                                            selected={currentVote === "for"}
                                            onClick={() => handleVote(player.id, "for")}
                                        />
                                        <VoteButton
                                            value="against"
                                            selected={currentVote === "against"}
                                            onClick={() => handleVote(player.id, "against")}
                                        />
                                        <VoteButton
                                            value="abstain"
                                            selected={currentVote === "abstain"}
                                            onClick={() => handleVote(player.id, "abstain")}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Execution Preview */}
                    <div
                        className={cn(
                            "rounded-xl p-4 text-center border",
                            willPass
                                ? "bg-red-600/20 border-red-500/50"
                                : "bg-green-600/20 border-green-500/50"
                        )}
                    >
                        {willPass ? (
                            <p className="text-red-200 font-medium">
                                ⚰️ {interpolate(t.game.willBeExecuted, {
                                    player: nominee.name,
                                    votes: votesForCount,
                                    majority: majority,
                                })}
                            </p>
                        ) : (
                            <p className="text-green-200 font-medium">
                                ✓ {interpolate(t.game.willNotBeExecuted, {
                                    player: nominee.name,
                                    votes: votesForCount,
                                    majority: majority,
                                })}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button onClick={handleConfirm} fullWidth variant="primary">
                            {t.game.confirmVotes}
                        </Button>
                        <Button onClick={onCancel} fullWidth variant="secondary">
                            {t.game.cancelNomination}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
