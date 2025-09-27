import React from "react";

export type SortKey = "relevance" | "name" | "members" | "newest" | "nextEvent";

type Props = {
    value: SortKey;
    onChange: (v: SortKey) => void;
};

const SortSelect: React.FC<Props> = ({ value, onChange }) => (
    <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Sort by</span>
        <select
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={value}
            onChange={(e) => onChange(e.target.value as SortKey)}
        >
            <option value="relevance">Relevance</option>
            <option value="name">Name A–Z</option>
            <option value="members">Member count</option>
            <option value="newest">Newest clubs</option>
            <option value="nextEvent">Soonest next event</option>
        </select>
    </div>
);

export default SortSelect;