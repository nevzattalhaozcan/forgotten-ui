import React from "react";

type Props = { children: React.ReactNode };
const Badge: React.FC<Props> = ({ children }) => (
    <span className="badge">{children}</span>
);
export default Badge;