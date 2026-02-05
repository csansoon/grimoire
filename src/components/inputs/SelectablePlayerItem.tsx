import { Icon, Badge } from "../atoms";
import { IconName } from "../atoms/icon";
import { cn } from "../../lib/utils";
import { TeamId } from "../../lib/teams";

type SelectablePlayerItemProps = {
    playerName: string;
    roleName: string;
    roleIcon: IconName;
    isSelected: boolean;
    isDisabled?: boolean;
    highlightTeam?: TeamId;
    teamLabel?: string;
    onClick: () => void;
};

export function SelectablePlayerItem({
    playerName,
    roleName,
    roleIcon,
    isSelected,
    isDisabled,
    highlightTeam,
    teamLabel,
    onClick,
}: SelectablePlayerItemProps) {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
                "w-full p-3 rounded-lg border flex items-center justify-between transition-all",
                isSelected
                    ? "bg-blue-900/40 border-blue-500/50"
                    : isDisabled
                        ? "bg-white/5 border-white/10 opacity-50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon
                    name={roleIcon}
                    size="md"
                    className={isSelected ? "text-blue-300" : "text-parchment-400"}
                />
                <div className="text-left">
                    <div className="text-parchment-100 font-medium">{playerName}</div>
                    <div className="text-xs text-parchment-500 flex items-center gap-1">
                        {roleName}
                        {highlightTeam && teamLabel && (
                            <Badge variant={highlightTeam} className="text-[10px] px-1 py-0">
                                {teamLabel}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            {isSelected && <Icon name="check" size="md" className="text-blue-300" />}
        </button>
    );
}
