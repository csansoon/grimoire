import { IconName } from "../../components/atoms/icon";

export type TeamId = "townsfolk" | "outsider" | "minion" | "demon";

export type TeamDefinition = {
    id: TeamId;
    name: string;
    icon: IconName;
    winCondition: string;
    isEvil: boolean;
    colors: {
        // For tarot card backgrounds
        cardBg: string;
        cardBorder: string;
        cardText: string;
        // For general UI
        gradient: string;
        buttonGradient: string;
        text: string;
        accent: string;
        badge: string;
        badgeText: string;
    };
};
