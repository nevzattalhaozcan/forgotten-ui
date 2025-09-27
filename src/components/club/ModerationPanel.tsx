import React, { useState } from "react";
import { type ClubMember } from "../../data/clubDetail";
import { type Role } from "../../data/session";

const canPromote = (me: Role, target: Role) => me === "owner" && target === "member";
const canDemote = (me: Role, target: Role) => me === "owner" && target === "moderator";
const canRemove = (me: Role, target: Role) =>
  (me === "owner" && target !== "owner") || (me === "moderator" && target === "member");

type Props = {
  me: Role;
  members: ClubMember[];
  onClose: () => void;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onRemove: (id: string) => void;
};

const ModerationPanel: React.FC<Props> = ({ me, members, onClose, onPromote, onDemote, onRemove }) => {
  const [q, setQ] = useState("");
  const list = members.filter(m => (m.name+" "+m.role).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-lg bg-white p-4 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-lg font-semibold">Manage users</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="py-3">
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
            placeholder="Search by name or role…"
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
        </div>
        <ul className="divide-y">
          {list.map(m => (
            <li key={m.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">Role: {m.role}</div>
                </div>
                <div className="flex gap-2">
                  {canPromote(me, m.role) && <button className="btn" onClick={()=>onPromote(m.id)}>Promote to moderator</button>}
                  {canDemote(me, m.role) && <button className="btn" onClick={()=>onDemote(m.id)}>Demote to member</button>}
                  {canRemove(me, m.role) && <button className="btn" onClick={()=>onRemove(m.id)}>Remove</button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModerationPanel;
