import { useState } from "react";
import { getAllRoles } from "../../lib/roles";
import { RoleDefinition } from "../../lib/roles/types";
import { useI18n, interpolate } from "../../lib/i18n";
import { Button, Icon, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    players: string[];
    onNext: (selectedRoles: string[]) => void;
    onBack: () => void;
};

export function RoleSelection({ players, onNext, onBack }: Props) {
    const { t } = useI18n();
    const allRoles = getAllRoles();
    const [roleCounts, setRoleCounts] = useState<Record<string, number>>(() => {
        return { villager: players.length };
    });

    const totalRoles = Object.values(roleCounts).reduce((a, b) => a + b, 0);
    const impCount = roleCounts["imp"] ?? 0;

    const incrementRole = (roleId: string) => {
        setRoleCounts({ ...roleCounts, [roleId]: (roleCounts[roleId] ?? 0) + 1 });
    };

    const decrementRole = (roleId: string) => {
        const current = roleCounts[roleId] ?? 0;
        if (current > 0) {
            const newCounts = { ...roleCounts, [roleId]: current - 1 };
            if (newCounts[roleId] === 0) {
                delete newCounts[roleId];
            }
            setRoleCounts(newCounts);
        }
    };

    const handleNext = () => {
        const selectedRoles: string[] = [];
        for (const [roleId, count] of Object.entries(roleCounts)) {
            for (let i = 0; i < count; i++) {
                selectedRoles.push(roleId);
            }
        }
        onNext(selectedRoles);
    };

    const canProceed = totalRoles >= players.length && impCount >= 1;

    const rolesByTeam: Record<string, RoleDefinition[]> = {
        townsfolk: allRoles.filter((r) => r.team === "townsfolk"),
        outsider: allRoles.filter((r) => r.team === "outsider"),
        minion: allRoles.filter((r) => r.team === "minion"),
        demon: allRoles.filter((r) => r.team === "demon"),
    };

    const teamConfig: Record<string, { gradient: string; variant: "townsfolk" | "outsider" | "minion" | "demon" }> = {
        townsfolk: { gradient: "from-blue-500 to-blue-600", variant: "townsfolk" },
        outsider: { gradient: "from-cyan-500 to-cyan-600", variant: "outsider" },
        minion: { gradient: "from-orange-500 to-orange-600", variant: "minion" },
        demon: { gradient: "from-red-600 to-red-700", variant: "demon" },
    };

    const getRoleName = (role: RoleDefinition) => {
        const roleId = role.id as keyof typeof t.roles;
        return t.roles[roleId]?.name ?? role.name;
    };

    const getRoleDescription = (role: RoleDefinition) => {
        const roleId = role.id as keyof typeof t.roles;
        return t.roles[roleId]?.description ?? role.description;
    };

    const getTeamName = (teamId: string) => {
        const team = teamId as keyof typeof t.teams;
        return t.teams[team]?.name ?? teamId;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Button onClick={onBack} variant="ghost" size="icon">
                                <Icon name="arrowLeft" size="md" />
                            </Button>
                            <div>
                                <CardTitle>{t.newGame.step2Title}</CardTitle>
                                <CardDescription>{t.newGame.step2Subtitle}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Status Bar */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex justify-between text-white mb-2">
                            <span>{t.common.players}: {players.length}</span>
                            <span>{t.common.roles}: {totalRoles}</span>
                        </div>
                        {totalRoles < players.length && (
                            <div className="flex items-center gap-2 text-yellow-300 text-sm">
                                <Icon name="alertTriangle" size="sm" />
                                {interpolate(t.newGame.needAtLeastRoles, { count: players.length })}
                            </div>
                        )}
                        {impCount < 1 && (
                            <div className="flex items-center gap-2 text-red-300 text-sm">
                                <Icon name="alertTriangle" size="sm" />
                                {t.newGame.needAtLeastImp}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Role Selection by Team */}
                {Object.entries(rolesByTeam).map(([team, roles]) => {
                    const config = teamConfig[team];
                    return (
                        <Card key={team}>
                            <CardHeader className="pb-2">
                                <CardTitle
                                    className={cn(
                                        "text-lg px-3 py-1.5 rounded-lg bg-gradient-to-r inline-flex w-fit",
                                        config.gradient
                                    )}
                                >
                                    {getTeamName(team)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {roles.map((role) => {
                                    const count = roleCounts[role.id] ?? 0;
                                    const desc = getRoleDescription(role);
                                    return (
                                        <div
                                            key={role.id}
                                            className="bg-white/5 rounded-xl p-3 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Icon name={role.icon} size="xl" />
                                                <div className="min-w-0">
                                                    <div className="text-white font-medium">
                                                        {getRoleName(role)}
                                                    </div>
                                                    <div className="text-white/50 text-xs truncate">
                                                        {desc.length > 40
                                                            ? desc.slice(0, 40) + "..."
                                                            : desc}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => decrementRole(role.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <Icon name="minus" size="sm" />
                                                </Button>
                                                <Badge
                                                    variant={count > 0 ? config.variant : "default"}
                                                    className="w-8 justify-center"
                                                >
                                                    {count}
                                                </Badge>
                                                <Button
                                                    onClick={() => incrementRole(role.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <Icon name="plus" size="sm" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Next Button */}
                <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    fullWidth
                    size="lg"
                >
                    {t.newGame.nextAssignRoles}
                    <Icon name="arrowRight" size="md" className="ml-2" />
                </Button>
            </div>
        </div>
    );
}
