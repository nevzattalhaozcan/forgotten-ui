import React from "react";

type Props = { 
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "secondary" | "success" | "warning" | "error" | "outline" | "gradient";
};

export default function Badge({ children, className, variant = "default" }: Props) {
    const variantClasses = {
        default: "bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-100",
        secondary: "bg-slate-50 text-slate-700 border border-slate-200/50 hover:bg-slate-100", 
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100",
        warning: "bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100",
        error: "bg-red-50 text-red-700 border border-red-200/50 hover:bg-red-100",
        outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50",
        gradient: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md hover:from-blue-600 hover:to-indigo-700"
    };
    
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 cursor-default";
    const classes = `${baseClasses} ${variantClasses[variant]}${className ? ` ${className}` : ""}`;
    
    return (
        <span className={classes}>
            {children}
        </span>
    );
}