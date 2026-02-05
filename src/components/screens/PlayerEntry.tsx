import { useState } from "react";
import { useI18n } from "../../lib/i18n";
import { Button, Icon, Card, CardContent, CardHeader, CardTitle, CardDescription } from "../atoms";

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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={onBack}
                                variant="ghost"
                                size="icon"
                            >
                                <Icon name="arrowLeft" size="md" />
                            </Button>
                            <div>
                                <CardTitle>{t.newGame.step1Title}</CardTitle>
                                <CardDescription>{t.newGame.step1Subtitle}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Player List */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Icon name="users" size="md" />
                            {t.common.players} ({validCount})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {players.map((player, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={player}
                                    onChange={(e) =>
                                        updatePlayer(index, e.target.value)
                                    }
                                    placeholder={`${t.newGame.playerPlaceholder} ${index + 1}`}
                                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                                {players.length > 1 && (
                                    <Button
                                        onClick={() => removePlayer(index)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                    >
                                        <Icon name="trash" size="md" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button
                            onClick={addPlayer}
                            variant="outline"
                            fullWidth
                            className="border-dashed"
                        >
                            <Icon name="plus" size="md" className="mr-2" />
                            {t.newGame.addPlayer}
                        </Button>
                    </CardContent>
                </Card>

                {/* Next Button */}
                <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    fullWidth
                    size="lg"
                >
                    {t.newGame.nextSelectRoles}
                    <Icon name="arrowRight" size="md" className="ml-2" />
                </Button>

                {!canProceed && (
                    <p className="text-center text-yellow-300/70 text-sm">
                        {t.newGame.minPlayersWarning}
                    </p>
                )}
            </div>
        </div>
    );
}
