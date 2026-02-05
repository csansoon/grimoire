import { Game, getCurrentState } from "../../lib/types";
import { useI18n } from "../../lib/i18n";
import { RichMessage } from "../items/RichMessage";
import { Button, Icon, IconName } from "../atoms";

type Props = {
    game: Game;
    onClose: () => void;
};

const eventIcons: Record<string, { name: IconName; className: string }> = {
    game_created: { name: "sparkles", className: "text-mystic-gold" },
    night_started: { name: "moon", className: "text-indigo-400" },
    role_revealed: { name: "eye", className: "text-purple-400" },
    night_action: { name: "swords", className: "text-red-400" },
    night_skipped: { name: "zapOff", className: "text-parchment-500" },
    night_resolved: { name: "sun", className: "text-yellow-400" },
    day_started: { name: "sun", className: "text-orange-400" },
    nomination: { name: "userPlus", className: "text-orange-300" },
    vote: { name: "vote", className: "text-purple-300" },
    execution: { name: "skull", className: "text-red-500" },
    effect_added: { name: "sparkles", className: "text-cyan-400" },
    effect_removed: { name: "x", className: "text-parchment-500" },
    game_ended: { name: "trophy", className: "text-mystic-gold" },
};

export function HistoryView({ game, onClose }: Props) {
    const { t, language } = useI18n();
    const state = getCurrentState(game);

    const formatTime = (timestamp: number) => {
        const locale = language === "es" ? "es-ES" : "en-US";
        return new Date(timestamp).toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-grimoire-purple via-grimoire-dark to-grimoire-darker">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-grimoire-dark/95 backdrop-blur-sm border-b border-mystic-gold/20 px-4 py-3">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        <Icon name="scrollText" size="md" className="text-mystic-gold" />
                        <h1 className="font-tarot text-lg text-parchment-100 tracking-wider uppercase">
                            {t.game.gameHistory}
                        </h1>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="text-parchment-400 hover:text-parchment-100"
                    >
                        <Icon name="x" size="md" />
                    </Button>
                </div>
            </div>

            {/* Event List - Simple, no cards */}
            <div className="max-w-lg mx-auto px-4 py-4">
                <div className="space-y-0">
                    {game.history.map((entry, index) => {
                        const iconConfig = eventIcons[entry.type];
                        const isLast = index === game.history.length - 1;
                        
                        return (
                            <div key={entry.id} className="relative">
                                {/* Timeline line */}
                                {!isLast && (
                                    <div className="absolute left-[11px] top-8 bottom-0 w-px bg-parchment-500/20" />
                                )}
                                
                                {/* Event row */}
                                <div className="flex gap-4 py-3">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        {iconConfig ? (
                                            <Icon
                                                name={iconConfig.name}
                                                size="sm"
                                                className={iconConfig.className}
                                            />
                                        ) : (
                                            <Icon
                                                name="circle"
                                                size="sm"
                                                className="text-parchment-500"
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-parchment-200 text-sm leading-relaxed">
                                            <RichMessage
                                                message={entry.message}
                                                state={state}
                                            />
                                        </div>
                                        <div className="text-xs text-parchment-500 mt-1">
                                            {formatTime(entry.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {game.history.length === 0 && (
                    <div className="text-center py-12 text-parchment-500">
                        <Icon name="scrollText" size="3xl" className="mx-auto mb-4 opacity-30" />
                        <p className="text-sm">No events yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
