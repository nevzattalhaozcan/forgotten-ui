import React, { useState } from "react";
import Card from "../common/Card";
import { type Post } from "../../data/clubDetail";
import RoleGate from "./RoleGate";
import type { ReviewTypeData, AnnotationTypeData, PostSharingTypeData } from "../../lib/posts";

// Type for creating polls (without id and votes)
interface PollCreationTypeData {
  question: string;
  options: { text: string }[];
  allow_multiple: boolean;
  expires_at?: string;
}

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

interface Props {
    posts: Post[];
    onLike: (id: string | number) => void;
    onComment: (id: string | number) => void;
    onCreate: (title: string, content: string, type: "discussion" | "announcement" | "post" | "poll" | "review" | "annotation", typeData?: ReviewTypeData | PollCreationTypeData | AnnotationTypeData | PostSharingTypeData) => void;
}

const Feed: React.FC<Props> = ({ posts, onCreate, onLike, onComment }) => {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [as, setAs] = useState<"announcement" | "post" | "poll">("announcement");
    
    // Poll-specific state
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");

    // Only show feed-appropriate post types
    const feedPostTypes = [
        { 
            value: "announcement", 
            label: "📢 Announcement", 
            placeholder: "Share important news with the club...", 
            titlePlaceholder: "What's the announcement about?",
            description: "Important updates for all members"
        },
        { 
            value: "post", 
            label: "💭 Share Post", 
            placeholder: "Share your thoughts with the community...", 
            titlePlaceholder: "What's on your mind?",
            description: "General thoughts and updates"
        },
        { 
            value: "poll", 
            label: "📊 Create Poll", 
            placeholder: "Ask the community a question...", 
            titlePlaceholder: "What would you like to ask?",
            description: "Get community input on decisions"
        }
    ] as const;

    const handlePublish = () => {
        if (!title.trim() || !text.trim()) return;
        
        let typeData: ReviewTypeData | PollCreationTypeData | AnnotationTypeData | PostSharingTypeData | undefined = undefined;
        
        // Build type-specific data for polls only
        if (as === "poll") {
            const validOptions = pollOptions.filter(opt => opt.trim());
            if (validOptions.length >= 2) {
                typeData = {
                    question: title.trim(),
                    options: validOptions.map(text => ({ text: text.trim() })),
                    allow_multiple: allowMultiple,
                    ...(expiresAt && { expires_at: expiresAt })
                };
            }
        }
        
        onCreate(title.trim(), text.trim(), as, typeData);
        
        // Reset form
        setText("");
        setTitle("");
        setPollOptions(["", ""]);
        setAllowMultiple(false);
        setExpiresAt("");
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
                            placeholder={feedPostTypes.find(t => t.value === as)?.titlePlaceholder || "Title..."}
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                        <textarea
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            placeholder={feedPostTypes.find(t => t.value === as)?.placeholder || "Write something..."}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        
                        {/* Type-specific form fields */}
                        {as === "poll" && (
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium text-gray-700">Poll Options</div>
                                {pollOptions.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...pollOptions];
                                                newOptions[index] = e.target.value;
                                                setPollOptions(newOptions);
                                            }}
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                                        />
                                        {pollOptions.length > 2 && (
                                            <button
                                                onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                                                className="text-red-500 hover:text-red-700 px-2"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => setPollOptions([...pollOptions, ""])}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        + Add Option
                                    </button>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={allowMultiple}
                                            onChange={(e) => setAllowMultiple(e.target.checked)}
                                        />
                                        Allow multiple choices
                                    </label>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                    placeholder="Poll expiration (optional)"
                                />
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-3">
                                {feedPostTypes.map(type => (
                                    <label 
                                        key={type.value} 
                                        className={`relative flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 ${
                                            as === type.value 
                                                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="postType"
                                            value={type.value}
                                            checked={as === type.value} 
                                            onChange={() => setAs(type.value)} 
                                            className="sr-only"
                                        />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${
                                                as === type.value ? 'text-blue-700' : 'text-gray-900'
                                            }`}>
                                                {type.label}
                                            </span>
                                            <span className={`text-xs ${
                                                as === type.value ? 'text-blue-600' : 'text-gray-500'
                                            }`}>
                                                {type.description}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <button 
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                onClick={handlePublish}
                                disabled={!title.trim() || !text.trim()}
                            >
                                Publish
                            </button>
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
                                <button 
                                    onClick={() => onLike?.(p.id)}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {p.likes || 0}
                                </button>
                                <button 
                                    onClick={() => {
                                        const comment = prompt("Add a comment:");
                                        if (comment) onComment?.(p.id);
                                    }}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                                >
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