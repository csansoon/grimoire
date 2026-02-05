import { useState } from "react";
import { PlayerState, hasEffect } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { Button, Icon, Card, CardContent, CardHeader, CardTitle, CardDescription } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    players: PlayerState[];
    title?: string;
    description?: string;
    onSelect: (playerId: string) => void;
    selectedId?: string | null;
    showRoles?: boolean;
    showDeadPlayers?: boolean;
    allowDeadSelection?: boolean;
    confirmLabel?: string;
    icon?: React.ReactNode;
};

export function PlayerSelector({
    players,
    title = "Select a player",
    description,
    onSelect,
    selectedId = null,
    showRoles = false,
    showDeadPlayers = true,
    allowDeadSelection = false,
    confirmLabel = "Confirm",
    icon,
}: Props) {
    const [selected, setSelected] = useState<string | null>(selectedId);

    const visiblePlayers = showDeadPlayers
        ? players
        : players.filter((p) => !hasEffect(p, "dead"));

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected);
        }
    };

    return (
        <Card className="max-w-md w-full mx-auto">
            <CardHeader className="text-center">
                {icon && <div className="text-4xl mb-2 flex justify-center">{icon}</div>}
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {visiblePlayers.map((player) => {
                        const role = getRole(player.roleId);
                        const isDead = hasEffect(player, "dead");
                        const isDisabled = isDead && !allowDeadSelection;
                        const isSelected = selected === player.id;

                        return (
                            <button
                                key={player.id}
                                onClick={() => !isDisabled && setSelected(player.id)}
                                disabled={isDisabled}
                                className={cn(
                                    "w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between",
                                    isSelected
                                        ? "bg-purple-500/50 ring-2 ring-purple-400"
                                        : "bg-white/10 hover:bg-white/20",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        name={isDead ? "skull" : "user"}
                                        size="md"
                                        className={isDead ? "text-gray-400" : "text-white/70"}
                                    />
                                    <div>
                                        <div
                                            className={cn(
                                                "font-medium",
                                                isDead ? "text-gray-400" : "text-white"
                                            )}
                                        >
                                            {player.name}
                                        </div>
                                        {showRoles && role && (
                                            <div className="text-sm text-white/50 flex items-center gap-1">
                                                <Icon name={role.icon} size="xs" /> {role.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isSelected && (
                                    <Icon name="check" size="md" className="text-purple-300" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <Button
                    onClick={handleConfirm}
                    disabled={!selected}
                    fullWidth
                    variant="primary"
                >
                    {confirmLabel}
                </Button>
            </CardContent>
        </Card>
    );
}
