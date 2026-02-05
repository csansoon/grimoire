import { PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam, TeamId } from "../../lib/teams";
import { useI18n } from "../../lib/i18n";
import { Button, Icon } from "../atoms";
import { cn } from "../../lib/utils";

type Props = {
    player: PlayerState;
    onContinue: () => void;
};

export function RoleCard({ player, onContinue }: Props) {
    const { t } = useI18n();
    const role = getRole(player.roleId);

    if (!role) {
        return (
            <div className="min-h-screen bg-grimoire-dark flex items-center justify-center p-4">
                <p className="text-red-400 font-tarot">Unknown role: {player.roleId}</p>
            </div>
        );
    }

    const team = getTeam(role.team);
    const roleId = role.id as keyof typeof t.roles;
    const teamId = role.team as TeamId;

    const roleTranslation = t.roles[roleId];
    const teamTranslation = t.teams[teamId];

    const roleName = roleTranslation?.name ?? role.name;
    const roleDescription = roleTranslation?.description ?? role.description;
    const teamName = teamTranslation?.name ?? team.name;
    const winCondition = role.winCondition ?? teamTranslation?.winCondition ?? team.winCondition;

    const isEvil = team.isEvil;

    return (
        <div
            className={cn(
                "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br",
                team.colors.gradient
            )}
        >
            {/* The Tarot Card */}
            <div
                className={cn(
                    "relative w-full max-w-sm mx-auto rounded-xl border-2 shadow-tarot overflow-hidden",
                    team.colors.cardBg,
                    team.colors.cardBorder
                )}
            >
                {/* Inner decorative border */}
                <div className="absolute inset-3 border border-current opacity-20 rounded-lg pointer-events-none" />
                
                {/* Corner Icons */}
                <div className="tarot-corner tarot-corner-tl">
                    <Icon name={role.icon} size="sm" className={team.colors.accent} />
                </div>
                <div className="tarot-corner tarot-corner-tr">
                    <Icon name={role.icon} size="sm" className={team.colors.accent} />
                </div>
                <div className="tarot-corner tarot-corner-bl">
                    <Icon name={role.icon} size="sm" className={team.colors.accent} />
                </div>
                <div className="tarot-corner tarot-corner-br">
                    <Icon name={role.icon} size="sm" className={team.colors.accent} />
                </div>

                {/* Card Content */}
                <div className="relative z-10 px-8 py-10 parchment-texture">
                    {/* Player Name */}
                    <p className={cn(
                        "text-center text-sm tracking-widest uppercase mb-6 opacity-70",
                        team.colors.cardText
                    )}>
                        {player.name}
                    </p>

                    {/* Role Icon (Large, centered) */}
                    <div className="flex justify-center mb-6">
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center",
                            isEvil 
                                ? "bg-red-900/30 border border-red-600/40" 
                                : "bg-mystic-gold/10 border border-mystic-gold/30"
                        )}>
                            <Icon 
                                name={role.icon} 
                                size="4xl" 
                                className={cn(
                                    isEvil ? "text-red-400 text-glow-crimson" : "text-mystic-gold text-glow-gold"
                                )} 
                            />
                        </div>
                    </div>

                    {/* Role Name */}
                    <h1 className={cn(
                        "font-tarot text-3xl font-bold text-center uppercase tracking-widest-xl mb-2",
                        team.colors.cardText,
                        isEvil ? "text-glow-crimson" : ""
                    )}>
                        {roleName}
                    </h1>

                    {/* Team Badge */}
                    <p className={cn(
                        "text-center text-xs tracking-widest uppercase mb-6",
                        isEvil ? "text-red-400/70" : "text-mystic-gold/70"
                    )}>
                        {teamName}
                    </p>

                    {/* Divider */}
                    <div className="divider-mystic">
                        <Icon 
                            name={isEvil ? "skull" : "sparkles"} 
                            size="sm" 
                            className={isEvil ? "text-red-500/50" : "text-mystic-gold/50"} 
                        />
                    </div>

                    {/* Description */}
                    <p className={cn(
                        "text-center text-sm leading-relaxed mb-6",
                        team.colors.cardText,
                        "opacity-80"
                    )}>
                        {roleDescription}
                    </p>

                    {/* Win Condition */}
                    <div className={cn(
                        "rounded-lg p-4 mb-6",
                        isEvil ? "bg-red-950/50 border border-red-600/30" : "bg-mystic-gold/10 border border-mystic-gold/20"
                    )}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Icon 
                                name="trophy" 
                                size="sm" 
                                className={isEvil ? "text-red-400" : "text-mystic-gold"} 
                            />
                            <span className={cn(
                                "text-xs font-semibold uppercase tracking-wider",
                                isEvil ? "text-red-400" : "text-mystic-gold"
                            )}>
                                {t.common.winCondition}
                            </span>
                        </div>
                        <p className={cn(
                            "text-center text-xs leading-relaxed",
                            team.colors.cardText,
                            "opacity-70"
                        )}>
                            {winCondition}
                        </p>
                    </div>

                    {/* Confirmation Button */}
                    <Button
                        onClick={onContinue}
                        fullWidth
                        size="lg"
                        className={cn(
                            "bg-gradient-to-r font-tarot uppercase tracking-wider",
                            team.colors.buttonGradient,
                            isEvil ? "text-white" : "text-grimoire-dark"
                        )}
                    >
                        {t.common.iUnderstandMyRole}
                    </Button>
                </div>
            </div>
        </div>
    );
}
