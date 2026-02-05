import { PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { useI18n } from "../../lib/i18n";
import { Icon } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    player: PlayerState;
    title?: string;
    description?: string;
    children: React.ReactNode;
};

export function NightActionLayout({ player, title, description, children }: Props) {
    const { t } = useI18n();
    const role = getRole(player.roleId);
    const team = role ? getTeam(role.team) : null;

    const getRoleName = () => {
        if (!role) return null;
        const roleId = role.id as keyof typeof t.roles;
        return t.roles[roleId]?.name ?? role.name;
    };

    const isEvil = team?.isEvil ?? false;

    return (
        <div
            className={cn(
                "min-h-screen flex flex-col bg-gradient-to-b",
                isEvil
                    ? "from-red-950 via-grimoire-blood to-grimoire-darker"
                    : "from-indigo-950 via-grimoire-purple to-grimoire-darker"
            )}
        >
            {/* Header */}
            <div className="px-4 py-6 text-center">
                <div className="flex justify-center mb-4">
                    <div
                        className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center border",
                            isEvil
                                ? "bg-red-900/30 border-red-600/40"
                                : "bg-indigo-500/10 border-indigo-400/30"
                        )}
                    >
                        <Icon
                            name={role?.icon ?? "moon"}
                            size="3xl"
                            className={cn(
                                isEvil ? "text-red-400 text-glow-crimson" : "text-indigo-400"
                            )}
                        />
                    </div>
                </div>

                <h1 className="font-tarot text-xl text-parchment-100 tracking-wider uppercase mb-1">
                    {player.name}
                </h1>
                {role && (
                    <p className={cn("text-sm", isEvil ? "text-red-400/70" : "text-indigo-400/70")}>
                        {getRoleName()}
                    </p>
                )}

                {(title || description) && (
                    <div className="mt-6 max-w-sm mx-auto">
                        <div className="divider-mystic mb-4">
                            <Icon
                                name={isEvil ? "skull" : "moon"}
                                size="sm"
                                className={isEvil ? "text-red-500/40" : "text-indigo-400/40"}
                            />
                        </div>
                        {title && (
                            <p className="text-parchment-100 font-medium mb-1">{title}</p>
                        )}
                        {description && (
                            <p className="text-parchment-400 text-sm">{description}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-6 max-w-lg mx-auto w-full">
                {children}
            </div>
        </div>
    );
}
