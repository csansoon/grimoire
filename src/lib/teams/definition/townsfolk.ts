import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "townsfolk",
    name: "Townsfolk",
    icon: "users",
    winCondition: "Execute the Demon to win!",
    isEvil: false,
    colors: {
        cardBg: "bg-gradient-to-b from-parchment-100 to-parchment-200",
        cardBorder: "border-mystic-gold/40",
        cardText: "text-grimoire-dark",
        gradient: "from-indigo-950 via-blue-950 to-indigo-950",
        buttonGradient: "from-mystic-gold to-mystic-bronze hover:from-mystic-bronze hover:to-mystic-gold",
        text: "text-blue-300",
        accent: "text-mystic-gold",
        badge: "bg-blue-500/20 border-blue-400/50",
        badgeText: "text-blue-200",
    },
};

export default definition;
