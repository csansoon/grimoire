import { PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { useI18n, interpolate } from "../../lib/i18n";
import { Button, Icon } from "../atoms";

type Props = {
    player: PlayerState;
    action: "role_reveal" | "night_action";
    onProceed: () => void;
};

export function NarratorPrompt({ player, action, onProceed }: Props) {
    const { t } = useI18n();
    const role = getRole(player.roleId);
    const roleId = role?.id as keyof typeof t.roles | undefined;
    const roleName = (roleId && t.roles[roleId]?.name) ?? role?.name ?? "Unknown";

    const isRoleReveal = action === "role_reveal";

    return (
        <div className="min-h-screen bg-gradient-to-b from-grimoire-purple via-grimoire-dark to-grimoire-darker flex items-center justify-center p-4">
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
                <div className="divider-mystic mb-8">
                    <Icon name="sparkles" size="sm" className="text-mystic-gold/40" />
                </div>

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
    );
}
