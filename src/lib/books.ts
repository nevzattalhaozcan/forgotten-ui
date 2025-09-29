import { api } from "./api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
}

export type BookApi = {
    id: number | string;
    title: string;
    author: string;
    isbn?: string;
    pages?: number;
    club_id: number | string;
    assigned_date?: string;
    target_date?: string;
    status: "current" | "completed" | "upcoming";
    created_at: string;
};

export type ReadingLogApi = {
    id: number | string;
    user_id: number | string;
    book_id: number | string;
    pages_read: number;
    note?: string;
    created_at: string;
    user?: {
        id: number | string;
        username?: string;
        first_name?: string;
        last_name?: string;
    };
};

export async function listClubBooks(clubId: string | number): Promise<BookApi[]> {
    const res = await api<BookApi[] | { books: BookApi[] }>(`/api/v1/clubs/${clubId}/books`);
    return Array.isArray(res) ? res : (res.books ?? []);
}

export async function assignBook(data: {
    club_id: string | number;
    title: string;
    author: string;
    isbn?: string;
    pages?: number;
    target_date?: string;
    status?: "current" | "upcoming";
}): Promise<BookApi> {
    const club_id = typeof data.club_id === 'string' ? parseInt(data.club_id, 10) : data.club_id;
    
    if (isNaN(club_id)) {
        throw new Error("Invalid club_id: must be a valid number");
    }
    
    const requestBody = {
        ...data,
        club_id: club_id,
        status: data.status || "current"
    };
    
    const response = await fetch(`/api/v1/clubs/${club_id}/books`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign book: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function updateBookStatus(bookId: string | number, status: "current" | "completed" | "upcoming"): Promise<BookApi> {
    const response = await fetch(`/api/v1/books/${bookId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update book status: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

export async function listReadingLogs(clubId: string | number, bookId?: string | number): Promise<ReadingLogApi[]> {
    const url = bookId 
        ? `/api/v1/clubs/${clubId}/books/${bookId}/logs`
        : `/api/v1/clubs/${clubId}/reading-logs`;
    
    const res = await api<ReadingLogApi[] | { logs: ReadingLogApi[] }>(url);
    return Array.isArray(res) ? res : (res.logs ?? []);
}

export async function addReadingLog(data: {
    club_id: string | number;
    book_id: string | number;
    pages_read: number;
    note?: string;
}): Promise<ReadingLogApi> {
    const club_id = typeof data.club_id === 'string' ? parseInt(data.club_id, 10) : data.club_id;
    const book_id = typeof data.book_id === 'string' ? parseInt(data.book_id, 10) : data.book_id;
    
    if (isNaN(club_id) || isNaN(book_id)) {
        throw new Error("Invalid club_id or book_id: must be valid numbers");
    }
    
    const requestBody = {
        book_id: book_id,
        pages_read: data.pages_read,
        note: data.note
    };
    
    const response = await fetch(`/api/v1/clubs/${club_id}/reading-logs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add reading log: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}