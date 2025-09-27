import React, { useMemo, useState } from "react";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import FilterBar, { type Filters } from "../components/discover/FilterBar";
import SortSelect, { type SortKey } from "../components/discover/SortSelect";
import { sampleClubs, type Club } from "../data/clubs";

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function fmtDate(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const Discover: React.FC = () => {
    const [filters, setFilters] = useState<Filters>({ city: "", genre: "", minMembers: "", maxMembers: "", q: "" });
    const [sort, setSort] = useState<SortKey>("relevance");

    const cities = useMemo(() => uniq(sampleClubs.map(c => c.city)).sort(), []);
    const genres = useMemo(() => uniq(sampleClubs.flatMap(c => c.genres)).sort(), []);

    const filtered = useMemo(() => {
        const q = filters.q.toLowerCase();
        const list = sampleClubs.filter(c => {
            if (filters.city && c.city !== filters.city) return false;
            if (filters.genre && !c.genres.includes(filters.genre)) return false;
            if (filters.minMembers !== "" && c.memberCount < Number(filters.minMembers)) return false;
            if (filters.maxMembers !== "" && c.memberCount > Number(filters.maxMembers)) return false;
            if (q) {
                const hay = (c.name + " " + c.description + " " + c.genres.join(" ")).toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        const byName = (a: Club, b: Club) => a.name.localeCompare(b.name);
        const byMembers = (a: Club, b: Club) => b.memberCount - a.memberCount;
        const byNewest = (a: Club, b: Club) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime();
        const byNextEvent = (a: Club, b: Club) => (new Date(a.nextEventISO ?? 0).getTime() || Infinity) - (new Date(b.nextEventISO ?? 0).getTime() || Infinity);

        switch (sort) {
            case "name": list.sort(byName); break;
            case "members": list.sort(byMembers); break;
            case "newest": list.sort(byNewest); break;
            case "nextEvent": list.sort(byNextEvent); break;
            case "relevance": default:
                // simple relevance: prioritize matches by name and bigger clubs
                list.sort((a, b) => {
                    const an = a.name.toLowerCase().includes(q) ? 0 : 1;
                    const bn = b.name.toLowerCase().includes(q) ? 0 : 1;
                    if (an !== bn) return an - bn;
                    return byMembers(a, b);
                });
        }

        return list;
    }, [filters, sort]);

    const clear = () => setFilters({ city: "", genre: "", minMembers: "", maxMembers: "", q: "" });

    return (
        <div className="container space-y-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Discover Clubs</h1>
                <SortSelect value={sort} onChange={setSort} />
            </header>

            <FilterBar
                filters={filters}
                cities={cities}
                genres={genres}
                onChange={setFilters}
                onClear={clear}
            />

            <div className="text-sm text-gray-600">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(c => (
                    <Card key={c.id} title={c.name} actions={<Badge>{c.city}</Badge>}>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {c.genres.map(g => <Badge key={g}>{g}</Badge>)}
                            </div>
                            <p className="text-sm text-gray-700">{c.description}</p>
                            <div className="text-sm text-gray-600">Members: {c.memberCount}</div>
                            <div className="text-sm text-gray-600">Next event: {fmtDate(c.nextEventISO)}</div>
                            <div className="pt-2">
                                <button className="btn">View club</button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-sm text-gray-500">No clubs match your filters.</div>
            )}
        </div>
    );
};

export default Discover;