import { ReactNode } from "react";
import { getTeam, TeamId } from "../../lib/teams";
import { cn } from "../../lib/utils";

type TeamBackgroundProps = {
    teamId: TeamId;
    children: ReactNode;
};

/**
 * Full-screen team-themed background container.
 * Centers its children vertically and horizontally.
 */
export function TeamBackground({ teamId, children }: TeamBackgroundProps) {
    const team = getTeam(teamId);
    return (
        <div
            className={cn(
                "min-h-app flex flex-col items-center justify-center p-4 bg-gradient-to-br",
                team.colors.gradient,
            )}
        >
            {children}
        </div>
    );
}

type CardLinkProps = {
    onClick: () => void;
    isEvil: boolean;
    children: ReactNode;
};

/**
 * Subtle underlined link-style button for card screens.
 * Adapts color to good (parchment) or evil (red) themes.
 */
export function CardLink({ onClick, isEvil, children }: CardLinkProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "mt-5 text-sm underline underline-offset-4 decoration-1 transition-colors",
                isEvil
                    ? "text-red-300/70 hover:text-red-200 decoration-red-400/40"
                    : "text-parchment-300/70 hover:text-parchment-100 decoration-parchment-400/40",
            )}
        >
            {children}
        </button>
    );
}
