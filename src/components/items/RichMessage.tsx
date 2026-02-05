import { RichMessage as RichMessageType, GameState, getPlayer } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { EffectId } from "../../lib/effects";
import { useI18n, Translations } from "../../lib/i18n";
import { Badge, Icon } from "../atoms";
import { ReactNode } from "react";

type Props = {
    message: RichMessageType;
    state: GameState;
};

// Helper to get a nested translation value by dot-notation key
function getTranslation(t: Translations, key: string): string | undefined {
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = t;
    for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
            value = value[part];
        } else {
            return undefined;
        }
    }
    return typeof value === "string" ? value : undefined;
}

// Param keys that represent player IDs
const PLAYER_PARAM_KEYS = ["player", "player1", "player2", "target", "nominator", "nominee", "slayer"];
// Param keys that represent role IDs
const ROLE_PARAM_KEYS = ["role"];
// Param keys that represent effect IDs
const EFFECT_PARAM_KEYS = ["effect"];

export function RichMessage({ message, state }: Props) {
    const { t } = useI18n();

    const getRoleName = (roleId: string) => {
        const key = roleId as keyof typeof t.roles;
        return t.roles[key]?.name ?? roleId;
    };

    const getEffectName = (effectType: string) => {
        const key = effectType as EffectId;
        return t.effects[key]?.name ?? effectType;
    };

    // Render a player badge with their role icon
    const renderPlayerBadge = (playerId: string, key: string | number) => {
        const player = getPlayer(state, playerId);
        if (!player) return <span key={key}>[Unknown Player]</span>;
        const role = getRole(player.roleId);
        return (
            <Badge key={key} variant="player" className="inline-flex items-center gap-1">
                {role && <Icon name={role.icon} size="xs" />}
                {player.name}
            </Badge>
        );
    };

    // Render a role badge
    const renderRoleBadge = (roleId: string, key: string | number) => {
        const role = getRole(roleId);
        if (!role) return <span key={key}>[Unknown Role]</span>;
        const teamVariant = role.team as "townsfolk" | "outsider" | "minion" | "demon";
        return (
            <Badge key={key} variant={teamVariant} className="inline-flex items-center gap-1">
                <Icon name={role.icon} size="xs" /> {getRoleName(roleId)}
            </Badge>
        );
    };

    // Parse a template with params and render with badges
    const renderI18nWithParams = (
        template: string,
        params: Record<string, string | number>,
        baseKey: string
    ): ReactNode[] => {
        const result: ReactNode[] = [];
        // Match {paramName} placeholders
        const regex = /\{(\w+)\}/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(template)) !== null) {
            // Add text before the placeholder
            if (match.index > lastIndex) {
                result.push(
                    <span key={`${baseKey}-text-${lastIndex}`}>
                        {template.slice(lastIndex, match.index)}
                    </span>
                );
            }

            const paramKey = match[1];
            const paramValue = params[paramKey];

            if (paramValue !== undefined) {
                if (PLAYER_PARAM_KEYS.includes(paramKey)) {
                    // Render as player badge
                    result.push(renderPlayerBadge(String(paramValue), `${baseKey}-player-${paramKey}`));
                } else if (ROLE_PARAM_KEYS.includes(paramKey)) {
                    // Render as role badge
                    result.push(renderRoleBadge(String(paramValue), `${baseKey}-role-${paramKey}`));
                } else if (EFFECT_PARAM_KEYS.includes(paramKey)) {
                    // Render as effect badge
                    result.push(
                        <Badge key={`${baseKey}-effect-${paramKey}`} variant="effect">
                            {getEffectName(String(paramValue))}
                        </Badge>
                    );
                } else {
                    // Render as plain text
                    result.push(<span key={`${baseKey}-param-${paramKey}`}>{paramValue}</span>);
                }
            } else {
                // Placeholder not found in params, keep as is
                result.push(<span key={`${baseKey}-missing-${paramKey}`}>{match[0]}</span>);
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last placeholder
        if (lastIndex < template.length) {
            result.push(
                <span key={`${baseKey}-text-end`}>{template.slice(lastIndex)}</span>
            );
        }

        return result;
    };

    return (
        <span className="inline-flex flex-wrap items-center gap-1">
            {message.map((part, index) => {
                switch (part.type) {
                    case "text":
                        return <span key={index}>{part.content}</span>;

                    case "i18n": {
                        const template = getTranslation(t, part.key);
                        if (!template) return <span key={index}>[{part.key}]</span>;
                        
                        if (part.params && Object.keys(part.params).length > 0) {
                            // Render with badges for player/role params
                            return (
                                <span key={index} className="inline-flex flex-wrap items-center gap-1">
                                    {renderI18nWithParams(
                                        template,
                                        part.params as Record<string, string | number>,
                                        `i18n-${index}`
                                    )}
                                </span>
                            );
                        }
                        return <span key={index}>{template}</span>;
                    }

                    case "player": {
                        return renderPlayerBadge(part.playerId, index);
                    }

                    case "role": {
                        return renderRoleBadge(part.roleId, index);
                    }

                    case "effect": {
                        return (
                            <Badge key={index} variant="effect">
                                {getEffectName(part.effectType)}
                            </Badge>
                        );
                    }

                    default:
                        return null;
                }
            })}
        </span>
    );
}
