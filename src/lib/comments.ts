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
    created_at: string;
    user?: {
        id: number | string;
        username?: string;
        first_name?: string;
        last_name?: string;
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

export async function deleteComment(postId: string | number, commentId: string | number): Promise<void> {
    const response = await fetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
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