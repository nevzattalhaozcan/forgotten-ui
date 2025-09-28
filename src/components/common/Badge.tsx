import React from "react";

type Props = { 
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
};

export default function Badge({ children, className, variant = "default" }: Props) {
    const variantClasses = {
        default: "bg-blue-100 text-blue-800",
        secondary: "bg-gray-100 text-gray-800", 
        destructive: "bg-red-100 text-red-800",
        outline: "border border-gray-300 bg-transparent text-gray-700"
    };
    
    const baseClasses = "inline-block rounded px-2 py-0.5 text-xs font-medium";
    const classes = `${baseClasses} ${variantClasses[variant]}${className ? ` ${className}` : ""}`;
    
    return (
        <span className={classes}>
            {children}
        </span>
    );
}