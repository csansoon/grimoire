import { Icon } from "../atoms";
import { IconName } from "../atoms/icon";

type RoleRevealBadgeProps = {
    icon: IconName;
    roleName: string;
    label?: string;
};

export function RoleRevealBadge({ icon, roleName, label }: RoleRevealBadgeProps) {
    return (
        <div className="text-center mb-6">
            {label && (
                <p className="text-parchment-400 text-sm mb-3">{label}</p>
            )}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-mystic-gold/10 border border-mystic-gold/30">
                <Icon name={icon} size="xl" className="text-mystic-gold" />
                <span className="font-tarot text-2xl text-mystic-gold uppercase tracking-wider">
                    {roleName}
                </span>
            </div>
        </div>
    );
}
