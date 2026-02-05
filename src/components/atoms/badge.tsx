import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-purple-100 text-purple-800",
                player: "bg-purple-500/20 text-purple-200 border border-purple-400/30",
                role: "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30",
                effect: "bg-red-500/20 text-red-200 border border-red-400/30",
                townsfolk: "bg-blue-500/20 text-blue-200 border border-blue-400/30",
                outsider: "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30",
                minion: "bg-orange-500/20 text-orange-200 border border-orange-400/30",
                demon: "bg-red-600/20 text-red-200 border border-red-400/30",
                dead: "bg-gray-600/50 text-gray-300 border border-gray-500/30",
                success: "bg-green-500/20 text-green-200 border border-green-400/30",
                warning: "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
