import { api } from "./api";

export type EventApi = {
  id: number | string;
  title: string;
  description?: string;
  club_id: number | string;
  event_type: "online" | "in_person" | "hybrid";
  start_time: string;  // ISO
  end_time?: string;   // ISO
  location?: string;
  online_link?: string;
  max_attendees?: number;
  created_at: string;
  is_public: boolean;
  // Legacy fields for backward compatibility
  topic?: string;
};

export async function listClubEvents(clubId: string | number): Promise<EventApi[]> {
  const res = await api<EventApi[] | { events: EventApi[] }>(`/api/v1/clubs/${clubId}/events`);
  return Array.isArray(res) ? res : (res.events ?? []);
}

export async function listPublicEvents(): Promise<EventApi[]> {
  const res = await api<EventApi[] | { events: EventApi[] }>(`/api/v1/events/public`, {}, { auth: false });
  return Array.isArray(res) ? res : (res.events ?? []);
}
