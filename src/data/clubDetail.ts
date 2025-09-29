import type { Role } from "./session";

export type ClubMember = { id: string; name: string; role: Role; joinedISO: string; is_approved: boolean };
export type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: Role;
    type: "discussion" | "announcement" | "event" | "poll" | "review" | "annotation" | "post";
    content: string;
    title?: string;
    likes?: number;
    comments?: number;
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
        { 
            id: "p5", 
            authorId: "u55", 
            authorName: "Mert Aksoy", 
            authorRole: "moderator", 
            type: "poll", 
            title: "What should be our next reading theme?",
            content: "Hey everyone! I'd love to get your input on our next book selection. What genre or theme interests you most?", 
            likes: 8,
            comments: 4,
            createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() 
        },
        { 
            id: "p4", 
            authorId: "u1", 
            authorName: "Ada Demir", 
            authorRole: "member", 
            type: "review", 
            title: "Snow by Orhan Pamuk - A Masterpiece",
            content: "Just finished reading Snow and I'm blown away! Pamuk's exploration of faith, politics, and identity in rural Turkey is both haunting and beautiful. The way he weaves together Ka's personal journey with the broader social tensions is masterful. The snow becomes almost a character itself, blanketing the town in isolation and forcing everyone to confront their deepest beliefs.\n\nThe political commentary feels especially relevant today. Highly recommend this for anyone interested in Turkish literature or stories about ideological conflicts.", 
            likes: 12,
            comments: 7,
            createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() 
        },
        { 
            id: "p3", 
            authorId: "u100", 
            authorName: "Ece Kaya", 
            authorRole: "owner", 
            type: "announcement", 
            title: "Venue Change - Important!",
            content: "📢 Hey everyone! Quick update about our next meeting - we're changing the venue to Café Saray in Şişli. The address is Cumhuriyet Mahallesi, Vali Konağı Cd. No:3, 34367 Şişli/İstanbul.\n\nThe café has a lovely reading nook upstairs that should be perfect for our discussion. Same time (7 PM), just different location. See you all there!", 
            likes: 15,
            comments: 3,
            createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() 
        },
        { 
            id: "p2", 
            authorId: "u55", 
            authorName: "Mert Aksoy", 
            authorRole: "moderator", 
            type: "discussion", 
            title: "Snow Imagery and Symbolism in Chapter 12",
            content: "I absolutely loved the snow imagery in Chapter 12! The way Pamuk uses the snowfall to mirror Ka's internal state is brilliant. Did anyone else catch the parallels between the physical isolation caused by the snowstorm and Ka's emotional isolation from his past?\n\nI'm particularly intrigued by how the snow seems to 'purify' the town while simultaneously trapping everyone in their conflicts. What do you all think - is the snow a symbol of cleansing or imprisonment?", 
            likes: 9,
            comments: 11,
            createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() 
        },
        { 
            id: "p1", 
            authorId: "u1", 
            authorName: "Ada Demir", 
            authorRole: "member", 
            type: "post", 
            title: "My Reading Progress",
            content: "Update: I'm about 60% through Snow now and really getting into the rhythm of Pamuk's storytelling. Taking notes as I go - already have 3 pages of thoughts about the political allegories!\n\nAnyone else finding the shifts between Ka's perspective and the narrator's voice interesting? Sometimes it feels like we're reading a story within a story.", 
            likes: 6,
            comments: 2,
            createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() 
        },
        { 
            id: "p0", 
            authorId: "u100", 
            authorName: "Ece Kaya", 
            authorRole: "owner", 
            type: "discussion", 
            title: "Welcome New Members!",
            content: "Hi everyone! I wanted to take a moment to welcome our three new members who joined this week. We're so excited to have fresh perspectives in our discussions!\n\nFor our newcomers: we're currently reading 'Snow' by Orhan Pamuk, and we'll be discussing chapters 10-18 at our next meeting. Don't worry if you're not caught up - we love having people at different stages of reading.\n\nFeel free to share your thoughts here as you read, ask questions, or just introduce yourselves. Looking forward to hearing from you all!", 
            likes: 18,
            comments: 8,
            createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() 
        }
    ],
};