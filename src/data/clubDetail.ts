import type { Role } from "./session";

export type ClubMember = { id: string; name: string; role: Role; joinedISO: string; is_approved: boolean };
export type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: Role;
    type: "discussion" | "announcement" | "event" | "poll" | "review" | "annotation";
    content: string;
    createdAtISO: string;
};

export type Gathering = { id: string; dateISO: string; location: string; agenda?: string };
export type CurrentBook = { title: string; author: string; progressPct: number; annotations: number; discussions: number };

export type ClubDetail = {
    id: string;
    name: string;
    description: string;
    members: ClubMember[];
    ownerId: string;
    currentBook: CurrentBook;
    nextGathering?: Gathering;
    posts: Post[];
};

export const clubDetail: ClubDetail = {
    id: "c1",
    name: "Istanbul Fiction Circle",
    description: "Monthly discussions of contemporary literature.",
    ownerId: "u100",
    members: [
        {
            id: "u100", name: "Ece Kaya", role: "owner", joinedISO: "2023-01-03T10:00:00Z",
            is_approved: false
        },
        {
            id: "u1", name: "Ada Demir", role: "member", joinedISO: "2024-05-02T09:00:00Z",
            is_approved: false
        },
        {
            id: "u55", name: "Mert Aksoy", role: "moderator", joinedISO: "2023-12-12T09:00:00Z",
            is_approved: false
        },
    ],
    currentBook: { title: "Snow", author: "Orhan Pamuk", progressPct: 45, annotations: 18, discussions: 5 },
    nextGathering: { id: "g1", dateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(), location: "Café Saray, Şişli", agenda: "Ch. 10–18 + motifs" },
    posts: [
        { id: "p3", authorId: "u100", authorName: "Ece Kaya", authorRole: "owner", type: "announcement", content: "📢 Venue change to Café Saray for next week!", createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
        { id: "p2", authorId: "u55", authorName: "Mert Aksoy", authorRole: "moderator", type: "discussion", content: "Loved the snow imagery in Ch. 12—any parallels you caught?", createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: "p1", authorId: "u1", authorName: "Ada Demir", authorRole: "member", type: "annotation", content: "Sharing my notes on political symbolism…", createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    ],
};