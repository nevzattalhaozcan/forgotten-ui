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

type Review = {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: "member" | "moderator" | "owner";
    title: string;
    content: string;
    rating?: number;
    createdAtISO: string;
    likes?: number;
    comments?: number;
};

type Props = {
    reviews: Review[];
    onCreate: (title: string, content: string, rating?: number) => void;
};

const Reviews: React.FC<Props> = ({ reviews, onCreate }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(0);

    const handlePublish = () => {
        if (!title.trim() || !content.trim()) return;
        onCreate(title.trim(), content.trim(), rating || undefined);
        setTitle("");
        setContent("");
        setRating(0);
    };

    return (
        <div className="space-y-4" data-testid="reviews-component">
            <RoleGate allow={["member", "moderator", "owner"]}>
                <Card title="Write a Review" data-testid="create-review-card">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Book title or review topic..."
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                            data-testid="review-title-input"
                        />
                        
                        <div className="flex items-center gap-2" data-testid="review-rating-selector">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <div className="flex items-center gap-1" data-testid="review-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`text-lg cursor-pointer hover:scale-110 transition-transform ${
                                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                        onClick={() => setRating(star)}
                                        data-testid={`review-star-${star}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <textarea
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                            placeholder="Share your review..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            data-testid="review-content-input"
                        />
                        <div className="flex justify-end">
                            <button 
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handlePublish}
                                disabled={!title.trim() || !content.trim()}
                                data-testid="publish-review-button"
                            >
                                Publish Review
                            </button>
                        </div>
                    </div>
                </Card>
            </RoleGate>

            {reviews.map(review => {
                const timeAgo = since(review.createdAtISO);
                const exactTime = new Date(review.createdAtISO).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return (
                    <Card key={review.id} className="hover:shadow-lg transition-shadow" data-testid={`review-card-${review.id}`}>
                        <div className="space-y-4">
                            {/* Review Header */}
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900" data-testid={`review-title-${review.id}`}>{review.title}</h3>
                                        {review.rating && (
                                            <div className="flex items-center gap-2 mt-1" data-testid={`review-rating-${review.id}`}>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span
                                                            key={star}
                                                            className={`text-lg cursor-default ${
                                                                star <= review.rating! ? 'text-yellow-400' : 'text-gray-300'
                                                            }`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">({review.rating}/5)</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500" data-testid={`review-author-${review.id}`}>{review.authorName}</div>
                                        <div className="text-xs text-gray-400" title={exactTime} data-testid={`review-time-${review.id}`}>
                                            {timeAgo}
                                        </div>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" data-testid={`review-badge-${review.id}`}>
                                    ⭐ Review
                                </span>
                            </div>

                            {/* Review Content */}
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed" data-testid={`review-content-${review.id}`}>{review.content}</p>

                            {/* Review Actions */}
                            <div className="flex items-center gap-4 pt-2 border-t border-gray-100" data-testid={`review-actions-${review.id}`}>
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors" data-testid={`review-like-${review.id}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {review.likes || 0}
                                </button>
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors" data-testid={`review-comment-${review.id}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {review.comments || 0}
                                </button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default Reviews;