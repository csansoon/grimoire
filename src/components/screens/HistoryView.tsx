import { Game, getCurrentState } from "../../lib/types";
import { useI18n } from "../../lib/i18n";
import { RichMessage } from "../items/RichMessage";
import { Button, Card, CardContent, CardHeader, CardTitle, Icon, IconName } from "../atoms";

type Props = {
    game: Game;
    onClose: () => void;
};

const eventIcons: Record<string, { name: IconName; className: string }> = {
    game_created: { name: "gamepad", className: "text-purple-400" },
    night_started: { name: "moon", className: "text-indigo-400" },
    role_revealed: { name: "eye", className: "text-blue-400" },
    night_action: { name: "swords", className: "text-red-400" },
    night_skipped: { name: "zapOff", className: "text-gray-400" },
    night_resolved: { name: "sun", className: "text-yellow-400" },
    day_started: { name: "sun", className: "text-orange-400" },
    nomination: { name: "userPlus", className: "text-orange-400" },
    vote: { name: "vote", className: "text-purple-400" },
    execution: { name: "skull", className: "text-red-400" },
    effect_added: { name: "sparkles", className: "text-cyan-400" },
    effect_removed: { name: "x", className: "text-gray-400" },
    game_ended: { name: "trophy", className: "text-yellow-400" },
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Icon name="scrollText" size="md" />
                            {t.game.gameHistory}
                        </CardTitle>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="icon"
                        >
                            <Icon name="x" size="md" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                            {game.history.map((entry) => {
                                const iconConfig = eventIcons[entry.type];
                                return (
                                    <div
                                        key={entry.id}
                                        className="bg-white/5 rounded-xl p-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5">
                                                {iconConfig ? (
                                                    <Icon
                                                        name={iconConfig.name}
                                                        size="md"
                                                        className={iconConfig.className}
                                                    />
                                                ) : (
                                                    <Icon
                                                        name="scrollText"
                                                        size="md"
                                                        className="text-gray-400"
                                                    />
                                                )}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm">
                                                    <RichMessage
                                                        message={entry.message}
                                                        state={state}
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {formatTime(entry.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
