import React, { useMemo, useState } from "react";
import Card from "../common/Card";
import { type Annotation } from "../../data/threads";
//import { currentSession } from "../../data/session";

type Props = {
    annotations: Annotation[];
    onAdd: (text: string, chapter?: string, page?: number) => void;
};

const AnnotationsPanel: React.FC<Props> = ({ annotations, onAdd }) => {
    const [q, setQ] = useState("");
    const [chapter, setChapter] = useState("");
    const [page, setPage] = useState<string>(""); // text input; cast later
    const [text, setText] = useState("");

    const filtered = useMemo(() => {
        const qq = q.toLowerCase();
        return annotations.filter(a => {
            const hay = `${a.text} ${a.chapter ?? ""} ${a.page ?? ""} ${a.authorName}`.toLowerCase();
            return hay.includes(qq);
        });
    }, [annotations, q]);

    return (
        <div className="space-y-4">
            <Card title="Add annotation">
                <div className="grid gap-2 sm:grid-cols-3">
                    <input className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={chapter} onChange={e => setChapter(e.target.value)} placeholder="Chapter (optional)" />
                    <input className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={page} onChange={e => setPage(e.target.value)} placeholder="Page (optional)" />
                    <button className="btn" onClick={() => {
                        const pg = page.trim() === "" ? undefined : Number(page);
                        if (!text.trim()) return;
                        onAdd(text.trim(), chapter.trim() || undefined, pg);
                        setText(""); setChapter(""); setPage("");
                    }}>Save</button>
                </div>
                <textarea className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                    placeholder="Your note…" value={text} onChange={e => setText(e.target.value)} />
            </Card>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Annotations</h3>
                <input className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="Search annotations…" value={q} onChange={e => setQ(e.target.value)} />
            </div>

            <div className="space-y-3">
                {filtered.map(a => (
                    <Card key={a.id} title={a.chapter ? `Ch. ${a.chapter}${a.page ? ` • p.${a.page}` : ""}` : (a.page ? `p.${a.page}` : "Note")}>
                        <div className="text-xs text-gray-600 mb-1">by {a.authorName}</div>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">{a.text}</div>
                    </Card>
                ))}
                {filtered.length === 0 && <div className="text-sm text-gray-600">No annotations yet.</div>}
            </div>
        </div>
    );
};

export default AnnotationsPanel;
