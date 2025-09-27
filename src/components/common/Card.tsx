import React from "react";

type Props = {
    title?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
};

const Card: React.FC<Props> = ({ title, children, actions }) => (
    <div className="card">
        {(title || actions) && (
            <div className="card-header flex items-center justify-between">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {actions}
            </div>
        )}
        <div className="card-body">{children}</div>
    </div>
);

export default Card;