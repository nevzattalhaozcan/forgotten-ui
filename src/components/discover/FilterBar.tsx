import React from "react";

export type Filters = {
    city: string | "";
    genre: string | "";
    minMembers: number | "";
    maxMembers: number | "";
    q: string;
};

type Props = {
    filters: Filters;
    cities: string[];
    genres: string[];
    onChange: (next: Filters) => void;
    onClear: () => void;
};

const inputBase = "rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

const FilterBar: React.FC<Props> = ({ filters, cities, genres, onChange, onClear }) => {
    const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

    return (
        <div className="card p-4 grid grid-cols-1 gap-3 sm:grid-cols-6">
            <input
                className={`sm:col-span-2 ${inputBase}`}
                placeholder="Search club name/description…"
                value={filters.q}
                onChange={(e) => set({ q: e.target.value })}
            />
            <select
                className={`${inputBase}`}
                value={filters.city}
                onChange={(e) => set({ city: e.target.value })}
            >
                <option value="">All cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
                className={`${inputBase}`}
                value={filters.genre}
                onChange={(e) => set({ genre: e.target.value })}
            >
                <option value="">All genres</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input
                className={`${inputBase}`}
                type="number"
                min={0}
                placeholder="Min members"
                value={filters.minMembers}
                onChange={(e) => set({ minMembers: e.target.value === "" ? "" : Number(e.target.value) })}
            />
            <input
                className={`${inputBase}`}
                type="number"
                min={0}
                placeholder="Max members"
                value={filters.maxMembers}
                onChange={(e) => set({ maxMembers: e.target.value === "" ? "" : Number(e.target.value) })}
            />
            <div className="sm:col-span-6 flex justify-end">
                <button className="btn" onClick={onClear}>Clear filters</button>
            </div>
        </div>
    );
};

export default FilterBar;