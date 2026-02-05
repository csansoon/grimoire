import { IconName } from "../../components/atoms/icon";

export type TeamId = "townsfolk" | "outsider" | "minion" | "demon";

export type TeamDefinition = {
    id: TeamId;
    name: string;
    icon: IconName;
    winCondition: string;
    colors: {
        // Background gradients
        gradient: string;
        buttonGradient: string;
        // Text colors
        text: string;
        // Badge/accent colors
        badge: string;
        badgeText: string;
    };
};
