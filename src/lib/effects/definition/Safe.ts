import { EffectDefinition } from "../types";
import { IntentHandler, KillIntent } from "../../pipeline/types";

const safeHandler: IntentHandler = {
    intentType: "kill",
    priority: 10, // After bounce (5) so redirected kills can still be blocked
    appliesTo: (intent, effectPlayer) => {
        return intent.type === "kill" && intent.targetId === effectPlayer.id;
    },
    handle: (intent, effectPlayer) => {
        const kill = intent as KillIntent;
        return {
            action: "prevent",
            reason: "protected",
            stateChanges: {
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.imp.history.failedToKill",
                                params: {
                                    player: kill.sourceId,
                                    target: effectPlayer.id,
                                },
                            },
                        ],
                        data: {
                            action: "kill_failed",
                            sourceId: kill.sourceId,
                            targetId: effectPlayer.id,
                            reason: "safe",
                        },
                    },
                ],
            },
        };
    },
};

const definition: EffectDefinition = {
    id: "safe",
    icon: "shield",
    handlers: [safeHandler],
};

export default definition;
