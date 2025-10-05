import { api } from "./api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
}

// Import comment types
import type { CommentApi } from './comments';

export type PostApi = {
  id: number | string;
  club_id: number | string;
  type: "discussion" | "announcement" | "post" | "poll" | "review" | "annotation";
  title: string;
  content?: string;
  type_data?: ReviewTypeData | PollTypeData | AnnotationTypeData | PostSharingTypeData;
  is_pinned?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  user_voted?: boolean; // For polls
  user_votes?: string[]; // For polls - array of option IDs
  user_liked?: boolean; // User's like status - if returned by API
  is_liked?: boolean; // Alternative field name
  likes?: LikeInfo[]; // Array of likes with user info
  comments?: CommentApi[]; // Comments for the post (if included in response)
  created_at?: string;
  updated_at?: string;
  user_id?: number | string;
  user?: { 
    id: string | number; 
    username?: string; 
    email?: string; 
    first_name?: string; 
    last_name?: string;
    avatar_url?: string | null;
  };
  club?: {
    id: number | string;
    name: string;
  };
};

// Post summary type for the new summaries endpoint
export type PostSummaryApi = {
  id: number | string;
  title: string;
  content: string;
  type: "discussion" | "announcement" | "post" | "poll" | "review" | "annotation";
  type_data?: string; // Base64 encoded type-specific data
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  has_user_liked?: boolean; // Whether current user has liked this post
  user_id: number | string;
  club_id: number | string;
  user: {
    id: number | string;
    username: string;
    avatar_url?: string | null;
  };
  club: {
    id: number | string;
    name: string;
  };
  created_at: string;
  updated_at: string;
};

// Like information returned with posts
export interface LikeInfo {
  id: number | string;
  user_id: number | string;
  post_id: number | string;
  created_at?: string;
  user?: {
    id: number | string;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

// Helper function to check if current user has liked a post
export function isPostLikedByUser(post: PostApi): boolean {
  // First check if API provides user_liked field directly
  if (post.user_liked !== undefined) {
    return post.user_liked;
  }
  if (post.is_liked !== undefined) {
    return post.is_liked;
  }
  
  // Fallback: check if current user is in the likes array
  const currentUserId = getCurrentUserId();
  if (!currentUserId || !post.likes || !Array.isArray(post.likes)) {
    return false;
  }
  
  return post.likes.some(like => 
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

// New function to get club post summaries using the new endpoint
export async function listClubPostSummaries(clubId: string | number): Promise<PostSummaryApi[]> {
    const res = await api<{ posts: PostSummaryApi[] }>(`/api/v1/clubs/${clubId}/posts/summaries`, {
        headers: getAuthHeaders()
    });
    return res.posts || [];
}

// Function to get comments for a specific post
export async function getPostComments(postId: string | number): Promise<CommentApi[]> {
    const res = await api<{ comments: CommentApi[] }>(`/api/v1/posts/${postId}/comments`, {
        headers: getAuthHeaders()
    });
    return res.comments || [];
}

// Post Like API Response Type
export interface PostLikeApi {
    id: number | string;
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
    };
    created_at: string;
}

// Function to get likes for a specific post
export async function getPostLikes(postId: string | number): Promise<PostLikeApi[]> {
    const res = await api<{ likes: PostLikeApi[] }>(`/api/v1/posts/${postId}/likes`, {
        headers: getAuthHeaders()
    });
    return res.likes || [];
}

// Helper function to check if current user has liked a post using the likes API
export async function checkPostLikedByUser(postId: string | number): Promise<boolean> {
    try {
        const likes = await getPostLikes(postId);
        const currentUserId = getCurrentUserId();
        
        if (!currentUserId) return false;
        
        return likes.some(like => String(like.user.id) === String(currentUserId));
    } catch (error) {
        console.error("Failed to check post like status:", error);
        return false;
    }
}

export async function listDiscussions(clubId: string | number): Promise<PostApi[]> {
    return listPosts({ club_id: clubId, type: "discussion" });
}

export async function listReviews(clubId: string | number): Promise<PostApi[]> {
    return listPosts({ club_id: clubId, type: "review" });
}

export async function voteOnPoll(postId: string | number, optionIds: string[]): Promise<void> {
    // TODO: Implement when poll voting endpoint is available
    console.warn(`voteOnPoll: No voting endpoint available for post ${postId}, options: ${optionIds.join(', ')}`);
    // Simulate successful vote for now
    return Promise.resolve();
}

export async function createPost(data: {
    club_id: string | number;
    title: string;
    content: string;
    type: string;
    type_data?: ReviewTypeData | PollTypeData | AnnotationTypeData | PostSharingTypeData;
}) {    
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
        
    const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("createPost - Error response:", errorText);
        throw new Error(`Failed to create post: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    return result;
}

export async function listPublicPosts(): Promise<PostApi[]> {
  // Use general posts endpoint since there's no public posts endpoint
  const res = await api<PostApi[] | { posts: PostApi[] }>("/api/v1/posts", {}, { auth: false });
  return Array.isArray(res) ? res : (res.posts ?? []);
}

export async function listPopularPosts(): Promise<PostApi[]> {
  // Use general posts endpoint since there's no popular posts endpoint
  const res = await api<PostApi[] | { posts: PostApi[] }>("/api/v1/posts", {}, { auth: false });
  return Array.isArray(res) ? res : (res.posts ?? []);
}
