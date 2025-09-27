import React, { useState } from "react";
import Card from "../common/Card";
import type { Poll, PollKind } from "../../data/polls";

const PollCreator: React.FC<{ onCreate: (p: Poll) => void; }> = ({ onCreate }) => {
    const [kind, setKind] = useState<PollKind>("location");
    const [question, setQuestion] = useState("");
    const [opts, setOpts] = useState<string[]>(["", ""]);

    const addOpt = () => setOpts([...opts, ""]);
    const setOpt = (i: number, v: string) => setOpts(opts.map((o, idx) => idx === i ? v : o));

    const create = () => {
        const cleaned = opts.map(o => o.trim()).filter(Boolean);
        if (!question.trim() || cleaned.length < 2) return;
        const poll: Poll = {
            id: Math.random().toString(36).slice(2),
            kind,
            question: question.trim(),
            options: cleaned.map((label, i) => ({ id: `o${i + 1}`, label, votes: 0 })),
            createdAtISO: new Date().toISOString(),
        };
        onCreate(poll);
        setQuestion(""); setOpts(["", ""]); setKind("location");
    };

    return (
        <Card title="Create a new poll">
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <span>Type</span>
                    <select
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={kind}
                        onChange={(e) => setKind(e.target.value as PollKind)}
                    >
                        <option value="location">Event location</option>
                        <option value="nextBook">Next book</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <input
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="Question"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                />
                <div className="space-y-2">
                    {opts.map((o, i) => (
                        <input
                            key={i}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            placeholder={`Option ${i + 1}`}
                            value={o}
                            onChange={e => setOpt(i, e.target.value)}
                        />
                    ))}
                    <button className="btn" onClick={addOpt}>+ Add option</button>
                </div>
                <div className="text-right">
                    <button className="btn" onClick={create}>Create poll</button>
                </div>
            </div>
        </Card>
    );
};

export default PollCreator;
