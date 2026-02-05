import { PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { useI18n, interpolate } from "../../lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Icon, Button } from "../atoms";

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {isRoleReveal ? (
                            <Icon name="eye" size="4xl" className="text-purple-400" />
                        ) : (
                            <Icon name="moon" size="4xl" className="text-indigo-400" />
                        )}
                    </div>
                    <CardDescription>Narrator</CardDescription>
                    <CardTitle className="text-xl">
                        {isRoleReveal
                            ? interpolate(t.game.narratorGiveDevice, { player: player.name })
                            : interpolate(t.game.narratorWakePlayer, { player: player.name, role: roleName })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={onProceed} fullWidth size="lg">
                        {t.game.readyShowToPlayer}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
