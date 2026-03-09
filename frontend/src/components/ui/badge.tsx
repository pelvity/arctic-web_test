import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                {
                    "border-transparent bg-blue-600 hover:bg-blue-600/80 text-white": variant === "default",
                    "border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-800/80": variant === "secondary",
                    "border-transparent bg-red-600 text-white hover:bg-red-600/80": variant === "destructive",
                    "text-white border-white/20": variant === "outline",
                },
                className
            )}
            {...props}
        />
    );
}

export { Badge };
