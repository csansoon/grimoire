import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "outsider",
    name: "Outsider",
    icon: "userX",
    winCondition: "Execute the Demon to win! But beware, your ability may hinder the town.",
    isEvil: false,
    colors: {
        cardBg: "bg-gradient-to-b from-parchment-100 to-parchment-300",
        cardBorder: "border-mystic-silver/40",
        cardText: "text-grimoire-dark",
        gradient: "from-slate-950 via-cyan-950 to-slate-950",
        buttonGradient: "from-mystic-silver to-slate-400 hover:from-slate-400 hover:to-mystic-silver",
        text: "text-cyan-300",
        accent: "text-mystic-silver",
        badge: "bg-cyan-500/20 border-cyan-400/50",
        badgeText: "text-cyan-200",
    },
};

export default definition;
