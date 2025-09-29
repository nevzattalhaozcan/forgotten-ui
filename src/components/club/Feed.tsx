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
    const [as, setAs] = useState<"announcement" | "annotation">("announcement");

    const postTypes = [
        { value: "announcement", label: "Announcement", placeholder: "Write an announcement...", titlePlaceholder: "Announcement title..." },
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
                const timeAgo = since(p.createdAtISO);
                const exactTime = new Date(p.createdAtISO).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return (
                    <Card key={p.id} className="hover:shadow-lg transition-shadow">
                        <div className="space-y-4">
                            {/* Post Header with Title */}
                            <div className="space-y-2">
                                {p.title && (
                                    <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                                )}
                                <div className="flex items-start justify-between">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                        {typeInfo.emoji} {p.type}
                                    </span>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">{p.authorName}</div>
                                        <div className="text-xs text-gray-400" title={exactTime}>
                                            {timeAgo}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Post Content */}
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{p.content}</p>

                            {/* Post Actions */}
                            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {p.likes || 0}
                                </button>
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {p.comments || 0}
                                </button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default Feed;