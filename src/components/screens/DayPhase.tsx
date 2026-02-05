import { GameState, PlayerState } from "../../lib/types";
import { useI18n } from "../../lib/i18n";
import { Button, Icon } from "../atoms";
import { Grimoire } from "../items/Grimoire";
import { MysticDivider } from "../items";

type Props = {
    state: GameState;
    canNominate: boolean;
    hasSlayerAction: boolean;
    onNominate: () => void;
    onSlayerAction: () => void;
    onEndDay: () => void;
    onMainMenu: () => void;
    onShowRoleCard?: (player: PlayerState) => void;
    onEditEffects?: (player: PlayerState) => void;
};

export function DayPhase({ state, canNominate, hasSlayerAction, onNominate, onSlayerAction, onEndDay, onMainMenu, onShowRoleCard, onEditEffects }: Props) {
    const { t } = useI18n();

    return (
        <div className="min-h-app bg-gradient-to-b from-orange-950 via-amber-950 to-grimoire-dark flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-amber-900/50 to-transparent px-4 py-4">
                <div className="max-w-lg mx-auto">
                    {/* Back button row */}
                    <div className="flex items-center mb-4">
                        <button
                            onClick={onMainMenu}
                            className="p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                        >
                            <Icon name="arrowLeft" size="md" />
                        </button>
                        <span className="text-parchment-500 text-xs ml-1">{t.common.mainMenu}</span>
                    </div>
                    
                    {/* Title section */}
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <Icon name="sun" size="3xl" className="text-amber-400 text-glow-gold" />
                        </div>
                        <h1 className="font-tarot text-2xl text-parchment-100 tracking-widest-xl uppercase">
                            {t.game.day} {state.round}
                        </h1>
                        <p className="text-parchment-400 text-sm">{t.game.discussionAndNominations}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full overflow-y-auto">
                {/* Grimoire Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Icon name="scrollText" size="sm" className="text-mystic-gold" />
                        <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                            {t.game.grimoire}
                        </span>
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <Grimoire state={state} compact onShowRoleCard={onShowRoleCard} onEditEffects={onEditEffects} />
                    </div>
                </div>

                {/* Divider */}
                <MysticDivider className="mb-6" />

                {/* Daytime Actions */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Icon name="swords" size="sm" className="text-red-400" />
                        <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                            {t.game.daytimeActions}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {/* Nomination Button */}
                        <button
                            onClick={onNominate}
                            disabled={!canNominate}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors group ${
                                canNominate
                                    ? "bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 hover:border-red-500/50"
                                    : "bg-gray-900/30 border border-gray-500/20 opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                                canNominate
                                    ? "bg-red-900/40 border border-red-500/40 group-hover:scale-105"
                                    : "bg-gray-900/40 border border-gray-500/30"
                            }`}>
                                <Icon name="userX" size="lg" className={canNominate ? "text-red-400" : "text-gray-500"} />
                            </div>
                            <div className="flex-1 text-left">
                                <div className={`font-tarot tracking-wider uppercase ${canNominate ? "text-parchment-100" : "text-parchment-500"}`}>
                                    {t.game.newNomination}
                                </div>
                                <p className="text-parchment-500 text-xs mt-0.5">
                                    {canNominate ? t.game.accusePlayerDescription : t.game.executionAlreadyHappened}
                                </p>
                            </div>
                            {canNominate && (
                                <Icon name="arrowRight" size="md" className="text-parchment-500 group-hover:text-parchment-300 transition-colors" />
                            )}
                        </button>

                        {/* Slayer Action Button */}
                        {hasSlayerAction && (
                            <button
                                onClick={onSlayerAction}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-900/30 to-orange-800/20 border border-amber-500/30 hover:border-amber-500/50 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-900/40 border border-amber-500/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Icon name="crosshair" size="lg" className="text-amber-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-tarot text-parchment-100 tracking-wider uppercase">
                                        {t.game.slayerAction}
                                    </div>
                                    <p className="text-parchment-500 text-xs mt-0.5">
                                        {t.game.slayerActionDescription}
                                    </p>
                                </div>
                                <Icon name="arrowRight" size="md" className="text-parchment-500 group-hover:text-parchment-300 transition-colors" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-indigo-500/30 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={onEndDay}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-700 font-tarot uppercase tracking-wider"
                    >
                        <Icon name="moon" size="md" className="mr-2" />
                        {t.game.endDayGoToNight}
                    </Button>
                </div>
            </div>
        </div>
    );
}
