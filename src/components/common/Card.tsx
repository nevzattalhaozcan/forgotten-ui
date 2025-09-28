import React from "react";

type Props = {
    title?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
    variant?: "default" | "elevated" | "outlined" | "glass";
    hover?: boolean;
};

const Card: React.FC<Props> = ({ 
    title, 
    children, 
    actions, 
    className,
    variant = "default",
    hover = true
}) => {
    const variantClasses = {
        default: "card",
        elevated: "bg-white border border-slate-200/60 rounded-xl shadow-md hover:shadow-lg",
        outlined: "bg-white border-2 border-slate-300/60 rounded-xl hover:border-slate-400/60",
        glass: "glass-card rounded-xl shadow-md hover:shadow-lg"
    };

    const hoverClasses = hover ? "transform hover:scale-[1.02] hover:-translate-y-1" : "";
    const cardClasses = `${variantClasses[variant]} ${hoverClasses} transition-all duration-200 ${className || ""}`;

    return (
        <div className={cardClasses}>
            {(title || actions) && (
                <div className="card-header flex items-start justify-between">
                    {title && (
                        <h3 className="text-lg font-semibold text-slate-800 leading-tight">
                            {title}
                        </h3>
                    )}
                    {actions && (
                        <div className="flex flex-wrap items-start gap-2 ml-4">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
};

export default Card;