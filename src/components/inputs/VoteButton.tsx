import { Icon, IconName } from "../atoms";
import { cn } from "../../lib/utils";

type VoteValue = "for" | "against" | "abstain";

type Props = {
    value: VoteValue;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
};

const config: Record<VoteValue, { icon: IconName; activeClass: string; label: string }> = {
    for: {
        icon: "thumbsUp",
        activeClass: "bg-green-500 text-white",
        label: "For",
    },
    against: {
        icon: "thumbsDown",
        activeClass: "bg-red-500 text-white",
        label: "Against",
    },
    abstain: {
        icon: "minus",
        activeClass: "bg-gray-500 text-white",
        label: "Abstain",
    },
};

export function VoteButton({ value, selected, onClick, disabled }: Props) {
    const { icon, activeClass } = config[value];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
                selected
                    ? activeClass
                    : "bg-white/10 text-white hover:bg-white/20",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <Icon name={icon} size="md" />
        </button>
    );
}
