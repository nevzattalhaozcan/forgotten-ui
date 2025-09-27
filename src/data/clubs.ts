export type Club = {
    id: string;
    name: string;
    city: string;
    genres: string[];
    memberCount: number;
    description: string;
    createdAtISO: string;
    nextEventISO?: string;
};

export const sampleClubs: Club[] = [
    {
        id: "c1",
        name: "Istanbul Fiction Circle",
        city: "Istanbul",
        genres: ["fiction", "literary"],
        memberCount: 128,
        description: "Monthly discussions of contemporary Turkish and world literature.",
        createdAtISO: "2023-08-15T12:00:00Z",
        nextEventISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    },
    {
        id: "c2",
        name: "Sci‑Fi Saturdays",
        city: "Ankara",
        genres: ["sci‑fi", "cyberpunk"],
        memberCount: 74,
        description: "Reading speculative futures and classic cyberpunk.",
        createdAtISO: "2024-02-01T12:00:00Z",
        nextEventISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    },
    {
        id: "c3",
        name: "Non‑Fiction Nights",
        city: "Izmir",
        genres: ["non‑fiction", "psychology"],
        memberCount: 56,
        description: "Deep dives into ideas, science, and society.",
        createdAtISO: "2022-11-10T12:00:00Z",
    },
    {
        id: "c4",
        name: "Mystery Mondays",
        city: "Istanbul",
        genres: ["mystery", "thriller"],
        memberCount: 212,
        description: "Whodunits and page‑turners every other week.",
        createdAtISO: "2024-06-10T12:00:00Z",
        nextEventISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
];