import React, { useState } from "react";
import Card from "../common/Card";
import { type Post } from "../../data/clubDetail";
import RoleGate from "./RoleGate";
import type { ReviewTypeData, AnnotationTypeData, PostSharingTypeData } from "../../lib/posts";
import type { CommentApi } from "../../lib/comments";

// Type for creating polls (without id and votes)
interface PollCreationTypeData {
  question: string;
  options: { text: string }[];
  allow_multiple: boolean;
  expires_at?: string;
}

// Extended Post type for enhanced functionality
interface EnhancedPost extends Post {
    pollData?: {
        question: string;
        options: { id: string; text: string; votes: number }[];
        totalVotes: number;
        userVote?: string[];
        allowMultiple: boolean;
        expiresAt?: string;
    };
    reviewData?: {
        rating: number;
        bookTitle?: string;
    };
    annotationData?: {
        bookTitle?: string;
        bookAuthor?: string;
        page?: number;
        chapter?: number;
        quote?: string;
    };
    shareData?: {
        originalPostId?: number;
        originalPostTitle?: string;
        originalPostContent?: string;
    };
    commentsData?: CommentApi[]; // Actual comment data
    attachments?: {
        type: "image" | "file";
        url: string;
        name: string;
    }[];
    isLikedByUser?: boolean;
    isBookmarked?: boolean;
}

function since(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.round(ms / 36e5); if (h < 24) return `${h}h ago`;
    const d = Math.round(h / 24); if (d < 30) return `${d}d ago`;
    const m = Math.round(d / 30); return `${m}m ago`;
}

