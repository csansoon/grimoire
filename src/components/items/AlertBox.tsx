import { Icon } from "../atoms";
import { IconName } from "../atoms/icon";
import { cn } from "../../lib/utils";

type AlertBoxProps = {
    message: string;
    variant?: "error" | "info";
    icon?: IconName;
};

export function AlertBox({ message, variant = "error", icon }: AlertBoxProps) {
    const variantStyles = {
        error: {
            container: "bg-red-900/30 border-red-500/30",
            text: "text-red-300",
            icon: icon ?? "alertTriangle",
        },
        info: {
            container: "bg-blue-900/30 border-blue-500/30",
            text: "text-blue-300",
            icon: icon ?? "info",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className={cn("border rounded-lg p-4 mb-6", styles.container)}>
            <div className={cn("flex items-center gap-2", styles.text)}>
                <Icon name={styles.icon as IconName} size="md" />
                <span className="text-sm">{message}</span>
            </div>
        </div>
    );
}
