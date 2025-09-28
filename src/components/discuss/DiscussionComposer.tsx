import React, { useState } from "react";
import Card from "../common/Card";

type Props = {
    onCreate: (title: string, chapter?: string, quote?: string) => void;
};

const DiscussionComposer: React.FC<Props> = ({ onCreate }) => {
    const [title, setTitle] = useState("");
    const [chapter, setChapter] = useState("");
    const [quote, setQuote] = useState("");

    const create = () => {
        if (!title.trim()) return;
        onCreate(title.trim(), chapter.trim() || undefined, quote.trim() || undefined);
        setTitle(""); setChapter(""); setQuote("");
    };

    return (
        <Card title="Start a discussion">
            <div className="space-y-2">
                <input className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={title} onChange={e => setTitle(e.target.value)} placeholder="Topic title (e.g., Ch. 12 — Snow imagery)" />
                <div className="grid gap-2 sm:grid-cols-2">
                    <input className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={chapter} onChange={e => setChapter(e.target.value)} placeholder="Chapter(s) e.g. 10–12 (optional)" />
                    <input className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={quote} onChange={e => setQuote(e.target.value)} placeholder="Related quote (optional)" />
                </div>
                <div className="text-right">
                    <button className="btn" onClick={create}>Create thread</button>
                </div>
            </div>
        </Card>
    );
};

export default DiscussionComposer;
