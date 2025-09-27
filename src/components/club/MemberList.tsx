import React from "react";
import { type ClubMember } from "../../data/clubDetail";

const MemberList: React.FC<{ members: ClubMember[]; onClose: () => void; }> = ({ members, onClose }) => (
    <div className="fixed inset-0 z-40 flex">
        <div className="flex-1 bg-black/30" onClick={onClose} />
        <div className="w-full max-w-md bg-white p-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b"><h3 className="text-lg font-semibold">Members</h3><button className="btn" onClick={onClose}>Close</button></div>
            <ul className="divide-y">
                {members.map(m => (
                    <li key={m.id} className="py-3 flex items-center justify-between">
                        <div>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-gray-500">Role: {m.role}</div>
                        </div>
                        <div className="text-xs text-gray-500">Joined {new Date(m.joinedISO).toLocaleDateString()}</div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

export default MemberList;