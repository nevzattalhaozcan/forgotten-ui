import { api } from "./api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
}

export type PostApi = {
  id: number | string;
  club_id: number | string;
  type: "discussion" | "announcement" | "event" | "poll" | "review" | "annotation";
  content: string;
  title?: string;
  created_at?: string;
  user_id?: number | string;
  user?: { id: string | number; username?: string; email?: string; first_name?: string; last_name?: string };
};

export async function listPosts(): Promise<PostApi[]> {
  const res = await api<PostApi[] | { posts: PostApi[] }>("/api/v1/posts");
  return Array.isArray(res) ? res : (res.posts ?? []);
}

export async function createPost(data: {
    club_id: string | number;
    content: string;
    type: string;
    title?: string;
}) {
    console.log("createPost - Received data:", data);
    
    // Ensure club_id is a number as the backend expects
    const club_id = typeof data.club_id === 'string' ? parseInt(data.club_id, 10) : data.club_id;
    
    if (isNaN(club_id)) {
        throw new Error("Invalid club_id: must be a valid number");
    }
    
    const requestBody = {
        title: data.title || `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Post`,
        content: data.content,
        type: data.type,
        club_id: club_id
    };
    
    console.log("createPost - Sending request body:", requestBody);
    
    const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(requestBody)
    });

    console.log("createPost - Response status:", response.status);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("createPost - Error response:", errorText);
        throw new Error(`Failed to create post: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log("createPost - Success response:", result);
    return result;
}

export async function listPublicPosts(): Promise<PostApi[]> {
  const res = await api<PostApi[] | { posts: PostApi[] }>("/api/v1/posts/public", {}, { auth: false });
  return Array.isArray(res) ? res : (res.posts ?? []);
}

export async function listPopularPosts(): Promise<PostApi[]> {
  const res = await api<PostApi[] | { posts: PostApi[] }>("/api/v1/posts/popular", {}, { auth: false });
  return Array.isArray(res) ? res : (res.posts ?? []);
}
