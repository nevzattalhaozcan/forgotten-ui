import { api } from "./api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
}

export type PostApi = {
  id: number | string;
  club_id: number | string;
  type: "discussion" | "announcement" | "post" | "poll" | "review" | "annotation";
  title: string;
  content: string;
  type_data?: ReviewTypeData | PollTypeData | AnnotationTypeData | PostSharingTypeData;
  is_pinned?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  user_voted?: boolean; // For polls
  user_votes?: string[]; // For polls - array of option IDs
  created_at?: string;
  updated_at?: string;
  user_id?: number | string;
  user?: { id: string | number; username?: string; email?: string; first_name?: string; last_name?: string };
};

// Type-specific data interfaces
export interface ReviewTypeData {
  book_id: number;
  rating: number;
  book_title?: string;
  book_author?: string;
}

export interface PollTypeData {
  question: string;
  options: PollOption[];
  allow_multiple: boolean;
  expires_at?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface AnnotationTypeData {
  book_id: number;
  page?: number;
  chapter?: number;
  quote?: string;
  book_title?: string;
  book_author?: string;
}

export interface PostSharingTypeData {
  post_id?: number;
  post_title?: string;
  post_content?: string;
}

export async function listPosts(filters?: {
    club_id?: string | number;
    type?: string;
    limit?: number;
}): Promise<PostApi[]> {
    let url = "/api/v1/posts";
    const params = new URLSearchParams();
    
    if (filters?.club_id) {
        params.append("club_id", filters.club_id.toString());
    }
    if (filters?.type) {
        params.append("type", filters.type);
    }
    if (filters?.limit) {
        params.append("limit", filters.limit.toString());
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const res = await api<PostApi[] | { posts: PostApi[] }>(url);
    return Array.isArray(res) ? res : (res.posts ?? []);
}

export async function listClubPosts(clubId: string | number, type?: string): Promise<PostApi[]> {
    return listPosts({ club_id: clubId, type });
}

export async function listDiscussions(clubId: string | number): Promise<PostApi[]> {
    return listPosts({ club_id: clubId, type: "discussion" });
}

export async function listReviews(clubId: string | number): Promise<PostApi[]> {
    return listPosts({ club_id: clubId, type: "review" });
}

export async function voteOnPoll(postId: string | number, optionIds: string[]): Promise<void> {
    const response = await fetch(`/api/v1/posts/${postId}/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ option_ids: optionIds })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to vote on poll: ${response.status} ${response.statusText} - ${errorText}`);
    }
}

export async function createPost(data: {
    club_id: string | number;
    title: string;
    content: string;
    type: string;
    type_data?: ReviewTypeData | PollTypeData | AnnotationTypeData | PostSharingTypeData;
}) {
    console.log("createPost - Received data:", data);
    
    // Ensure club_id is a number as the backend expects
    const club_id = typeof data.club_id === 'string' ? parseInt(data.club_id, 10) : data.club_id;
    
    if (isNaN(club_id)) {
        throw new Error("Invalid club_id: must be a valid number");
    }
    
    const requestBody = {
        title: data.title,
        content: data.content,
        type: data.type,
        club_id: club_id,
        ...(data.type_data && { type_data: data.type_data })
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
