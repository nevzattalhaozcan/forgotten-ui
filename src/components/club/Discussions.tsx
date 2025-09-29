import React, { useState } from "react";
import Card from "../common/Card";
import RoleGate from "./RoleGate";

function since(iso: string) {
    const now = new Date();
    const then = new Date(iso);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;
    return then.toLocaleDateString();
}

type Discussion = {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: "member" | "moderator" | "owner";
    title: string;
    content: string;
    createdAtISO: string;
    likes?: number;
    comments?: number;
};

type Props = {
    discussions: Discussion[];
    onCreate: (title: string, content: string) => void;
};

const Discussions: React.FC<Props> = ({ discussions, onCreate }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handlePublish = () => {
        if (!title.trim() || !content.trim()) return;
        onCreate(title.trim(), content.trim());
        setTitle("");
        setContent("");
    };

    return (
        <div className="space-y-4">
            <RoleGate allow={["member", "moderator", "owner"]}>
                <Card title="Start a Discussion">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Discussion topic..."
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <textarea
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            placeholder="Share your thoughts..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                        <div className="flex justify-end">
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handlePublish}
                                disabled={!title.trim() || !content.trim()}
                            >
                                Start Discussion
                            </button>
                        </div>
                    </div>
                </Card>
            </RoleGate>

            {discussions.map(discussion => {
                const timeAgo = since(discussion.createdAtISO);
                const exactTime = new Date(discussion.createdAtISO).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return (
                    <Card key={discussion.id} className="hover:shadow-lg transition-shadow">
                        <div className="space-y-4">
                            {/* Discussion Header */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">{discussion.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        💬 Discussion
                                    </span>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">{discussion.authorName}</div>
                                        <div className="text-xs text-gray-400" title={exactTime}>
                                            {timeAgo}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Discussion Content */}
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{discussion.content}</p>

                            {/* Discussion Actions */}
                            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {discussion.likes || 0}
                                </button>
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {discussion.comments || 0}
                                </button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default Discussions;