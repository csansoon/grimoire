import { EffectDefinition } from "../types";
import { WinConditionCheck } from "../../pipeline/types";
import { hasEffect } from "../../types";

const martyrdomWinCondition: WinConditionCheck = {
    trigger: "after_execution",
    check: (state, game) => {
        const lastEntry = game.history[game.history.length - 1];
        if (!lastEntry) return null;

        if (
            lastEntry.type !== "execution" &&
            lastEntry.type !== "virgin_execution"
        ) {
            return null;
        }

        // For regular execution, the executed player is in data.playerId
        // For virgin_execution, the nominator is executed (data.nominatorId)
        const executedId = (lastEntry.data.playerId ??
            lastEntry.data.nominatorId) as string | undefined;
        if (!executedId) return null;

        const executedPlayer = state.players.find((p) => p.id === executedId);
        if (executedPlayer && hasEffect(executedPlayer, "martyrdom")) {
            return "demon";
        }

        return null;
    },
};

const definition: EffectDefinition = {
    id: "martyrdom",
    icon: "bomb",
    winConditions: [martyrdomWinCondition],
};

export default definition;
