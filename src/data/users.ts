export type User = {
    id: string;
    name: string;
    email: string;
    city?: string;
    bio?: string;
    avatarUrl?: string; // optional for now
    stats: {
        booksRead: number;
        meetingsAttended: number;
        notesShared: number;
        streakDays: number;
    };
    preferences: {
        favoriteGenres: string[];
        notifyUpcomingEvents: boolean;
        weeklyDigest: boolean;
    };
};

export const currentUser: User = {
    id: "u1",
    name: "Ada Demir",
    email: "ada@example.com",
    city: "Istanbul",
    bio: "Fiction lover; lately into Turkish modernists and cozy mysteries.",
    stats: { booksRead: 27, meetingsAttended: 19, notesShared: 34, streakDays: 6 },
    preferences: {
        favoriteGenres: ["fiction", "mystery", "non‑fiction"],
        notifyUpcomingEvents: true,
        weeklyDigest: false,
    },
};