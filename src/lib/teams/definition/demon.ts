import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "demon",
    name: "Demon",
    icon: "skull",
    winCondition: "Evil wins when evil players equal or outnumber the good. Stay hidden and eliminate the town!",
    colors: {
        gradient: "from-red-900 to-black",
        buttonGradient: "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
        text: "text-red-400",
        badge: "bg-red-500/20 border-red-500/50",
        badgeText: "text-red-200",
    },
};

export default definition;
