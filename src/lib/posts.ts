import { api } from "./api";

export type PostApi = {
  id: number | string;
  club_id: number | string;
  type: "post" | "announcement";
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

export async function createPost(input: {
  club_id: string | number;
  content: string;
  type: "post" | "announcement";
  title?: string;
}): Promise<PostApi> {
  return api<PostApi>("/api/v1/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listPublicPosts(): Promise<PostApi[]> {
  const res = await api<PostApi[] | { posts: PostApi[] }>("/api/v1/posts/public", {}, { auth: false });
  return Array.isArray(res) ? res : (res.posts ?? []);
}

export async function listPopularPosts(): Promise<PostApi[]> {
  const res = await api<PostApi[] | { posts: PostApi[] }>("/api/v1/posts/popular", {}, { auth: false });
  return Array.isArray(res) ? res : (res.posts ?? []);
}
