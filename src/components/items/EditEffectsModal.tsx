import { PlayerState, hasEffect } from "../../lib/types";
import { getEffect, getAllEffects, EffectId } from "../../lib/effects";
import { useI18n } from "../../lib/i18n";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    Icon,
    Badge,
    Button,
} from "../atoms";

type Props = {
    player: PlayerState | null;
    open: boolean;
    onClose: () => void;
    onAddEffect: (playerId: string, effectType: string) => void;
    onRemoveEffect: (playerId: string, effectType: string) => void;
};

export function EditEffectsModal({ player, open, onClose, onAddEffect, onRemoveEffect }: Props) {
    const { t } = useI18n();

    if (!player) return null;

    const allEffects = getAllEffects();
    
    // Effects the player currently has
    const currentEffectTypes = player.effects.map(e => e.type);

    const getEffectName = (effectType: string) => {
        const effectKey = effectType as EffectId;
        return t.effects[effectKey]?.name ?? effectType;
    };

    const handleAddEffect = (effectType: string) => {
        onAddEffect(player.id, effectType);
    };

    const handleRemoveEffect = (effectType: string) => {
        onRemoveEffect(player.id, effectType);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-cyan-900/30 border-2 border-cyan-500/40 flex items-center justify-center">
                            <Icon name="sparkles" size="2xl" className="text-cyan-400" />
                        </div>
                    </div>
                    <DialogTitle>{t.ui.editEffects}</DialogTitle>
                    <p className="text-parchment-400 text-sm text-center mt-1">{player.name}</p>
                </DialogHeader>

                <DialogBody>
                    {/* Current Effects */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Icon name="sparkles" size="sm" className="text-cyan-400" />
                            <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                                {t.ui.currentEffects}
                            </span>
                        </div>
                        {currentEffectTypes.length === 0 ? (
                            <p className="text-parchment-500 text-sm italic">{t.ui.noEffects}</p>
                        ) : (
                            <div className="space-y-2">
                                {player.effects.map((effectInstance, index) => {
                                    const effect = getEffect(effectInstance.type);
                                    const effectName = getEffectName(effectInstance.type);

                                    return (
                                        <div
                                            key={`${effectInstance.type}-${index}`}
                                            className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                {effect && <Icon name={effect.icon} size="sm" className="text-cyan-400" />}
                                                <span className="text-parchment-200 text-sm">{effectName}</span>
                                            </div>
                                            <Button
                                                onClick={() => handleRemoveEffect(effectInstance.type)}
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            >
                                                <Icon name="minus" size="sm" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Add Effects */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Icon name="plus" size="sm" className="text-green-400" />
                            <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                                {t.ui.addEffect}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {allEffects.map((effect) => {
                                const effectName = getEffectName(effect.id);
                                const alreadyHas = hasEffect(player, effect.id);

                                return (
                                    <button
                                        key={effect.id}
                                        onClick={() => handleAddEffect(effect.id)}
                                        disabled={alreadyHas}
                                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-left ${
                                            alreadyHas
                                                ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed"
                                                : "bg-white/5 border-white/10 hover:border-green-500/50 hover:bg-green-900/20"
                                        }`}
                                    >
                                        <Icon name={effect.icon} size="sm" className={alreadyHas ? "text-parchment-500" : "text-parchment-300"} />
                                        <span className={`text-sm ${alreadyHas ? "text-parchment-500" : "text-parchment-200"}`}>
                                            {effectName}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="mt-6">
                        <Button onClick={onClose} fullWidth variant="outline">
                            {t.common.confirm}
                        </Button>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
