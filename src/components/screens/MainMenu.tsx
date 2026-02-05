import { getGameSummaries, getCurrentGameId, GameSummary } from "../../lib/storage";
import { useI18n, Language } from "../../lib/i18n";
import { Button, Icon, Card, CardContent, CardHeader, CardTitle } from "../atoms";

type Props = {
    onNewGame: () => void;
    onContinue: (gameId: string) => void;
    onLoadGame: (gameId: string) => void;
};

const LANGUAGE_LABELS: Record<Language, string> = {
    en: "English",
    es: "Español",
};

export function MainMenu({ onNewGame, onContinue, onLoadGame }: Props) {
    const { language, setLanguage, t } = useI18n();
    const games = getGameSummaries();
    const currentGameId = getCurrentGameId();
    const currentGame = games.find((g) => g.id === currentGameId);

    const formatDate = (timestamp: number) => {
        const locale = language === "es" ? "es-ES" : "en-US";
        return new Date(timestamp).toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPhase = (game: GameSummary) => {
        if (game.phase === "ended") return t.mainMenu.completed;
        if (game.phase === "setup") return t.mainMenu.settingUp;
        return `${t.mainMenu.round} ${game.round} - ${game.phase}`;
    };

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "es" : "en");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                {/* Language Selector */}
                <div className="flex justify-end">
                    <Button
                        onClick={toggleLanguage}
                        variant="ghost"
                        size="sm"
                        className="text-purple-200 hover:text-white"
                    >
                        <Icon name="globe" size="sm" className="mr-2" />
                        {LANGUAGE_LABELS[language]}
                    </Button>
                </div>

                {/* Logo */}
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-white mb-2">
                        🔮 {t.mainMenu.title}
                    </h1>
                    <p className="text-purple-200">
                        {t.mainMenu.subtitle}
                    </p>
                </div>

                {/* Main Actions */}
                <div className="space-y-3">
                    {/* Continue Current Game */}
                    {currentGame && currentGame.phase !== "ended" && (
                        <Button
                            onClick={() => onContinue(currentGame.id)}
                            variant="primary"
                            fullWidth
                            size="lg"
                            className="justify-between"
                        >
                            <div className="text-left">
                                <div className="font-bold">{t.mainMenu.continueGame}</div>
                                <div className="text-sm opacity-80">
                                    {currentGame.name} • {formatPhase(currentGame)}
                                </div>
                            </div>
                            <Icon name="play" size="lg" />
                        </Button>
                    )}

                    {/* New Game */}
                    <Button
                        onClick={onNewGame}
                        fullWidth
                        size="lg"
                        className="justify-between"
                    >
                        <div className="text-left">
                            <div className="font-bold">{t.mainMenu.newGame}</div>
                            <div className="text-sm opacity-80">
                                {t.mainMenu.startFreshGame}
                            </div>
                        </div>
                        <Icon name="sparkles" size="lg" />
                    </Button>
                </div>

                {/* Previous Games */}
                {games.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Icon name="clock" size="md" />
                                {t.mainMenu.previousGames}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {games.map((game) => (
                                    <button
                                        key={game.id}
                                        onClick={() => onLoadGame(game.id)}
                                        className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl transition duration-200 text-left"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">
                                                    {game.name}
                                                </div>
                                                <div className="text-sm text-purple-200">
                                                    {game.playerCount} {t.common.players.toLowerCase()} •{" "}
                                                    {formatPhase(game)}
                                                </div>
                                            </div>
                                            <div className="text-xs text-purple-300">
                                                {formatDate(game.createdAt)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
