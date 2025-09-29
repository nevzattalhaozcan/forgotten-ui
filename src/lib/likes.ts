import { api } from "./api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
}

export type LikeApi = {
    id: number | string;
    post_id: number | string;
    user_id: number | string;
    created_at: string;
};

export async function likePost(postId: string | number): Promise<LikeApi> {
    const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to like post: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function unlikePost(postId: string | number): Promise<void> {
    const response = await fetch(`/api/v1/posts/${postId}/unlike`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to unlike post: ${response.status} ${response.statusText} - ${errorText}`);
    }
}

export async function getPostLikes(postId: string | number): Promise<number> {
    const res = await api<{ count: number } | { likes: LikeApi[] }>(`/api/v1/posts/${postId}/likes`);
    
    if ('count' in res) {
        return res.count;
    } else if ('likes' in res) {
        return res.likes.length;
    }
    
    return 0;
}