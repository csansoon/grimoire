import { useState, useMemo } from "react";
import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { useI18n, interpolate } from "../../lib/i18n";
import { Button, Icon, Badge } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    players: string[];
    selectedRoles: string[];
    onStart: (assignments: { name: string; roleId: string }[]) => void;
    onBack: () => void;
};

export function RoleAssignment({ players, selectedRoles, onStart, onBack }: Props) {
    const { t } = useI18n();
    const [assignments, setAssignments] = useState<Record<string, string | null>>(() => {
        const initial: Record<string, string | null> = {};
        players.forEach((name) => {
            initial[name] = null;
        });
        return initial;
    });

    const rolePool = useMemo(() => {
        const pool: Record<string, number> = {};
        for (const roleId of selectedRoles) {
            pool[roleId] = (pool[roleId] ?? 0) + 1;
        }
        return pool;
    }, [selectedRoles]);

    const assignedCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const roleId of Object.values(assignments)) {
            if (roleId) {
                counts[roleId] = (counts[roleId] ?? 0) + 1;
            }
        }
        return counts;
    }, [assignments]);

    const getAvailableRoles = (playerName: string) => {
        const currentAssignment = assignments[playerName];
        const available: string[] = [];

        for (const [roleId, total] of Object.entries(rolePool)) {
            const assigned = assignedCounts[roleId] ?? 0;
            const isCurrentlyAssigned = currentAssignment === roleId;

            if (assigned < total || isCurrentlyAssigned) {
                available.push(roleId);
            }
        }

        return available;
    };

    const handleAssignment = (playerName: string, roleId: string | null) => {
        setAssignments({ ...assignments, [playerName]: roleId });
    };

    const handleRandomizeAll = () => {
        const reset: Record<string, string | null> = {};
        players.forEach((name) => {
            reset[name] = null;
        });
        setAssignments(reset);
    };

    const handleStart = () => {
        const finalAssignments: { name: string; roleId: string }[] = [];
        const remainingRoles: string[] = [...selectedRoles];

        for (const [playerName, roleId] of Object.entries(assignments)) {
            if (roleId) {
                finalAssignments.push({ name: playerName, roleId });
                const index = remainingRoles.indexOf(roleId);
                if (index !== -1) {
                    remainingRoles.splice(index, 1);
                }
            }
        }

        const unassignedPlayers = players.filter((name) => !assignments[name]);
        const shuffled = [...remainingRoles].sort(() => Math.random() - 0.5);

        for (const playerName of unassignedPlayers) {
            const roleId = shuffled.pop();
            if (roleId) {
                finalAssignments.push({ name: playerName, roleId: roleId });
            }
        }

        onStart(finalAssignments);
    };

    const getRoleName = (roleId: string) => {
        const role = getRole(roleId);
        if (!role) return roleId;
        const translationKey = roleId as keyof typeof t.roles;
        return t.roles[translationKey]?.name ?? role.name;
    };

    const manuallyAssignedCount = Object.values(assignments).filter((r) => r !== null).length;
    const willBeRandomlyAssigned = players.length - manuallyAssignedCount;

    const rolesInRandomPool = selectedRoles.filter((roleId) => {
        const manualCount = assignedCounts[roleId] ?? 0;
        return selectedRoles.filter((r) => r === roleId).length > manualCount;
    });

    const impManuallyAssigned = Object.values(assignments).includes("imp");
    const impInRandomPool = rolesInRandomPool.includes("imp");
    const impWillBeAssigned = impManuallyAssigned || (willBeRandomlyAssigned > 0 && impInRandomPool);

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
                    <div>
                        <h1 className="font-tarot text-lg text-parchment-100 tracking-wider uppercase">
                            {t.newGame.step3Title}
                        </h1>
                        <p className="text-xs text-parchment-500">{t.newGame.step3Subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Warning */}
            {!impWillBeAssigned && selectedRoles.includes("imp") && (
                <div className="px-4 py-3 bg-mystic-crimson/20 border-b border-red-500/30">
                    <div className="max-w-lg mx-auto flex items-start gap-2">
                        <Icon name="alertTriangle" size="sm" className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-200 text-xs">{t.newGame.impNotAssignedWarning}</p>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full overflow-y-auto">
                {/* Info */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-parchment-500 text-xs">{t.newGame.assignmentInfo}</p>
                    <button
                        onClick={handleRandomizeAll}
                        className="text-xs text-mystic-gold/70 hover:text-mystic-gold flex items-center gap-1 transition-colors"
                    >
                        <Icon name="shuffle" size="xs" />
                        {t.newGame.resetToRandom}
                    </button>
                </div>

                {/* Player Assignments */}
                <div className="space-y-3 mb-6">
                    {players.map((playerName) => {
                        const currentRole = assignments[playerName];
                        const availableRoles = getAvailableRoles(playerName);
                        const role = currentRole ? getRole(currentRole) : null;
                        const team = role ? getTeam(role.team) : null;

                        return (
                            <div
                                key={playerName}
                                className="rounded-lg border border-white/10 bg-white/5 p-3"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-parchment-100 font-medium text-sm">
                                        {playerName}
                                    </span>
                                    {role ? (
                                        <Badge variant={role.team} className="inline-flex items-center gap-1">
                                            <Icon name={role.icon} size="xs" /> {getRoleName(role.id)}
                                        </Badge>
                                    ) : (
                                        <span className="flex items-center gap-1 text-parchment-500 text-xs">
                                            <Icon name="dices" size="xs" />
                                            {t.common.random}
                                        </span>
                                    )}
                                </div>
                                <select
                                    value={currentRole ?? ""}
                                    onChange={(e) => handleAssignment(playerName, e.target.value || null)}
                                    className={cn(
                                        "w-full bg-grimoire-dark border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mystic-gold/50 transition-colors",
                                        currentRole && team
                                            ? cn(team.colors.cardBorder, "text-parchment-100")
                                            : "border-white/20 text-parchment-400"
                                    )}
                                >
                                    <option value="" className="bg-grimoire-dark">
                                        🎲 {t.common.random}
                                    </option>
                                    {availableRoles.map((roleId) => {
                                        const r = getRole(roleId);
                                        if (!r) return null;
                                        return (
                                            <option key={roleId} value={roleId} className="bg-grimoire-dark">
                                                {getRoleName(roleId)}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        );
                    })}
                </div>

                {/* Random Pool */}
                {rolesInRandomPool.length > 0 && willBeRandomlyAssigned > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2 text-parchment-400">
                            <Icon name="dices" size="sm" />
                            <span className="text-xs tracking-wider uppercase">{t.newGame.randomPool}</span>
                            <span className="text-xs text-parchment-500">
                                ({interpolate(t.newGame.rolesForPlayers, { roles: rolesInRandomPool.length, players: willBeRandomlyAssigned })})
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {rolesInRandomPool.map((roleId, i) => {
                                const r = getRole(roleId);
                                return (
                                    <Badge key={`${roleId}-${i}`} variant={r?.team} className="inline-flex items-center gap-1">
                                        {r && <Icon name={r.icon} size="xs" />} {getRoleName(roleId)}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-mystic-gold/20 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={handleStart}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-mystic-gold to-mystic-bronze text-grimoire-dark font-tarot uppercase tracking-wider"
                    >
                        <Icon name="play" size="md" className="mr-2" />
                        {t.common.startGame}
                    </Button>
                </div>
            </div>
        </div>
    );
}
