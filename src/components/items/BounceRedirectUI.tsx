import { useState } from "react";
import { PipelineInputProps, KillIntent } from "../../lib/pipeline/types";
import { isAlive } from "../../lib/types";
import { useI18n } from "../../lib/i18n";
import { PlayerSelector } from "../inputs";
import { Button, Icon } from "../atoms";

/**
 * Pipeline UI component shown when a kill is redirected by the Bounce effect.
 * The narrator selects a new target for the kill (or keeps the original).
 */
export function BounceRedirectUI({ state, intent, onComplete }: PipelineInputProps) {
    const { t } = useI18n();
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const kill = intent as KillIntent;

    const originalTarget = state.players.find((p) => p.id === kill.targetId);

    // All alive players except the kill source (the demon) can be selected
    const alivePlayers = state.players.filter(
        (p) => isAlive(p) && p.id !== kill.sourceId
    );

    return (
        <div className="min-h-app bg-gradient-to-b from-red-950 via-grimoire-purple to-grimoire-darker flex flex-col items-center justify-center p-6">
            <div className="max-w-sm w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mb-4">
                        <Icon
                            name="trendingUpDown"
                            size="2xl"
                            className="text-amber-400"
                        />
                    </div>
                    <h2 className="font-tarot text-xl text-parchment-100 tracking-wider uppercase mb-2">
                        {t.roles.imp.bounceTitle}
                    </h2>
                    <p className="text-parchment-400 text-sm">
                        {t.roles.imp.bounceDescription.replace(
                            "{target}",
                            originalTarget?.name ?? "?"
                        )}
                    </p>
                </div>

                {/* Player Selector */}
                <div className="mb-6">
                    <PlayerSelector
                        players={alivePlayers}
                        selected={selectedTarget}
                        onSelect={setSelectedTarget}
                        showRoles
                        excludeEffects={["safe"]}
                        selectedIcon="skull"
                        variant="red"
                        getLabel={(p) =>
                            p.id === kill.targetId
                                ? t.roles.imp.bounceOriginalLabel
                                : undefined
                        }
                    />
                </div>

                {/* Confirm */}
                <Button
                    onClick={() => selectedTarget && onComplete(selectedTarget)}
                    disabled={!selectedTarget}
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-red-700 to-red-900 font-tarot uppercase tracking-wider"
                >
                    <Icon name="skull" size="md" className="mr-2" />
                    {t.common.confirm}
                </Button>
            </div>
        </div>
    );
}
