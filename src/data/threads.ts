export type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    createdAtISO: string;
    text: string;
};

export type DiscussionThread = {
    id: string;
    title: string;             // e.g., "Ch. 12 — Snow imagery"
    chapter?: string;          // optional chapter range
    quote?: string;            // optional related quote snippet
    createdAtISO: string;
    authorId: string;
    authorName: string;
    comments: Comment[];
};

export type Annotation = {
    id: string;
    chapter?: string;
    page?: number;
    text: string;              // the note
    createdAtISO: string;
    authorId: string;
    authorName: string;
};

export const sampleThreads: DiscussionThread[] = [
    {
        id: "t1",
        title: "Ch. 12 — Snow imagery",
        chapter: "10–12",
        quote: "“The snow fell silently, blanketing the town…”",
        createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        authorId: "u55",
        authorName: "Mert Aksoy",
        comments: [
            { id: "c1", authorId: "u1", authorName: "Ada Demir", createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), text: "Feels like isolation vs clarity?" },
            { id: "c2", authorId: "u100", authorName: "Ece Kaya", createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(), text: "Also purity vs political ‘whitewashing’?" },
        ],
    },
];

export const sampleAnnotations: Annotation[] = [
    { id: "a1", chapter: "5", page: 87, text: "Motif: mirrors & identity", createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), authorId: "u1", authorName: "Ada Demir" },
    { id: "a2", chapter: "10", page: 156, text: "Recurring image: footprints erased by new snow", createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), authorId: "u55", authorName: "Mert Aksoy" },
];
