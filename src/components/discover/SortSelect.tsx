import React from "react";

export type SortKey = "relevance" | "name" | "members" | "newest" | "nextEvent" | "rating";

interface SortSelectProps {
    value: SortKey;
    onChange: (sort: SortKey) => void;
}

const SortSelect: React.FC<SortSelectProps> = ({ value, onChange }) => {
    return (
        <select
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value as SortKey)}
        >
            <option value="relevance">Relevance</option>
            <option value="name">Name (A-Z)</option>
            <option value="members">Most Members</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="nextEvent">Next Event</option>
        </select>
    );
};

export default SortSelect;