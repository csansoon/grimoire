import { RichMessage as RichMessageType, GameState, getPlayer } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getEffect } from "../../lib/effects";
import { useI18n } from "../../lib/i18n";
import { Badge, Icon } from "../atoms";

type Props = {
    message: RichMessageType;
    state: GameState;
};

export function RichMessage({ message, state }: Props) {
    const { t } = useI18n();

    const getRoleName = (roleId: string) => {
        const role = getRole(roleId);
        if (!role) return "[Unknown Role]";
        const key = roleId as keyof typeof t.roles;
        return t.roles[key]?.name ?? role.name;
    };

    const getEffectName = (effectType: string) => {
        const effect = getEffect(effectType);
        const key = effectType as keyof typeof t.effects;
        return t.effects[key] ?? effect?.name ?? effectType;
    };

    return (
        <span className="inline-flex flex-wrap items-center gap-1">
            {message.map((part, index) => {
                switch (part.type) {
                    case "text":
                        return <span key={index}>{part.content}</span>;

                    case "player": {
                        const player = getPlayer(state, part.playerId);
                        if (!player) return <span key={index}>[Unknown Player]</span>;
                        return (
                            <Badge key={index} variant="player">
                                {player.name}
                            </Badge>
                        );
                    }

                    case "role": {
                        const role = getRole(part.roleId);
                        if (!role) return <span key={index}>[Unknown Role]</span>;
                        const teamVariant = role.team as "townsfolk" | "outsider" | "minion" | "demon";
                        return (
                            <Badge key={index} variant={teamVariant} className="inline-flex items-center gap-1">
                                <Icon name={role.icon} size="xs" /> {getRoleName(part.roleId)}
                            </Badge>
                        );
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
