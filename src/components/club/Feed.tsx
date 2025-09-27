import React, { useState } from "react";
import Card from "../common/Card";
import { type Post } from "../../data/clubDetail";
import RoleGate from "./RoleGate";

function since(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.round(ms / 36e5); if (h < 24) return `${h}h ago`;
    const d = Math.round(h / 24); return `${d}d ago`;
}

type Props = {
    posts: Post[];
    onCreate: (content: string, as: "post" | "announcement") => void;
};

const Feed: React.FC<Props> = ({ posts, onCreate }) => {
    const [text, setText] = useState("");
    const [as, setAs] = useState<"post" | "announcement">("post");

    return (
        <div className="space-y-4">
            <RoleGate allow={["member", "moderator", "owner"]}>
                <Card title="Share to feed">
                    <div className="space-y-3">
                        <textarea
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            placeholder={as === "post" ? "Share a thought or annotation…" : "Write an announcement…"}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 text-sm">
                                <label className="flex items-center gap-2"><input type="radio" checked={as === "post"} onChange={() => setAs("post")} /> Post</label>
                                <label className="flex items-center gap-2"><input type="radio" checked={as === "announcement"} onChange={() => setAs("announcement")} /> Announcement</label>
                            </div>
                            <button className="btn" onClick={() => { if (!text.trim()) return; onCreate(text.trim(), as); setText(""); }}>Publish</button>
                        </div>
                    </div>
                </Card>
            </RoleGate>

            {posts.map(p => (
                <Card key={p.id} title={`${p.authorName} • ${since(p.createdAtISO)}`} actions={<span className="badge">{p.type}</span>}>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.content}</p>
                </Card>
            ))}
        </div>
    );
};

export default Feed;