import { ReactNode } from "react";
import { Icon, Button } from "../atoms";
import { IconName } from "../atoms/icon";
import { useI18n } from "../../lib/i18n";

type NarratorSetupLayoutProps = {
    icon: IconName;
    roleName: string;
    playerName: string;
    children: ReactNode;
    footer?: ReactNode;
    // If provided, shows a default "Show to Player" button
    onShowToPlayer?: () => void;
    showToPlayerDisabled?: boolean;
    showToPlayerLabel?: string;
};

export function NarratorSetupLayout({
    icon,
    roleName,
    playerName,
    children,
    footer,
    onShowToPlayer,
    showToPlayerDisabled,
    showToPlayerLabel,
}: NarratorSetupLayoutProps) {
    const { t } = useI18n();

    return (
        <div className="min-h-app bg-gradient-to-b from-indigo-950 via-grimoire-purple to-grimoire-darker flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-blue-900/50 to-transparent px-4 py-6 text-center">
                <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                        <Icon name={icon} size="2xl" className="text-blue-300" />
                    </div>
                </div>
                <h1 className="font-tarot text-xl text-parchment-100 tracking-wider uppercase">
                    {t.game.narratorSetup}
                </h1>
                <p className="text-parchment-400 text-sm mt-1">
                    {roleName} - {playerName}
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full overflow-y-auto">
                {children}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-blue-500/30 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    {footer ?? (
                        <Button
                            onClick={onShowToPlayer}
                            disabled={showToPlayerDisabled}
                            fullWidth
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 font-tarot uppercase tracking-wider"
                        >
                            <Icon name="eye" size="md" className="mr-2" />
                            {showToPlayerLabel ?? t.game.showToPlayer}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
