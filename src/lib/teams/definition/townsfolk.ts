import { TeamDefinition } from "../types";

const definition: TeamDefinition = {
    id: "townsfolk",
    name: "Townsfolk",
    icon: "users",
    winCondition: "Execute the Demon to win!",
    colors: {
        gradient: "from-blue-900 to-indigo-900",
        buttonGradient: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
        text: "text-blue-300",
        badge: "bg-blue-500/20 border-blue-500/50",
        badgeText: "text-blue-200",
    },
};

export default definition;
