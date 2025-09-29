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
    const [as, setAs] = useState<"discussion" | "announcement" | "post" | "poll" | "review" | "annotation">("discussion");
    
    // Type-specific state
    const [rating, setRating] = useState(5);
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    const [bookId, setBookId] = useState("");
    const [page, setPage] = useState("");
    const [chapter, setChapter] = useState("");
    const [quote, setQuote] = useState("");

    const postTypes = [
        { value: "discussion", label: "Discussion", placeholder: "Start a discussion...", titlePlaceholder: "Discussion topic..." },
        { value: "announcement", label: "Announcement", placeholder: "Write an announcement...", titlePlaceholder: "Announcement title..." },
        { value: "post", label: "Share Post", placeholder: "Share your thoughts...", titlePlaceholder: "Why are you sharing this?" },
        { value: "poll", label: "Poll", placeholder: "Ask the community...", titlePlaceholder: "Poll question..." },
        { value: "review", label: "Review", placeholder: "Share your review...", titlePlaceholder: "Book or topic..." },
        { value: "annotation", label: "Annotation", placeholder: "Share a quote or note...", titlePlaceholder: "Chapter or page reference..." },
    ] as const;

    const handlePublish = () => {
        if (!title.trim() || !text.trim()) return;
        
        let typeData: ReviewTypeData | PollCreationTypeData | AnnotationTypeData | PostSharingTypeData | undefined = undefined;
        
        // Build type-specific data
        switch (as) {
            case "review": {
                if (bookId) {
                    typeData = {
                        book_id: parseInt(bookId),
                        rating: rating
                    };
                }
                break;
            }
            case "poll": {
                const validOptions = pollOptions.filter(opt => opt.trim());
                if (validOptions.length >= 2) {
                    typeData = {
                        question: title.trim(),
                        options: validOptions.map(text => ({ text: text.trim() })),
                        allow_multiple: allowMultiple,
                        ...(expiresAt && { expires_at: expiresAt })
                    };
                }
                break;
            }
            case "annotation": {
                if (bookId) {
                    typeData = {
                        book_id: parseInt(bookId),
                        ...(page && { page: parseInt(page) }),
                        ...(chapter && { chapter: parseInt(chapter) }),
                        ...(quote && { quote: quote.trim() })
                    };
                }
                break;
            }
        }
        
        onCreate(title.trim(), text.trim(), as, typeData);
        
        // Reset form
        setText("");
        setTitle("");
        setRating(5);
        setPollOptions(["", ""]);
        setAllowMultiple(false);
        setExpiresAt("");
        setBookId("");
        setPage("");
        setChapter("");
        setQuote("");
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
                        
                        {as === "review" && (
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={bookId}
                                        onChange={(e) => setBookId(e.target.value)}
                                        placeholder="Book ID"
                                        className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Rating:</span>
                                        <select
                                            value={rating}
                                            onChange={(e) => setRating(parseInt(e.target.value))}
                                            className="rounded-lg border border-gray-300 p-2 text-sm"
                                        >
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num} ⭐</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {as === "annotation" && (
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={bookId}
                                        onChange={(e) => setBookId(e.target.value)}
                                        placeholder="Book ID"
                                        className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={page}
                                        onChange={(e) => setPage(e.target.value)}
                                        placeholder="Page"
                                        className="w-20 rounded-lg border border-gray-300 p-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={chapter}
                                        onChange={(e) => setChapter(e.target.value)}
                                        placeholder="Chapter"
                                        className="w-24 rounded-lg border border-gray-300 p-2 text-sm"
                                    />
                                </div>
                                <textarea
                                    value={quote}
                                    onChange={(e) => setQuote(e.target.value)}
                                    placeholder="Quote or note..."
                                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                    rows={2}
                                />
                            </div>
                        )}
                        
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