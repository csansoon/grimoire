import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "outsider",
    name: "Outsider",
    icon: "userRound",
    winCondition: "Execute the Demon to win! But beware, your ability may hinder the town.",
    colors: {
        gradient: "from-cyan-900 to-blue-900",
        buttonGradient: "from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700",
        text: "text-cyan-300",
        badge: "bg-cyan-500/20 border-cyan-500/50",
        badgeText: "text-cyan-200",
    },
};

export default definition;
