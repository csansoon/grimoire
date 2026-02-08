import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { useI18n } from "../../lib/i18n";
import { RoleCard } from "./RoleCard";
import { TeamBackground, CardLink } from "./TeamBackground";
import { cn } from "../../lib/utils";
import type { RoleRevealProps } from "../../lib/roles/types";

/**
 * Standard role revelation screen used by most roles.
 * Shows "You are the..." text, the role card, and "I understand my role" link
 * on top of the team-themed background.
 *
 * Roles that need a custom reveal (e.g., showing extra context or player names)
 * should compose TeamBackground + RoleCard + CardLink directly instead.
 */
export function DefaultRoleReveal({ player, onContinue }: RoleRevealProps) {
    const { t } = useI18n();
    const role = getRole(player.roleId);
    const teamId = role?.team ?? "townsfolk";
    const team = getTeam(teamId);
    const isEvil = team.isEvil;

    return (
        <TeamBackground teamId={teamId}>
            <p
                className={cn(
                    "text-center text-xs uppercase tracking-widest font-semibold mb-4",
                    isEvil ? "text-red-300/80" : "text-parchment-300/80",
                )}
            >
                {t.common.youAreThe}
            </p>

            <RoleCard roleId={player.roleId} />

            <CardLink onClick={onContinue} isEvil={isEvil}>
                {t.common.iUnderstandMyRole}
            </CardLink>
        </TeamBackground>
    );
}
