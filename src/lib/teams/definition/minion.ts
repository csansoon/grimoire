import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "minion",
    name: "Minion",
    icon: "swords",
    winCondition: "Help your Demon survive! Evil wins when evil players equal or outnumber the good.",
    isEvil: true,
    colors: {
        cardBg: "bg-gradient-to-b from-grimoire-dark to-grimoire-blood",
        cardBorder: "border-orange-500/40",
        cardText: "text-parchment-100",
        gradient: "from-orange-950 via-red-950 to-orange-950",
        buttonGradient: "from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800",
        text: "text-orange-400",
        accent: "text-orange-400",
        badge: "bg-orange-500/20 border-orange-400/50",
        badgeText: "text-orange-200",
    },
};

export default definition;
