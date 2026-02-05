import { ReactNode } from "react";

type StepSectionProps = {
    step: number;
    label: string;
    count?: { current: number; max: number };
    children: ReactNode;
};

export function StepSection({ step, label, count, children }: StepSectionProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-300 text-xs flex items-center justify-center font-bold">
                    {step}
                </span>
                <span className="text-parchment-300 text-sm">{label}</span>
                {count && (
                    <span className="text-parchment-500 text-xs">
                        ({count.current}/{count.max})
                    </span>
                )}
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}
