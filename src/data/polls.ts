export type PollKind = "nextBook" | "location" | "custom";

export type PollOption = { id: string; label: string; votes: number };
export type Poll = {
    id: string;
    kind: PollKind;
    question: string;
    options: PollOption[];
    createdAtISO: string;
    closesISO?: string;
};

export const samplePolls: Poll[] = [
    {
        id: "poll1",
        kind: "location",
        question: "Where should we meet next week?",
        options: [
            { id: "o1", label: "Café Saray, Şişli", votes: 6 },
            { id: "o2", label: "Moda Sahil Park", votes: 4 },
            { id: "o3", label: "Online (Zoom)", votes: 2 },
        ],
        createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
        id: "poll2",
        kind: "nextBook",
        question: "Next month’s book?",
        options: [
            { id: "o1", label: "The Black Book — Orhan Pamuk", votes: 3 },
            { id: "o2", label: "The Idiot — Dostoyevsky", votes: 5 },
            { id: "o3", label: "Blindness — José Saramago", votes: 1 },
        ],
        createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    },
];
