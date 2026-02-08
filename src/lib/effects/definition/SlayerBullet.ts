import { EffectDefinition } from "../types";
import { DayActionDefinition } from "../../pipeline/types";
import { isAlive, hasEffect } from "../../types";
import { SlayerActionScreen } from "../../../components/screens/SlayerActionScreen";

const slayerDayAction: DayActionDefinition = {
    id: "slayer_shot",
    icon: "crosshair",
    getLabel: (t) => t.game.slayerAction,
    getDescription: (t) => t.game.slayerActionDescription,
    condition: (player) =>
        isAlive(player) && hasEffect(player, "slayer_bullet"),
    ActionComponent: SlayerActionScreen,
};

const definition: EffectDefinition = {
    id: "slayer_bullet",
    icon: "crosshair",
    dayActions: [slayerDayAction],
};

export default definition;
