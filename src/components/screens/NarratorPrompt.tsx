import { PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { useI18n, interpolate } from "../../lib/i18n";
import { Button, Icon } from "../atoms";
import { MysticDivider } from "../items";

type Props = {
    player: PlayerState;
    action: "role_reveal" | "night_action";
    onProceed: () => void;
    onMainMenu: () => void;
};

export function NarratorPrompt({ player, action, onProceed, onMainMenu }: Props) {
    const { t } = useI18n();
    const role = getRole(player.roleId);
    const roleId = role?.id as keyof typeof t.roles | undefined;
    const roleName = (roleId && t.roles[roleId]?.name) ?? roleId ?? "Unknown";

    const isRoleReveal = action === "role_reveal";

    return (
        <div className="min-h-app bg-gradient-to-b from-grimoire-purple via-grimoire-dark to-grimoire-darker flex flex-col">
            {/* Back button */}
            <div className="px-4 py-4">
                <button
                    onClick={onMainMenu}
                    className="flex items-center gap-1 p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                >
                    <Icon name="arrowLeft" size="md" />
                    <span className="text-xs">{t.common.mainMenu}</span>
                </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-sm w-full text-center">
                {/* Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-mystic-gold/10 border border-mystic-gold/30 flex items-center justify-center">
                        {isRoleReveal ? (
                            <Icon name="eye" size="3xl" className="text-mystic-gold text-glow-gold" />
                        ) : (
                            <Icon name="moon" size="3xl" className="text-indigo-400" />
                        )}
                    </div>
                </div>

                {/* Narrator label */}
                <p className="text-parchment-500 text-xs tracking-widest uppercase mb-2">
                    Narrator
                </p>

                {/* Message */}
                <p className="font-tarot text-xl text-parchment-100 leading-relaxed mb-8">
                    {isRoleReveal
                        ? interpolate(t.game.narratorGiveDevice, { player: player.name })
                        : interpolate(t.game.narratorWakePlayer, { player: player.name, role: roleName })}
                </p>

                {/* Decorative divider */}
                <MysticDivider className="mb-8" />

                {/* Button */}
                <Button
                    onClick={onProceed}
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-mystic-gold to-mystic-bronze text-grimoire-dark font-tarot uppercase tracking-wider"
                >
                    {t.game.readyShowToPlayer}
                </Button>
                </div>
            </div>
        </div>
    );
}
