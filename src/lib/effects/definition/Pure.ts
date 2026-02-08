import { EffectDefinition } from "../types";
import { IntentHandler, NominateIntent } from "../../pipeline/types";
import { getRole } from "../../roles";

const pureHandler: IntentHandler = {
    intentType: "nominate",
    priority: 10,
    appliesTo: (intent, effectPlayer) => {
        return (
            intent.type === "nominate" &&
            (intent as NominateIntent).nomineeId === effectPlayer.id
        );
    },
    handle: (intent, effectPlayer, state) => {
        const nom = intent as NominateIntent;
        const nominator = state.players.find((p) => p.id === nom.nominatorId);
        if (!nominator) return { action: "allow" };

        const nominatorRole = getRole(nominator.roleId);
        const isTownsfolk = nominatorRole?.team === "townsfolk";

        if (isTownsfolk) {
            // Townsfolk nominates Virgin → Nominator is executed immediately
            return {
                action: "prevent",
                reason: "virgin_triggered",
                stateChanges: {
                    entries: [
                        {
                            type: "virgin_execution",
                            message: [
                                {
                                    type: "i18n",
                                    key: "roles.virgin.history.townsfolkExecuted",
                                    params: {
                                        nominator: nom.nominatorId,
                                    },
                                },
                            ],
                            data: {
                                nominatorId: nom.nominatorId,
                                nomineeId: nom.nomineeId,
                                virginTriggered: true,
                            },
                        },
                    ],
                    stateUpdates: { phase: "day" },
                    addEffects: {
                        [nom.nominatorId]: [
                            {
                                type: "dead",
                                data: { cause: "virgin" },
                                expiresAt: "never",
                            },
                        ],
                    },
                    removeEffects: {
                        [effectPlayer.id]: ["pure"],
                    },
                },
            };
        } else {
            // Non-townsfolk nominates Virgin → loses purity, nomination proceeds
            return {
                action: "allow",
                stateChanges: {
                    entries: [
                        {
                            type: "virgin_spent",
                            message: [
                                {
                                    type: "i18n",
                                    key: "roles.virgin.history.lostPurity",
                                    params: {
                                        nominator: nom.nominatorId,
                                    },
                                },
                            ],
                            data: {
                                nominatorId: nom.nominatorId,
                                nomineeId: nom.nomineeId,
                                virginTriggered: false,
                            },
                        },
                    ],
                    removeEffects: {
                        [effectPlayer.id]: ["pure"],
                    },
                },
            };
        }
    },
};

const definition: EffectDefinition = {
    id: "pure",
    icon: "flowerLotus",
    handlers: [pureHandler],
};

export default definition;
