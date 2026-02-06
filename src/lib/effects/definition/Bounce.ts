import { EffectDefinition } from "../types";
import { IntentHandler, KillIntent } from "../../pipeline/types";
import { BounceRedirectUI } from "../../../components/items/BounceRedirectUI";

const bounceHandler: IntentHandler = {
    intentType: "kill",
    priority: 5, // Before safe (10) — redirect happens before protection check
    appliesTo: (intent, effectPlayer) => {
        return intent.type === "kill" && intent.targetId === effectPlayer.id;
    },
    handle: (intent, effectPlayer) => {
        const kill = intent as KillIntent;
        return {
            action: "request_ui",
            UIComponent: BounceRedirectUI,
            resume: (newTargetId: unknown) => {
                const targetId = newTargetId as string;

                if (targetId === effectPlayer.id) {
                    // Narrator chose the original target — ignore bounce
                    return { action: "allow" };
                }

                // Redirect the kill to the new target
                return {
                    action: "redirect",
                    newIntent: { ...kill, targetId },
                    stateChanges: {
                        entries: [
                            {
                                type: "night_action",
                                message: [
                                    {
                                        type: "i18n",
                                        key: "roles.imp.history.bounceRedirected",
                                        params: {
                                            player: kill.sourceId,
                                            target: effectPlayer.id,
                                            redirect: targetId,
                                        },
                                    },
                                ],
                                data: {
                                    action: "kill_redirected",
                                    sourceId: kill.sourceId,
                                    originalTargetId: effectPlayer.id,
                                    redirectTargetId: targetId,
                                },
                            },
                        ],
                    },
                };
            },
        };
    },
};

const definition: EffectDefinition = {
    id: "bounce",
    icon: "trendingUpDown",
    handlers: [bounceHandler],
};

export default definition;
