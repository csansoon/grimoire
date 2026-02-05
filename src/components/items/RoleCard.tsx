import { PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam, TeamId } from "../../lib/teams";
import { useI18n } from "../../lib/i18n";
import { Button, Icon, Card, CardContent, CardHeader, Badge } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    player: PlayerState;
    onContinue: () => void;
};

export function RoleCard({ player, onContinue }: Props) {
    const { t } = useI18n();
    const role = getRole(player.roleId);

    if (!role) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-red-400">Unknown role: {player.roleId}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const team = getTeam(role.team);
    const roleId = role.id as keyof typeof t.roles;
    const teamId = role.team as TeamId;

    // Get translated role info (with fallback to definition)
    const roleTranslation = t.roles[roleId];
    const teamTranslation = t.teams[teamId];

    const roleName = roleTranslation?.name ?? role.name;
    const roleDescription = roleTranslation?.description ?? role.description;
    const teamName = teamTranslation?.name ?? team.name;
    const winCondition = role.winCondition ?? teamTranslation?.winCondition ?? team.winCondition;

    return (
        <div
            className={cn(
                "min-h-screen flex items-center justify-center p-6 bg-gradient-to-br",
                team.colors.gradient
            )}
        >
            <Card className="max-w-md w-full">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <Icon name={role.icon} size="4xl" className={team.colors.text} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                        {player.name}
                    </h2>
                    <p className="text-white/60 text-sm mb-4">{t.common.youAreThe}</p>
                    <h1 className={cn("text-4xl font-bold mb-3", team.colors.text)}>
                        {roleName}
                    </h1>
                    <div className="flex justify-center">
                        <Badge variant={role.team} className="capitalize">
                            {teamName}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-white/90 text-center">
                            {roleDescription}
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Icon name="trophy" size="sm" className={team.colors.text} />
                            <span className={cn("text-sm font-semibold", team.colors.text)}>
                                {t.common.winCondition}
                            </span>
                        </div>
                        <p className="text-white/80 text-center text-sm">
                            {winCondition}
                        </p>
                    </div>

                    <Button
                        onClick={onContinue}
                        fullWidth
                        size="lg"
                        className={cn("bg-gradient-to-r", team.colors.buttonGradient)}
                    >
                        {t.common.iUnderstandMyRole}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
