import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "demon",
    name: "Demon",
    icon: "skull",
    winCondition: "Evil wins when evil players equal or outnumber the good. Stay hidden and eliminate the town!",
    isEvil: true,
    colors: {
        cardBg: "bg-gradient-to-b from-grimoire-darker to-grimoire-blood",
        cardBorder: "border-red-600/40",
        cardText: "text-parchment-100",
        gradient: "from-red-950 via-grimoire-blood to-black",
        buttonGradient: "from-red-700 to-red-900 hover:from-red-800 hover:to-red-950",
        text: "text-red-400",
        accent: "text-red-500",
        badge: "bg-red-500/20 border-red-500/50",
        badgeText: "text-red-200",
    },
};

export default definition;
