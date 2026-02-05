import { Icon } from "../atoms";
import { IconName } from "../atoms/icon";
import { cn } from "../../lib/utils";

type SelectableRoleItemProps = {
    playerName: string;
    roleName: string;
    roleIcon: IconName;
    isSelected: boolean;
    onClick: () => void;
};

export function SelectableRoleItem({
    playerName,
    roleName,
    roleIcon,
    isSelected,
    onClick,
}: SelectableRoleItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full p-3 rounded-lg border flex items-center justify-between transition-all",
                isSelected
                    ? "bg-mystic-gold/20 border-mystic-gold/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon
                    name={roleIcon}
                    size="md"
                    className={isSelected ? "text-mystic-gold" : "text-parchment-400"}
                />
                <div className="text-left">
                    <div className="text-parchment-100 font-medium">{playerName}</div>
                    <div className="text-xs text-mystic-gold">{roleName}</div>
                </div>
            </div>
            {isSelected && <Icon name="check" size="md" className="text-mystic-gold" />}
        </button>
    );
}
