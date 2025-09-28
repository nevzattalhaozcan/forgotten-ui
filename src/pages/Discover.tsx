import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import FilterBar, { type Filters } from "../components/discover/FilterBar";
import SortSelect, { type SortKey } from "../components/discover/SortSelect";
import { listClubs, type ClubApi } from "../lib/clubs";

type ClubView = {
    id: string | number;
    name: string;
    description: string;
    city: string;
    genres: string[];
    memberCount: number;
    maxMembers: number;
    rating: number | null;
    ratingsCount: number;
    coverImageUrl: string | null;
    isPrivate: boolean;
    ownerName: string;
    nextEventISO?: string;
    nextEventTopic?: string;
    nextEventLocation?: string;
    createdAt: string;
};

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }
function fmtDate(iso?: string) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatRating(rating: number | null, count: number): string {
    if (!rating || count === 0) return "No ratings";
    return `★ ${rating.toFixed(1)} (${count} rating${count !== 1 ? 's' : ''})`;
}

export default function Discover() {
    const [filters, setFilters] = useState<Filters>({ city: "", genre: "", minMembers: "", maxMembers: "", q: "" });
    const [sort, setSort] = useState<SortKey>("relevance");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clubs, setClubs] = useState<ClubView[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await listClubs();
                const mapped: ClubView[] = data.map((c) => ({
                    id: c.id,
                    name: c.name,
                    description: c.description,
                    city: c.location ?? "",
                    genres: [c.genre, ...(c.tags ?? [])].filter(Boolean) as string[],
                    memberCount: c.members_count,
                    maxMembers: c.max_members,
                    rating: c.rating,
                    ratingsCount: c.ratings_count,
                    coverImageUrl: c.cover_image_url,
                    isPrivate: c.is_private,
                    ownerName: c.owner.first_name && c.owner.last_name 
                        ? `${c.owner.first_name} ${c.owner.last_name}`
                        : c.owner.username,
                    nextEventISO: c.next_meeting?.date,
                    nextEventTopic: c.next_meeting?.topic,
                    nextEventLocation: c.next_meeting?.location,
                    createdAt: c.created_at,
                }));
                setClubs(mapped);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                setError(e?.detail?.message || "Failed to load clubs");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const cities = useMemo(() => uniq(clubs.map(c => c.city).filter(Boolean)).sort(), [clubs]);
    const genres = useMemo(() => uniq(clubs.flatMap(c => c.genres)).sort(), [clubs]);

    const filtered = useMemo(() => {
        const q = filters.q.toLowerCase();
        const list = clubs.filter(c => {
            if (filters.city && c.city !== filters.city) return false;
            if (filters.genre && !c.genres.includes(filters.genre)) return false;
            if (filters.minMembers !== "" && c.memberCount < Number(filters.minMembers)) return false;
            if (filters.maxMembers !== "" && c.memberCount > Number(filters.maxMembers)) return false;
            if (q) {
                const hay = (c.name + " " + c.description + " " + c.genres.join(" ") + " " + c.ownerName).toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        const byName = (a: ClubView, b: ClubView) => a.name.localeCompare(b.name);
        const byMembers = (a: ClubView, b: ClubView) => b.memberCount - a.memberCount;
        const byNewest = (a: ClubView, b: ClubView) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        const byNextEvent = (a: ClubView, b: ClubView) =>
            (new Date(a.nextEventISO ?? '').getTime() || Infinity) - (new Date(b.nextEventISO ?? '').getTime() || Infinity);
        const byRating = (a: ClubView, b: ClubView) => (b.rating ?? 0) - (a.rating ?? 0);

        switch (sort) {
            case "name": list.sort(byName); break;
            case "members": list.sort(byMembers); break;
            case "newest": list.sort(byNewest); break;
            case "nextEvent": list.sort(byNextEvent); break;
            case "rating": list.sort(byRating); break;
            case "relevance":
            default:
                list.sort((a, b) => {
                    const ql = filters.q.toLowerCase();
                    if (ql) {
                        const an = a.name.toLowerCase().includes(ql) ? 0 : 1;
                        const bn = b.name.toLowerCase().includes(ql) ? 0 : 1;
                        if (an !== bn) return an - bn;
                    }
                    return byMembers(a, b);
                });
        }

        return list;
    }, [clubs, filters, sort]);

    const clear = () => setFilters({ city: "", genre: "", minMembers: "", maxMembers: "", q: "" });

    if (loading) {
        return (
            <div className="container space-y-4">
                <h1 className="text-2xl font-bold">Discover Clubs</h1>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card p-5 animate-pulse">
                            <div className="h-32 w-full bg-gray-200 rounded mb-3" />
                            <div className="h-5 w-1/2 bg-gray-200 rounded mb-2" />
                            <div className="h-4 w-2/3 bg-gray-200 rounded mb-1" />
                            <div className="h-4 w-1/3 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container space-y-4">
                <h1 className="text-2xl font-bold">Discover Clubs</h1>
                <div className="card p-5 text-sm text-red-700">Error: {error}</div>
            </div>
        );
    }

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
                    <Card 
                        key={c.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        {/* Cover Image */}
                        {c.coverImageUrl && (
                            <div className="relative">
                                <img 
                                    src={c.coverImageUrl} 
                                    alt={c.name}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {c.isPrivate && (
                                        <span className="bg-red-100 text-red-800 rounded px-2 py-0.5 text-xs font-medium">
                                            🔒 Private
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="p-4 space-y-3">
                            {/* Header */}
                            <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-lg leading-tight">{c.name}</h3>
                                    <Badge className="ml-2 shrink-0">
                                        {c.city || "—"}
                                    </Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                    by {c.ownerName}
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-700 line-clamp-2">
                                {c.description}
                            </p>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-1">
                                {c.genres.slice(0, 3).map(g => (
                                    <Badge key={g} className="text-xs">
                                        {g}
                                    </Badge>
                                ))}
                                {c.genres.length > 3 && (
                                    <Badge className="text-xs">
                                        +{c.genres.length - 3} more
                                    </Badge>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Members:</span>
                                    <span>{c.memberCount}/{c.maxMembers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Rating:</span>
                                    <span>{formatRating(c.rating, c.ratingsCount)}</span>
                                </div>
                            </div>

                            {/* Next Event */}
                            {c.nextEventISO && (
                                <div className="p-2 bg-blue-50 rounded text-xs">
                                    <div className="font-medium text-blue-900">
                                        📅 {c.nextEventTopic || "Next Meeting"}
                                    </div>
                                    <div className="text-blue-700">
                                        {fmtDate(c.nextEventISO)}
                                    </div>
                                    {c.nextEventLocation && (
                                        <div className="text-blue-600 truncate">
                                            📍 {c.nextEventLocation}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-2">
                                <button 
                                    className="btn w-full" 
                                    onClick={() => navigate(`/club/${c.id}`)}
                                >
                                    View Club
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-8">
                    No clubs match your filters. Try adjusting your search criteria.
                </div>
            )}
        </div>
    );
}