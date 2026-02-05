import { useState } from "react";
import { GameState, getAlivePlayers } from "../../lib/types";
import { useI18n } from "../../lib/i18n";
import { Button, Icon } from "../atoms";
import { MysticDivider } from "../items";

type Props = {
    state: GameState;
    onNominate: (nominatorId: string, nomineeId: string) => void;
    onBack: () => void;
};

export function NominationScreen({ state, onNominate, onBack }: Props) {
    const { t } = useI18n();
    const [nominator, setNominator] = useState<string | null>(null);
    const [nominee, setNominee] = useState<string | null>(null);

    const alivePlayers = getAlivePlayers(state);

    const handleNominate = () => {
        if (nominator && nominee) {
            onNominate(nominator, nominee);
        }
    };

    const canNominate = nominator && nominee;

    return (
        <div className="min-h-app bg-gradient-to-b from-red-950 via-grimoire-blood to-grimoire-darker flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-grimoire-dark/95 backdrop-blur-sm border-b border-red-500/30 px-4 py-3">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                    >
                        <Icon name="arrowLeft" size="md" />
                    </button>
                    <div>
                        <h1 className="font-tarot text-lg text-parchment-100 tracking-wider uppercase">
                            {t.game.newNomination}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
                {/* Nominator Selection */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-parchment-400 text-xs tracking-wider uppercase mb-3">
                        <Icon name="userRound" size="sm" />
                        {t.game.whoIsNominating}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {alivePlayers.map((player) => (
                            <button
                                key={player.id}
                                onClick={() => {
                                    setNominator(player.id);
                                    // Clear nominee if it's the same as nominator
                                    if (nominee === player.id) setNominee(null);
                                }}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                    nominator === player.id
                                        ? "bg-red-900/40 border-red-500/60 text-parchment-100"
                                        : "bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10"
                                }`}
                            >
                                <span className="text-sm font-medium">{player.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <MysticDivider icon="swords" iconClassName="text-red-500/50" className="mb-6" />

                {/* Nominee Selection */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-parchment-400 text-xs tracking-wider uppercase mb-3">
                        <Icon name="userX" size="sm" />
                        {t.game.whoAreTheyNominating}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {alivePlayers
                            .filter((p) => p.id !== nominator)
                            .map((player) => (
                                <button
                                    key={player.id}
                                    onClick={() => setNominee(player.id)}
                                    disabled={!nominator}
                                    className={`p-3 rounded-lg border text-left transition-colors ${
                                        nominee === player.id
                                            ? "bg-red-900/40 border-red-500/60 text-parchment-100"
                                            : !nominator
                                                ? "bg-white/5 border-white/10 text-parchment-500 opacity-50"
                                                : "bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10"
                                    }`}
                                >
                                    <span className="text-sm font-medium">{player.name}</span>
                                </button>
                            ))}
                    </div>
                </div>

                {/* Summary */}
                {nominator && nominee && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-center">
                        <p className="text-parchment-200 text-sm">
                            <span className="font-medium text-parchment-100">
                                {alivePlayers.find((p) => p.id === nominator)?.name}
                            </span>
                            {" nominates "}
                            <span className="font-medium text-red-300">
                                {alivePlayers.find((p) => p.id === nominee)?.name}
                            </span>
                            {" for execution"}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-red-500/30 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={handleNominate}
                        disabled={!canNominate}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-red-700 to-red-900 font-tarot uppercase tracking-wider"
                    >
                        <Icon name="swords" size="md" className="mr-2" />
                        {t.game.startNomination}
                    </Button>
                </div>
            </div>
        </div>
    );
}
