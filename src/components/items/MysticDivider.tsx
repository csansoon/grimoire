import { Icon } from "../atoms";
import { IconName } from "../atoms/icon";
import { cn } from "../../lib/utils";

type MysticDividerProps = {
    icon?: IconName;
    iconClassName?: string;
    className?: string;
};

export function MysticDivider({
    icon = "sparkles",
    iconClassName = "text-mystic-gold/40",
    className,
}: MysticDividerProps) {
    return (
        <div className={cn("divider-mystic", className)}>
            <Icon name={icon} size="sm" className={iconClassName} />
        </div>
    );
}
