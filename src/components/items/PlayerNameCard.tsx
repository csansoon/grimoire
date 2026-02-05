import { Icon } from "../atoms";

type PlayerNameCardProps = {
    name: string;
};

export function PlayerNameCard({ name }: PlayerNameCardProps) {
    return (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                    <Icon name="user" size="md" className="text-blue-300" />
                </div>
                <span className="text-parchment-100 font-medium text-lg">{name}</span>
            </div>
        </div>
    );
}
