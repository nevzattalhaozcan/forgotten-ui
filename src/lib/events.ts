import { api } from "./api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
}

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

export async function createEvent(data: {
    club_id: string | number;
    title: string;
    description: string;
    start_time: string;
    end_time?: string;
    location?: string;
    online_link?: string;
    max_attendees?: number;
    event_type: "online" | "in_person" | "hybrid";
    is_public?: boolean;
}): Promise<EventApi> {
    const club_id = typeof data.club_id === 'string' ? parseInt(data.club_id, 10) : data.club_id;
    
    if (isNaN(club_id)) {
        throw new Error("Invalid club_id: must be a valid number");
    }
    
    const requestBody = {
        ...data,
        club_id: club_id,
        is_public: data.is_public ?? false
    };
    
    const response = await fetch(`/api/v1/clubs/${club_id}/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create event: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function updateEvent(eventId: string | number, data: Partial<EventApi>): Promise<EventApi> {
    const response = await fetch(`/api/v1/events/${eventId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update event: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function deleteEvent(eventId: string | number): Promise<void> {
    const response = await fetch(`/api/v1/events/${eventId}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete event: ${response.status} ${response.statusText} - ${errorText}`);
    }
}
