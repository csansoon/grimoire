import { getGameSummaries, getCurrentGameId, GameSummary } from "../../lib/storage";
import { useI18n, Language } from "../../lib/i18n";
import { Icon } from "../atoms";

type Props = {
    onNewGame: () => void;
    onContinue: (gameId: string) => void;
    onLoadGame: (gameId: string) => void;
};

const LANGUAGE_LABELS: Record<Language, string> = {
    en: "EN",
    es: "ES",
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
        <div className="min-h-screen bg-gradient-to-b from-grimoire-purple via-grimoire-dark to-grimoire-darker flex flex-col p-4">
            {/* Language Selector - Top Right */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-mystic-gold/30 text-mystic-gold/70 hover:text-mystic-gold hover:border-mystic-gold/50 transition-colors text-sm"
                >
                    <Icon name="globe" size="sm" />
                    {LANGUAGE_LABELS[language]}
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    {/* Mystical Eye Icon */}
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-mystic-gold/10 border border-mystic-gold/30 flex items-center justify-center shadow-tarot-glow">
                            <Icon name="eye" size="3xl" className="text-mystic-gold text-glow-gold" />
                        </div>
                    </div>
                    
                    <h1 className="font-tarot text-4xl font-bold text-parchment-100 tracking-widest-xl uppercase mb-3">
                        {t.mainMenu.title}
                    </h1>
                    <p className="text-parchment-400 text-sm tracking-wider">
                        {t.mainMenu.subtitle}
                    </p>
                    
                    {/* Decorative divider */}
                    <div className="divider-mystic mt-6">
                        <Icon name="sparkles" size="sm" className="text-mystic-gold/40" />
                    </div>
                </div>

                {/* Main Actions */}
                <div className="w-full space-y-4 mb-8">
                    {/* Continue Current Game */}
                    {currentGame && currentGame.phase !== "ended" && (
                        <button
                            onClick={() => onContinue(currentGame.id)}
                            className="w-full p-4 rounded-xl bg-gradient-to-r from-mystic-gold/20 to-mystic-bronze/20 border border-mystic-gold/40 hover:border-mystic-gold/60 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <div className="font-tarot text-lg text-mystic-gold tracking-wider uppercase">
                                        {t.mainMenu.continueGame}
                                    </div>
                                    <div className="text-sm text-parchment-400 mt-1">
                                        {currentGame.name} • {formatPhase(currentGame)}
                                    </div>
                                </div>
                                <Icon name="play" size="lg" className="text-mystic-gold group-hover:scale-110 transition-transform" />
                            </div>
                        </button>
                    )}

                    {/* New Game */}
                    <button
                        onClick={onNewGame}
                        className="w-full p-4 rounded-xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 hover:border-indigo-400/50 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <div className="font-tarot text-lg text-parchment-100 tracking-wider uppercase">
                                    {t.mainMenu.newGame}
                                </div>
                                <div className="text-sm text-parchment-400 mt-1">
                                    {t.mainMenu.startFreshGame}
                                </div>
                            </div>
                            <Icon name="sparkles" size="lg" className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        </div>
                    </button>
                </div>

                {/* Previous Games - Simple List */}
                {games.length > 0 && (
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-3 text-parchment-400">
                            <Icon name="clock" size="sm" />
                            <span className="text-sm tracking-wider uppercase">
                                {t.mainMenu.previousGames}
                            </span>
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {games.map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => onLoadGame(game.id)}
                                    className="w-full py-3 px-4 text-left hover:bg-white/5 rounded-lg transition-colors group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Icon 
                                                name={game.phase === "ended" ? "checkCircle" : "circle"} 
                                                size="sm" 
                                                className={game.phase === "ended" ? "text-green-500/70" : "text-parchment-500"} 
                                            />
                                            <div>
                                                <div className="text-parchment-200 group-hover:text-parchment-100">
                                                    {game.name}
                                                </div>
                                                <div className="text-xs text-parchment-500">
                                                    {game.playerCount} {t.common.players.toLowerCase()} • {formatPhase(game)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-parchment-500">
                                            {formatDate(game.createdAt)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