function getPostTypeInfo(type: string) {
    const typeMap = {
        discussion: { emoji: "💬", color: "bg-blue-100 text-blue-800", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        announcement: { emoji: "📢", color: "bg-red-100 text-red-800", bgColor: "bg-red-50", borderColor: "border-red-200" },
        event: { emoji: "📅", color: "bg-green-100 text-green-800", bgColor: "bg-green-50", borderColor: "border-green-200" },
        poll: { emoji: "📊", color: "bg-purple-100 text-purple-800", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        review: { emoji: "⭐", color: "bg-yellow-100 text-yellow-800", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
        annotation: { emoji: "📝", color: "bg-indigo-100 text-indigo-800", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
        post: { emoji: "💭", color: "bg-gray-100 text-gray-800", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
    };
    return typeMap[type as keyof typeof typeMap] || { emoji: "💬", color: "bg-gray-100 text-gray-800", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
}

interface Props {
    posts: EnhancedPost[];
    onLike: (id: string | number) => void;
    onCommentsLoad?: (postId: string | number) => Promise<void>;
    onCommentCreate?: (postId: string | number, content: string) => Promise<void>;
    onCommentDelete?: (postId: string | number, commentId: string | number) => Promise<void>;
    onCommentLike?: (commentId: string | number) => Promise<void>;
    onBookmark?: (id: string | number) => void;
    onPollVote?: (postId: string | number, optionIds: string[]) => void;
    onCreate: (title: string, content: string, type: "discussion" | "announcement" | "post" | "poll" | "review" | "annotation", typeData?: ReviewTypeData | PollCreationTypeData | AnnotationTypeData | PostSharingTypeData) => void;
    userRole?: "member" | "moderator" | "owner";
    filterType?: "discussion" | "review" | null;
}

const Feed: React.FC<Props> = ({ posts, onCreate, onLike, onCommentsLoad, onCommentCreate, onCommentDelete, onCommentLike, onBookmark, onPollVote, filterType }) => {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [as, setAs] = useState<"announcement" | "post" | "poll" | "discussion" | "review">("post");
    
    // Poll-specific state
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    
    // Review-specific state  
    const [rating, setRating] = useState(0);
    const [bookTitle, setBookTitle] = useState("");
    
    // UI state
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
    const [isShareFormOpen, setIsShareFormOpen] = useState(false);
    
    // Comment state
    const [showCommentsFor, setShowCommentsFor] = useState<Set<string>>(new Set());
    const [newComments, setNewComments] = useState<Record<string, string>>({});
    const [commentLoading, setCommentLoading] = useState<Set<string>>(new Set());

    // Filter posts based on type if specified
    const filteredPosts = filterType 
        ? posts.filter(post => post.type === filterType)
        : posts;

    // Define post types based on context
    const getAvailablePostTypes = () => {
        if (filterType === "discussion") {
            return [{ 
                value: "discussion", 
                label: "💬 Discussion", 
                placeholder: "Share your thoughts and start a discussion...", 
                titlePlaceholder: "What would you like to discuss?",
                description: "Start a conversation with the community"
            }];
        }
        
        if (filterType === "review") {
            return [{ 
                value: "review", 
                label: "⭐ Book Review", 
                placeholder: "Share your thoughts about this book...", 
                titlePlaceholder: "Which book are you reviewing?",
                description: "Rate and review a book"
            }];
        }

        // Default feed types
        return [
            { 
                value: "post", 
                label: "💭 Post", 
                placeholder: "Share your thoughts...", 
                titlePlaceholder: "What's on your mind?",
                description: "General thoughts and updates"
            },
            { 
                value: "announcement", 
                label: "📢 Announcement", 
                placeholder: "Share important news with the club...", 
                titlePlaceholder: "What's the announcement about?",
                description: "Important updates for all members"
            },
            { 
                value: "poll", 
                label: "� Create Poll", 
                placeholder: "Ask the community a question...", 
                titlePlaceholder: "What would you like to ask?",
                description: "Get community input on decisions"
            }
        ] as const;
    };

    const availablePostTypes = getAvailablePostTypes();

    // Set default post type based on filter
    React.useEffect(() => {
        if (filterType && availablePostTypes.length > 0) {
            const firstType = availablePostTypes[0].value;
            setAs(firstType as "announcement" | "post" | "poll" | "discussion" | "review");
        }
    }, [filterType, availablePostTypes]);

    const handlePublish = () => {
        if (!title.trim() || !text.trim()) return;
        
        let typeData: ReviewTypeData | PollCreationTypeData | AnnotationTypeData | PostSharingTypeData | undefined = undefined;
        
        // Build type-specific data
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
        } else if (as === "review") {
            typeData = {
                rating,
                book_title: bookTitle || undefined
            } as ReviewTypeData;
        }
        
        onCreate(title.trim(), text.trim(), as, typeData);
        
        // Reset form and close the share section
        setText("");
        setTitle("");
        setPollOptions(["", ""]);
        setAllowMultiple(false);
        setExpiresAt("");
        setRating(0);
        setBookTitle("");
        setIsShareFormOpen(false);
    };

    // Comment handlers
    const handleCommentSubmit = async (postId: string) => {
        const content = newComments[postId]?.trim();
        if (!content || !onCommentCreate) return;
        
        setCommentLoading(prev => new Set([...prev, postId]));
        try {
            await onCommentCreate(postId, content);
            setNewComments(prev => ({ ...prev, [postId]: "" }));
        } catch (error) {
            console.error("Failed to create comment:", error);
        } finally {
            setCommentLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    const handleCommentDelete = async (postId: string, commentId: string) => {
        if (!onCommentDelete) return;
        try {
            await onCommentDelete(postId, commentId);
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    const handleCommentLike = async (commentId: string) => {
        if (!onCommentLike) return;
        try {
            await onCommentLike(commentId);
        } catch (error) {
            console.error("Failed to like comment:", error);
        }
    };

    const toggleComments = async (postId: string) => {
        setShowCommentsFor(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
                // Load comments when showing them for the first time
                if (onCommentsLoad) {
                    onCommentsLoad(postId).catch(error => {
                        console.error("Failed to load comments:", error);
                    });
                }
            }
            return newSet;
        });
    };

    const toggleExpanded = (postId: string) => {
        const newExpanded = new Set(expandedPosts);
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId);
        } else {
            newExpanded.add(postId);
        }
        setExpandedPosts(newExpanded);
    };

    const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`text-lg ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        onClick={() => interactive && onRatingChange?.(star)}
                        disabled={!interactive}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    const renderPoll = (post: EnhancedPost) => {
        if (!post.pollData) return null;
        
        const { question, options, totalVotes, userVote, allowMultiple, expiresAt } = post.pollData;
        const isExpired = expiresAt && new Date(expiresAt) < new Date();
        const hasVoted = userVote && userVote.length > 0;
        
        return (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="space-y-3">
                    <h4 className="font-medium text-purple-900">{question}</h4>
                    <div className="space-y-2">
                        {options.map(option => {
                            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                            const isSelected = userVote?.includes(option.id);
                            
                            return (
                                <div key={option.id} className="space-y-1">
                                    <button
                                        onClick={() => {
                                            if (!isExpired && onPollVote) {
                                                if (allowMultiple) {
                                                    const currentVotes = userVote || [];
                                                    const newVotes = isSelected 
                                                        ? currentVotes.filter(id => id !== option.id)
                                                        : [...currentVotes, option.id];
                                                    onPollVote(post.id, newVotes);
                                                } else {
                                                    // For single choice, allow revoting by selecting different option
                                                    // or unvoting by clicking the same option again
                                                    if (isSelected) {
                                                        // Unvote by passing empty array
                                                        onPollVote(post.id, []);
                                                    } else {
                                                        onPollVote(post.id, [option.id]);
                                                    }
                                                }
                                            }
                                        }}
                                        disabled={Boolean(isExpired)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                            isSelected 
                                                ? 'border-purple-500 bg-purple-100' 
                                                : isExpired
                                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">{option.text}</span>
                                            <span className="text-xs text-gray-500">{option.votes} votes</span>
                                        </div>
                                        {(hasVoted || isExpired) && (
                                            <div className="mt-2 bg-gray-200 rounded-full h-1">
                                                <div 
                                                    className="bg-purple-500 h-1 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-between text-xs text-purple-600">
                        <span>{totalVotes} total votes</span>
                        {allowMultiple && <span>Multiple choices allowed</span>}
                        {expiresAt && (
                            <span className={isExpired ? "text-red-600" : ""}>
                                {isExpired ? "Expired" : `Expires ${since(expiresAt)}`}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4" data-testid="feed-component">
            <RoleGate allow={["member", "moderator", "owner"]}>
                <Card data-testid="share-to-feed-card">
                    {/* Collapsible Header */}
                    <div 
                        className="cursor-pointer select-none"
                        onClick={() => setIsShareFormOpen(!isShareFormOpen)}
                        data-testid="share-form-toggle"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {filterType === "discussion" ? "Start a Discussion" : filterType === "review" ? "Write a Review" : "Share to feed"}
                                </h3>
                                {!isShareFormOpen && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Click here to {filterType === "discussion" ? "start a discussion" : filterType === "review" ? "write a review" : "share your thoughts"}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <svg 
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isShareFormOpen ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Collapsible Form Content */}
                    {isShareFormOpen && (
                        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4" data-testid="share-form-content">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={availablePostTypes.find(t => t.value === as)?.titlePlaceholder || "Title..."}
                                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                data-testid="post-title-input"
                            />
                            
                            {as === "review" && (
                                <div className="space-y-3 p-3 bg-yellow-50 rounded-lg">
                                    <input
                                        type="text"
                                        value={bookTitle}
                                        onChange={(e) => setBookTitle(e.target.value)}
                                        placeholder="Book title (optional)..."
                                        className="w-full rounded-lg border border-yellow-300 p-2 text-sm"
                                        data-testid="review-book-title-input"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-yellow-700">Rating:</span>
                                        {renderStars(rating, true, setRating)}
                                    </div>
                                </div>
                            )}
                            
                            <textarea
                                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                placeholder={availablePostTypes.find(t => t.value === as)?.placeholder || "Write something..."}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={4}
                                data-testid="post-content-input"
                            />
                            
                            {/* Type-specific form fields */}
                            {as === "poll" && (
                                <div className="space-y-3 p-3 bg-purple-50 rounded-lg" data-testid="poll-form">
                                    <div className="text-sm font-medium text-purple-700">Poll Options</div>
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
                                                className="flex-1 rounded-lg border border-purple-300 p-2 text-sm"
                                                data-testid={`poll-option-${index}`}
                                            />
                                            {pollOptions.length > 2 && (
                                                <button
                                                    onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                                                    className="text-red-500 hover:text-red-700 px-2"
                                                    data-testid={`remove-poll-option-${index}`}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => setPollOptions([...pollOptions, ""])}
                                            className="text-sm text-purple-600 hover:text-purple-800"
                                            data-testid="add-poll-option"
                                        >
                                            + Add Option
                                        </button>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={allowMultiple}
                                                onChange={(e) => setAllowMultiple(e.target.checked)}
                                                data-testid="poll-allow-multiple"
                                            />
                                            Allow multiple choices
                                        </label>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="w-full rounded-lg border border-purple-300 p-2 text-sm"
                                        placeholder="Poll expiration (optional)"
                                        data-testid="poll-expires-at"
                                    />
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                                {!filterType && (
                                    <div className="flex flex-wrap gap-2" data-testid="post-type-selector">
                                        {availablePostTypes.map(type => (
                                            <label 
                                                key={type.value} 
                                                className={`relative flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 transition-all duration-200 ${
                                                    as === type.value 
                                                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                                data-testid={`post-type-${type.value}`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="postType"
                                                    value={type.value}
                                                    checked={as === type.value} 
                                                    onChange={() => setAs(type.value as "announcement" | "post" | "poll" | "discussion" | "review")} 
                                                    className="sr-only"
                                                />
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-medium ${
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
                                )}
                                <button 
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    onClick={handlePublish}
                                    disabled={!title.trim() || !text.trim()}
                                    data-testid="publish-post-button"
                                >
                                    {filterType === "discussion" ? "Start Discussion" : filterType === "review" ? "Publish Review" : "Publish"}
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </RoleGate>

            {filteredPosts.map(post => {
                const typeInfo = getPostTypeInfo(post.type);
                const timeAgo = since(post.createdAtISO);
                const exactTime = new Date(post.createdAtISO).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const isExpanded = expandedPosts.has(String(post.id));
                const shouldTruncate = post.content.length > 300;
                const displayContent = shouldTruncate && !isExpanded 
                    ? post.content.slice(0, 300) + "..."
                    : post.content;

                return (
                    <Card 
                        key={post.id} 
                        className={`hover:shadow-lg transition-shadow ${typeInfo.borderColor} border-l-4`}
                        data-testid={`post-card-${post.id}`}
                    >
                        <div className="space-y-4">
                            {/* Enhanced Post Header */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {post.title && (
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`post-title-${post.id}`}>
                                                {post.title}
                                            </h3>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                                {typeInfo.emoji} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                                            </span>
                                            {post.reviewData?.rating && (
                                                <div className="flex items-center gap-1">
                                                    {renderStars(post.reviewData.rating)}
                                                    <span className="text-xs text-gray-500">({post.reviewData.rating}/5)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-700" data-testid={`post-author-${post.id}`}>{post.authorName}</div>
                                        <div className="text-xs text-gray-400" title={exactTime} data-testid={`post-time-${post.id}`}>
                                            {timeAgo}
                                        </div>
                                    </div>
                                </div>
                                
                                {post.reviewData?.bookTitle && (
                                    <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                                        📚 {post.reviewData.bookTitle}
                                    </div>
                                )}
                                
                                {post.annotationData && (
                                    <div className="text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">📖 {post.annotationData.bookTitle}</span>
                                            {post.annotationData.bookAuthor && (
                                                <span className="text-indigo-600">by {post.annotationData.bookAuthor}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-3 text-xs text-indigo-600">
                                            {post.annotationData.page && <span>Page {post.annotationData.page}</span>}
                                            {post.annotationData.chapter && <span>Chapter {post.annotationData.chapter}</span>}
                                        </div>
                                        {post.annotationData.quote && (
                                            <blockquote className="mt-2 pl-3 border-l-2 border-indigo-300 italic text-indigo-800">
                                                "{post.annotationData.quote}"
                                            </blockquote>
                                        )}
                                    </div>
                                )}
                                
                                {post.shareData && (
                                    <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-gray-500">🔗 Sharing:</span>
                                            <span className="font-medium">{post.shareData.originalPostTitle}</span>
                                        </div>
                                        {post.shareData.originalPostContent && (
                                            <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                                                {post.shareData.originalPostContent}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Post Content */}
                            <div className={`${typeInfo.bgColor} p-3 rounded-lg`}>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed" data-testid={`post-content-${post.id}`}>
                                    {displayContent}
                                </p>
                                
                                {shouldTruncate && (
                                    <button
                                        onClick={() => toggleExpanded(String(post.id))}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                                        data-testid={`post-expand-${post.id}`}
                                    >
                                        {isExpanded ? "Show less" : "Show more"}
                                    </button>
                                )}
                            </div>
                            
                            {/* Render Poll if applicable */}
                            {post.type === "poll" && renderPoll(post)}

                            {/* Enhanced Post Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => onLike?.(post.id)}
                                        className={`flex items-center gap-1 text-sm transition-colors ${
                                            post.isLikedByUser 
                                                ? 'text-red-500' 
                                                : 'text-gray-500 hover:text-red-500'
                                        }`}
                                        data-testid={`post-like-${post.id}`}
                                    >
                                        <svg className={`w-4 h-4 ${post.isLikedByUser ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        {post.likes || 0}
                                    </button>
                                    <button 
                                        onClick={() => toggleComments(String(post.id))}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                                        data-testid={`post-comment-${post.id}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        {post.comments || 0}
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {onBookmark && (
                                        <button 
                                            onClick={() => onBookmark(post.id)}
                                            className={`p-1 rounded transition-colors ${
                                                post.isBookmarked 
                                                    ? 'text-yellow-500' 
                                                    : 'text-gray-400 hover:text-yellow-500'
                                            }`}
                                            data-testid={`post-bookmark-${post.id}`}
                                        >
                                            <svg className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Comments Section */}
                            {showCommentsFor.has(String(post.id)) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {/* Existing Comments */}
                                    {post.commentsData && post.commentsData.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            {post.commentsData.map(comment => (
                                                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {comment.user?.first_name && comment.user?.last_name 
                                                                        ? `${comment.user.first_name} ${comment.user.last_name}`
                                                                        : comment.user?.username || "Member"}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {since(comment.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-800">{comment.content}</p>
                                                            
                                                            {/* Comment Actions */}
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <button
                                                                    onClick={() => handleCommentLike(String(comment.id))}
                                                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                                                        comment.user_liked 
                                                                            ? 'text-red-500' 
                                                                            : 'text-gray-500 hover:text-red-500'
                                                                    }`}
                                                                >
                                                                    <svg className={`w-3 h-3 ${comment.user_liked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                    </svg>
                                                                    {comment.likes_count || 0}
                                                                </button>
                                                                
                                                                {/* Delete button for own comments */}
                                                                {comment.user_id && localStorage.getItem("userId") === String(comment.user_id) && (
                                                                    <button
                                                                        onClick={() => handleCommentDelete(String(post.id), String(comment.id))}
                                                                        className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Add Comment Form */}
                                    <div className="flex gap-2">
                                        <textarea
                                            value={newComments[String(post.id)] || ""}
                                            onChange={(e) => setNewComments(prev => ({ ...prev, [String(post.id)]: e.target.value }))}
                                            placeholder="Write a comment..."
                                            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={2}
                                        />
                                        <button
                                            onClick={() => handleCommentSubmit(String(post.id))}
                                            disabled={!newComments[String(post.id)]?.trim() || commentLoading.has(String(post.id))}
                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            {commentLoading.has(String(post.id)) ? "..." : "Post"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
            
            {filteredPosts.length === 0 && (
                <Card className="text-center py-8" data-testid="no-posts-placeholder">
                    <div className="text-gray-500">
                        <div className="text-4xl mb-2">📝</div>
                        <p>No {filterType ? `${filterType}s` : 'posts'} yet.</p>
                        <p className="text-sm mt-2">Be the first to share something!</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Feed;