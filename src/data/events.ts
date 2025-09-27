export type EventAnnouncement = {
    id: string;
    clubName: string;
    title: string;
    dateISO: string; // e.g. "2025-10-12T18:30:00Z"
    city: string;
    description: string;
    tags?: string[];
};

export const sampleEvents: EventAnnouncement[] = [
    {
        id: "e1",
        clubName: "Istanbul Fiction Circle",
        title: "October Meetup: Orhan Pamuk — Snow",
        dateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        city: "Istanbul",
        description: "Discuss themes of identity and politics. Café Saray, Şişli.",
        tags: ["fiction", "turkish", "modern"]
    },
    {
        id: "e2",
        clubName: "Sci‑Fi Saturdays",
        title: "Neuromancer Wrap‑Up + Next Pick Vote",
        dateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        city: "Ankara",
        description: "Final thoughts on Gibson, then poll for next cyberpunk classic.",
        tags: ["sci‑fi", "vote"]
    },
    {
        id: "e3",
        clubName: "Non‑Fiction Nights",
        title: "Range by David Epstein — Ch. 1–5",
        dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        city: "Izmir",
        description: "Share notes on generalists vs specialists.",
        tags: ["non‑fiction", "psychology"]
    }
];