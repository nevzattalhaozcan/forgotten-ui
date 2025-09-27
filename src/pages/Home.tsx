import React, { useMemo, useState } from "react";
import { sampleEvents, type EventAnnouncement } from "../data/events";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
function formatDate(iso: string) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(d);
}

const Home: React.FC = () => {
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

    const events = useMemo(() => {
        const now = Date.now();
        const filtered = sampleEvents.filter(e => {
            const inTab = tab === "upcoming" ? new Date(e.dateISO).getTime() >= now : new Date(e.dateISO).getTime() < now;
            const q = query.toLowerCase();
            const inText = [e.title, e.clubName, e.city, e.description, ...(e.tags ?? [])].join(" ").toLowerCase();
            return inTab && inText.includes(q);
        });
        return filtered.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
    }, [query, tab]);

    return (
        <div className="container space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Upcoming Events & Announcements</h1>
                <div className="flex items-center gap-2">
                    <button className={`btn ${tab === "upcoming" ? "bg-gray-100" : ""}`} onClick={() => setTab("upcoming")}>Upcoming</button>
                    <button className={`btn ${tab === "past" ? "bg-gray-100" : ""}`} onClick={() => setTab("past")}>Past</button>
                </div>
            </header>

            <div className="flex items-center gap-3">
                <input
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Search events, clubs, cities, tags…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((e: EventAnnouncement) => (
                    <Card key={e.id} title={e.title} actions={<Badge>{e.city}</Badge>}>
                        <div className="space-y-2">
                            <div className="text-sm text-gray-600">{e.clubName}</div>
                            <div className="text-sm">{formatDate(e.dateISO)}</div>
                            <p className="text-sm text-gray-700">{e.description}</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {(e.tags ?? []).map(t => (<Badge key={t}>{t}</Badge>))}
                            </div>
                            <div className="pt-3">
                                <button className="btn">View details</button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-sm text-gray-500">No events match your search.</div>
            )}
        </div>
    );
};

export default Home;