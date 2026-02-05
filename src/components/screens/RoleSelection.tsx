import { useState } from "react";
import { getAllRoles } from "../../lib/roles";
import { RoleDefinition } from "../../lib/roles/types";
import { getTeam } from "../../lib/teams";
import { useI18n, interpolate } from "../../lib/i18n";
import { Button, Icon, Badge } from "../atoms";
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

    const getRoleName = (role: RoleDefinition) => {
        const roleId = role.id as keyof typeof t.roles;
        return t.roles[roleId]?.name ?? role.name;
    };

    const getRoleDescription = (role: RoleDefinition) => {
        const roleId = role.id as keyof typeof t.roles;
        return t.roles[roleId]?.description ?? role.description;
    };

    const getTeamName = (teamId: string) => {
        const key = teamId as keyof typeof t.teams;
        return t.teams[key]?.name ?? teamId;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-grimoire-purple via-grimoire-dark to-grimoire-darker flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-grimoire-dark/95 backdrop-blur-sm border-b border-mystic-gold/20 px-4 py-3">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                    >
                        <Icon name="arrowLeft" size="md" />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-tarot text-lg text-parchment-100 tracking-wider uppercase">
                            {t.newGame.step2Title}
                        </h1>
                        <p className="text-xs text-parchment-500">{t.newGame.step2Subtitle}</p>
                    </div>
                    {/* Status */}
                    <div className="text-right">
                        <div className="text-xs text-parchment-400">
                            {t.common.roles}: <span className="text-parchment-100">{totalRoles}</span> / {players.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warnings */}
            {(totalRoles < players.length || impCount < 1) && (
                <div className="px-4 py-2 bg-mystic-crimson/20 border-b border-red-500/30">
                    <div className="max-w-lg mx-auto space-y-1">
                        {totalRoles < players.length && (
                            <div className="flex items-center gap-2 text-red-300 text-xs">
                                <Icon name="alertTriangle" size="sm" />
                                {interpolate(t.newGame.needAtLeastRoles, { count: players.length })}
                            </div>
                        )}
                        {impCount < 1 && (
                            <div className="flex items-center gap-2 text-red-300 text-xs">
                                <Icon name="alertTriangle" size="sm" />
                                {t.newGame.needAtLeastImp}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full overflow-y-auto">
                {Object.entries(rolesByTeam).map(([teamId, roles]) => {
                    if (roles.length === 0) return null;
                    const team = getTeam(teamId as "townsfolk" | "outsider" | "minion" | "demon");
                    
                    return (
                        <div key={teamId} className="mb-6">
                            {/* Team Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <Icon name={team.icon} size="sm" className={team.colors.text} />
                                <span className={cn("text-sm font-tarot tracking-wider uppercase", team.colors.text)}>
                                    {getTeamName(teamId)}
                                </span>
                            </div>

                            {/* Role List */}
                            <div className="space-y-2">
                                {roles.map((role) => {
                                    const count = roleCounts[role.id] ?? 0;
                                    const desc = getRoleDescription(role);
                                    
                                    return (
                                        <div
                                            key={role.id}
                                            className={cn(
                                                "rounded-lg p-3 border transition-colors",
                                                count > 0
                                                    ? "bg-white/5 border-white/20"
                                                    : "bg-transparent border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon name={role.icon} size="lg" className={team.colors.text} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-parchment-100 font-medium text-sm">
                                                        {getRoleName(role)}
                                                    </div>
                                                    <div className="text-parchment-500 text-xs truncate">
                                                        {desc.length > 50 ? desc.slice(0, 50) + "..." : desc}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => decrementRole(role.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-parchment-400 hover:text-parchment-100 hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <Icon name="minus" size="sm" />
                                                    </button>
                                                    <Badge
                                                        variant={count > 0 ? role.team : "default"}
                                                        className="w-8 justify-center"
                                                    >
                                                        {count}
                                                    </Badge>
                                                    <button
                                                        onClick={() => incrementRole(role.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-parchment-400 hover:text-parchment-100 hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <Icon name="plus" size="sm" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-mystic-gold/20 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-mystic-gold to-mystic-bronze text-grimoire-dark font-tarot uppercase tracking-wider"
                    >
                        {t.newGame.nextAssignRoles}
                        <Icon name="arrowRight" size="md" className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
