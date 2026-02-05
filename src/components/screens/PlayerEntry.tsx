import { useState } from "react";
import { useI18n } from "../../lib/i18n";
import { Button, Icon } from "../atoms";

type Props = {
    onNext: (players: string[]) => void;
    onBack: () => void;
};

export function PlayerEntry({ onNext, onBack }: Props) {
    const { t } = useI18n();
    const [players, setPlayers] = useState<string[]>([""]);

    const addPlayer = () => {
        setPlayers([...players, ""]);
    };

    const updatePlayer = (index: number, name: string) => {
        const updated = [...players];
        updated[index] = name;
        setPlayers(updated);
    };

    const removePlayer = (index: number) => {
        if (players.length <= 1) return;
        setPlayers(players.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        const validPlayers = players.filter((name) => name.trim().length > 0);
        if (validPlayers.length >= 2) {
            onNext(validPlayers);
        }
    };

    const validCount = players.filter((name) => name.trim().length > 0).length;
    const canProceed = validCount >= 2;

    return (
        <div className="min-h-screen bg-gradient-to-b from-grimoire-purple via-grimoire-dark to-grimoire-darker flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-grimoire-dark/95 backdrop-blur-sm border-b border-mystic-gold/20 px-4 py-3">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                    >
                        <Icon name="arrowLeft" size="md" />
                    </button>
                    <div>
                        <h1 className="font-tarot text-lg text-parchment-100 tracking-wider uppercase">
                            {t.newGame.step1Title}
                        </h1>
                        <p className="text-xs text-parchment-500">{t.newGame.step1Subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
                {/* Player Count */}
                <div className="flex items-center gap-2 mb-4 text-parchment-400">
                    <Icon name="users" size="sm" />
                    <span className="text-sm tracking-wider">
                        {t.common.players} ({validCount})
                    </span>
                </div>

                {/* Player List */}
                <div className="space-y-3 mb-6">
                    {players.map((player, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={player}
                                onChange={(e) => updatePlayer(index, e.target.value)}
                                placeholder={`${t.newGame.playerPlaceholder} ${index + 1}`}
                                className="flex-1 bg-white/5 border border-parchment-500/30 text-parchment-100 placeholder-parchment-500 rounded-lg px-4 py-3 focus:outline-none focus:border-mystic-gold/50 focus:ring-1 focus:ring-mystic-gold/30 transition-colors"
                            />
                            {players.length > 1 && (
                                <button
                                    onClick={() => removePlayer(index)}
                                    className="p-3 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Icon name="trash" size="md" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Player Button */}
                <button
                    onClick={addPlayer}
                    className="w-full py-3 border border-dashed border-parchment-500/30 text-parchment-400 rounded-lg hover:border-parchment-400/50 hover:text-parchment-300 transition-colors flex items-center justify-center gap-2"
                >
                    <Icon name="plus" size="md" />
                    {t.newGame.addPlayer}
                </button>

                {!canProceed && (
                    <p className="text-center text-mystic-gold/60 text-sm mt-4">
                        {t.newGame.minPlayersWarning}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-mystic-gold/20 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-mystic-gold to-mystic-bronze text-grimoire-dark font-tarot uppercase tracking-wider"
                    >
                        {t.newGame.nextSelectRoles}
                        <Icon name="arrowRight" size="md" className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
