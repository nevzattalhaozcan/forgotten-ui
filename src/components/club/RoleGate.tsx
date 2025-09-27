import React from "react";
import { currentSession, type Role } from "../../data/session";

type Props = { allow: Role[]; children: React.ReactNode; otherwise?: React.ReactNode };

const RoleGate: React.FC<Props> = ({ allow, children, otherwise = null }) => {
    return allow.includes(currentSession.roleInClub) ? <>{children}</> : <>{otherwise}</>;
};

export default RoleGate;