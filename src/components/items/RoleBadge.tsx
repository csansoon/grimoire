import { getRole } from "../../lib/roles";
import { useI18n } from "../../lib/i18n";
import { Badge, Icon } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    roleId: string;
    showIcon?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
};

export function RoleBadge({
    roleId,
    showIcon = true,
    size = "md",
    className,
}: Props) {
    const { t } = useI18n();
    const role = getRole(roleId);
    if (!role) return null;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
    };

    const teamVariant = role.team as "townsfolk" | "outsider" | "minion" | "demon";

    const getRoleName = () => {
        const key = roleId as keyof typeof t.roles;
        return t.roles[key]?.name ?? role.name;
    };

    return (
        <Badge
            variant={teamVariant}
            className={cn(sizeClasses[size], className)}
        >
            {showIcon && <Icon name={role.icon} size="sm" />}
            <span>{getRoleName()}</span>
        </Badge>
    );
}
