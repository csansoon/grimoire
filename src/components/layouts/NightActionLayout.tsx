import { PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { useI18n } from "../../lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Icon } from "../atoms";
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
    const gradient = team?.colors.gradient ?? "from-gray-900 to-gray-800";

    const getRoleName = () => {
        if (!role) return null;
        const roleId = role.id as keyof typeof t.roles;
        return t.roles[roleId]?.name ?? role.name;
    };

    return (
        <div
            className={cn(
                "min-h-screen flex items-center justify-center p-6 bg-gradient-to-br",
                gradient
            )}
        >
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <Icon
                            name={role?.icon ?? "moon"}
                            size="3xl"
                            className={team?.colors.text}
                        />
                    </div>
                    <CardTitle>{player.name}</CardTitle>
                    {role && (
                        <CardDescription className="text-white/70">
                            {getRoleName()}
                        </CardDescription>
                    )}
                    {(title || description) && (
                        <div className="mt-4 bg-white/5 rounded-xl p-4">
                            {title && (
                                <p className="text-white font-medium">{title}</p>
                            )}
                            {description && (
                                <p className="text-white/70 text-sm mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    );
}
