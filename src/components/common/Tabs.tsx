import React from "react";

type Tab = { id: string; label: string };
type Props = { tabs: Tab[]; value: string; onChange: (id: string) => void; };

const Tabs: React.FC<Props> = ({ tabs, value, onChange }) => (
    <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(t => (
            <button
                key={t.id}
                className={`px-3 py-2 text-sm rounded-t-xl ${value === t.id ? "bg-white border border-b-white border-gray-200" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => onChange(t.id)}
            >
                {t.label}
            </button>
        ))}
    </div>
);

export default Tabs;
