import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "minion",
    name: "Minion",
    icon: "swords",
    winCondition: "Help your Demon survive! Evil wins when evil players equal or outnumber the good.",
    colors: {
        gradient: "from-orange-900 to-red-900",
        buttonGradient: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
        text: "text-orange-300",
        badge: "bg-orange-500/20 border-orange-500/50",
        badgeText: "text-orange-200",
    },
};

export default definition;
