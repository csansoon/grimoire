import { useState, useMemo } from "react";
import { getRole } from "../../lib/roles";
import { useI18n, interpolate } from "../../lib/i18n";
import { Button, Icon, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "../atoms";

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
                                <CardTitle>{t.newGame.step3Title}</CardTitle>
                                <CardDescription>{t.newGame.step3Subtitle}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Info */}
                <Card>
                    <CardContent className="py-4">
                        <p className="text-white/70 text-sm mb-3">
                            {t.newGame.assignmentInfo}
                        </p>
                        <Button
                            onClick={handleRandomizeAll}
                            variant="ghost"
                            size="sm"
                            className="text-purple-300"
                        >
                            <Icon name="shuffle" size="sm" className="mr-2" />
                            {t.newGame.resetToRandom}
                        </Button>
                    </CardContent>
                </Card>

                {/* Player Assignments */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{t.newGame.playerAssignments}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {players.map((playerName) => {
                            const currentRole = assignments[playerName];
                            const availableRoles = getAvailableRoles(playerName);
                            const role = currentRole ? getRole(currentRole) : null;
                            const teamVariant = role?.team as "townsfolk" | "outsider" | "minion" | "demon" | undefined;

                            return (
                                <div
                                    key={playerName}
                                    className="bg-white/5 rounded-xl p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium">
                                            {playerName}
                                        </span>
                                        {role ? (
                                            <Badge variant={teamVariant} className="inline-flex items-center gap-1">
                                                <Icon name={role.icon} size="xs" /> {getRoleName(role.id)}
                                            </Badge>
                                        ) : (
                                            <Badge variant="default" className="bg-white/10">
                                                <Icon name="dices" size="xs" className="mr-1" />
                                                {t.common.random}
                                            </Badge>
                                        )}
                                    </div>
                                    <select
                                        value={currentRole ?? ""}
                                        onChange={(e) =>
                                            handleAssignment(
                                                playerName,
                                                e.target.value || null
                                            )
                                        }
                                        className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    >
                                        <option value="" className="bg-gray-800">
                                            🎲 {t.common.random}
                                        </option>
                                        {availableRoles.map((roleId) => {
                                            const r = getRole(roleId);
                                            if (!r) return null;
                                            return (
                                                <option
                                                    key={roleId}
                                                    value={roleId}
                                                    className="bg-gray-800"
                                                >
                                                    {getRoleName(roleId)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Remaining Roles Pool */}
                {rolesInRandomPool.length > 0 && willBeRandomlyAssigned > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Icon name="dices" size="md" />
                                {t.newGame.randomPool}
                            </CardTitle>
                            <CardDescription>
                                {interpolate(t.newGame.rolesForPlayers, {
                                    roles: rolesInRandomPool.length,
                                    players: willBeRandomlyAssigned,
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {rolesInRandomPool.map((roleId, i) => {
                                    const r = getRole(roleId);
                                    const teamVariant = r?.team as "townsfolk" | "outsider" | "minion" | "demon" | undefined;
                                    return (
                                        <Badge key={`${roleId}-${i}`} variant={teamVariant} className="inline-flex items-center gap-1">
                                            {r && <Icon name={r.icon} size="xs" />} {getRoleName(roleId)}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Warning */}
                {!impWillBeAssigned && selectedRoles.includes("imp") && (
                    <Card className="border border-red-500/50 bg-red-500/10">
                        <CardContent className="py-4 flex items-start gap-3">
                            <Icon name="alertTriangle" size="md" className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-200 text-sm">
                                {t.newGame.impNotAssignedWarning}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Start Button */}
                <Button
                    onClick={handleStart}
                    variant="primary"
                    fullWidth
                    size="lg"
                >
                    <Icon name="play" size="md" className="mr-2" />
                    {t.common.startGame}
                </Button>
            </div>
        </div>
    );
}
