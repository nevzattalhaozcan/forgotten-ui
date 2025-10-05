import { api } from "./api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
}

export type CommentApi = {
    id: number | string;
    post_id: number | string;
    user_id: number | string;
    content: string;
    likes_count: number;
    created_at: string;
    updated_at: string;
    user_liked?: boolean;
    likes?: CommentLike[];
    user: {
        id: number | string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        role: string;
        avatar_url: string | null;
        location: string | null;
        favorite_genres: string[] | null;
        bio: string | null;
        reading_goal: number;
        books_read: number;
        badges: unknown;
        is_online: boolean;
        last_seen: string | null;
        created_at: string;
        updated_at: string;
    };
};

export type CommentLike = {
    id: number | string;
    comment_id: number | string;
    user_id: number | string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number | string;
        username?: string;
        first_name?: string;
        last_name?: string;
    };
    comment?: {
        id: number | string;
        post_id: number | string;
        user_id: number | string;
        content: string;
        likes_count: number;
        user: {
            id: number | string;
            username: string;
            email: string;
            first_name: string;
            last_name: string;
            is_active: boolean;
            role: string;
            avatar_url: string | null;
            location: string | null;
            favorite_genres: string[] | null;
            bio: string | null;
            reading_goal: number;
            books_read: number;
            badges: unknown;
            is_online: boolean;
            last_seen: string | null;
            created_at: string;
            updated_at: string;
        };
        created_at: string;
        updated_at: string;
    };
};

export async function listPostComments(postId: string | number): Promise<CommentApi[]> {
    const res = await api<CommentApi[] | { comments: CommentApi[] }>(`/api/v1/posts/${postId}/comments`);
    return Array.isArray(res) ? res : (res.comments ?? []);
}

export async function createComment(postId: string | number, content: string): Promise<CommentApi> {
    const response = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create comment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function updateComment(commentId: string | number, content: string): Promise<CommentApi> {
    const response = await fetch(`/api/v1/comments/${commentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update comment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function deleteComment(commentId: string | number): Promise<void> {
    const response = await fetch(`/api/v1/comments/${commentId}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete comment: ${response.status} ${response.statusText} - ${errorText}`);
    }
}

export async function likeComment(commentId: string | number): Promise<CommentLike> {
    const response = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to like comment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function unlikeComment(commentId: string | number): Promise<void> {
    const response = await fetch(`/api/v1/comments/${commentId}/unlike`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to unlike comment: ${response.status} ${response.statusText} - ${errorText}`);
    }
}

export async function getCommentLikes(commentId: string | number): Promise<CommentLike[]> {
    const res = await api<CommentLike[] | { likes: CommentLike[] }>(`/api/v1/comments/${commentId}/likes`);
    return Array.isArray(res) ? res : (res.likes ?? []);
}

// Helper function to check if current user has liked a comment
export function isCommentLikedByUser(comment: CommentApi): boolean {
    // First check if API provides user_liked field directly
    if (comment.user_liked !== undefined) {
        return comment.user_liked;
    }
    
    // Fallback: check if current user is in the likes array
    const currentUserId = getCurrentUserId();
    if (!currentUserId || !comment.likes || !Array.isArray(comment.likes)) {
        return false;
    }
    
    return comment.likes.some(like => 
        String(like.user_id) === String(currentUserId)
    );
}

// Helper function to get current user ID
function getCurrentUserId(): string | null {
    // Get user ID from localStorage (set during login)
    const userId = localStorage.getItem("userId");
    if (userId) {
        return userId;
    }
    
    // Fallback: try to get from token if userId is not available
    try {
        const token = localStorage.getItem("token");
        if (token) {
            // If token is JWT, decode it to get user ID
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id || payload.id || payload.sub;
        }
    } catch (error) {
        console.warn("Failed to decode user ID from token:", error);
    }
    
    return null;
}