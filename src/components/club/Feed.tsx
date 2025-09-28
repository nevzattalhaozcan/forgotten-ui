import React, { useState } from "react";
import Card from "../common/Card";
import { type Post } from "../../data/clubDetail";
import RoleGate from "./RoleGate";

function since(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.round(ms / 36e5); if (h < 24) return `${h}h ago`;
    const d = Math.round(h / 24); return `${d}d ago`;
}

function getPostTypeInfo(type: string) {
    const typeMap = {
        discussion: { emoji: "💬", color: "bg-blue-100 text-blue-800" },
        announcement: { emoji: "📢", color: "bg-red-100 text-red-800" },
        event: { emoji: "📅", color: "bg-green-100 text-green-800" },
        poll: { emoji: "📊", color: "bg-purple-100 text-purple-800" },
        review: { emoji: "⭐", color: "bg-yellow-100 text-yellow-800" },
        annotation: { emoji: "📝", color: "bg-indigo-100 text-indigo-800" },
    };
    return typeMap[type as keyof typeof typeMap] || { emoji: "💬", color: "bg-gray-100 text-gray-800" };
}

type Props = {
    posts: Post[];
    onCreate: (content: string, as: "discussion" | "announcement" | "event" | "poll" | "review" | "annotation", title?: string) => void;
};

const Feed: React.FC<Props> = ({ posts, onCreate }) => {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [as, setAs] = useState<"discussion" | "announcement" | "event" | "poll" | "review" | "annotation">("discussion");

    const postTypes = [
        { value: "discussion", label: "Discussion", placeholder: "Start a discussion...", titlePlaceholder: "Discussion topic..." },
        { value: "announcement", label: "Announcement", placeholder: "Write an announcement...", titlePlaceholder: "Announcement title..." },
        { value: "event", label: "Event", placeholder: "Share event details...", titlePlaceholder: "Event name..." },
        { value: "poll", label: "Poll", placeholder: "Create a poll...", titlePlaceholder: "Poll question..." },
        { value: "review", label: "Review", placeholder: "Write a book review...", titlePlaceholder: "Book title..." },
        { value: "annotation", label: "Annotation", placeholder: "Share an annotation...", titlePlaceholder: "Chapter or page reference..." },
    ] as const;

    const handlePublish = () => {
        if (!text.trim()) return;
        onCreate(text.trim(), as, title.trim() || undefined);
        setText("");
        setTitle("");
    };

    return (
        <div className="space-y-4">
            <RoleGate allow={["member", "moderator", "owner"]}>
                <Card title="Share to feed">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={postTypes.find(t => t.value === as)?.titlePlaceholder || "Title..."}
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                        <textarea
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            placeholder={postTypes.find(t => t.value === as)?.placeholder || "Write something..."}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2 text-sm">
                                {postTypes.map(type => (
                                    <label key={type.value} className="flex items-center gap-1 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            checked={as === type.value} 
                                            onChange={() => setAs(type.value)} 
                                            className="text-indigo-600"
                                        />
                                        <span className="text-xs">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                            <button className="btn" onClick={handlePublish}>Publish</button>
                        </div>
                    </div>
                </Card>
            </RoleGate>

            {posts.map(p => {
                const typeInfo = getPostTypeInfo(p.type);
                return (
                    <Card key={p.id} title={`${p.authorName} • ${since(p.createdAtISO)}`} 
                          actions={
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                  {typeInfo.emoji} {p.type}
                              </span>
                          }>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.content}</p>
                    </Card>
                );
            })}
        </div>
    );
};

export default Feed;