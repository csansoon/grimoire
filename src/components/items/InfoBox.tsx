import { Icon } from "../atoms";
import { IconName } from "../atoms/icon";

type InfoBoxProps = {
    icon: IconName;
    title: string;
    description?: string;
};

export function InfoBox({ icon, title, description }: InfoBoxProps) {
    return (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 text-center">
            <Icon name={icon} size="xl" className="text-blue-300 mx-auto mb-3" />
            <h2 className="text-parchment-100 font-tarot text-lg mb-2">{title}</h2>
            {description && (
                <p className="text-parchment-400 text-sm">{description}</p>
            )}
        </div>
    );
}
