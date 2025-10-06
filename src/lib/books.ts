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

// New Book response shape returned by the /api/v1/books search endpoint
export type BookResponse = {
    id: number | null;
    external_id?: string;
    source?: string;
    title: string;
    author?: string;
    cover_url?: string;
    genre?: string;
    pages?: number;
    published_year?: number;
    isbn?: string;
    description?: string;
    rating?: number;
    local_rating?: number;
    read_count: number;
    rating_count: number;
    is_club_favorite: boolean;
    is_trending: boolean;
    created_at?: string;
    updated_at?: string;
};

/**
 * Search books using the backend books endpoint.
 * Query params:
 *  - q (string) required
 *  - limit (number) optional (default 20)
 *  - source ("local" | "external" | "all") optional (default "all")
 */
export async function searchBooks(q: string, opts?: { limit?: number; source?: "local" | "external" | "all" }): Promise<BookResponse[]> {
    if (!q || q.trim().length === 0) {
        throw new Error("Missing required query parameter 'q' for searchBooks");
    }

    const limit = typeof opts?.limit === 'number' ? Math.min(Math.max(1, Math.floor(opts!.limit)), 100) : 20;
    const source = opts?.source ?? "all";

    const params = new URLSearchParams({ q: q.trim(), limit: String(limit), source });
    const res = await api<unknown>(`/api/v1/books?${params.toString()}`);

    if (!res) return [];

    // If API returned an array directly
    if (Array.isArray(res)) return res as unknown as BookResponse[];

    // Common shapes: { books: [...] } | { data: [...] } | { results: [...] }
    const obj = res as Record<string, unknown>;
    const candidates = ['books', 'data', 'results', 'items'];
    for (const key of candidates) {
        const val = obj[key];
        if (Array.isArray(val)) return val as unknown as BookResponse[];
    }

    // Fallback: find first array property that looks like an array of books (has title)
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
            const first = v[0] as Record<string, unknown>;
            if (typeof first['title'] === 'string') {
                return v as unknown as BookResponse[];
            }
        }
    }

    // Dev-time debug to help discover unexpected shapes
    if (import.meta.env.DEV) {
        console.debug('searchBooks: unexpected response shape for query', q, res);
    }

    return [];
}

export async function listClubBooks(clubId?: string | number): Promise<BookApi[]> {
    // Prefer club-specific reading assignments endpoint which contains embedded book objects.
    if (!clubId) {
        console.warn("listClubBooks called without clubId — skipping call to /api/v1/books to avoid required-q error");
        return [];
    }

    try {
        const res = await api<unknown>(`/api/v1/clubs/${clubId}/reading`);
        if (!Array.isArray(res)) return [];

        const out: BookApi[] = [];
        for (const item of res) {
            if (!item || typeof item !== 'object') continue;
            const rec = item as Record<string, unknown>;
            const bookObj = rec['book'];
            if (!bookObj || typeof bookObj !== 'object') continue;
            const book = bookObj as Record<string, unknown>;

            const id = book['id'] as number | string | undefined;
            const title = (book['title'] as string) ?? String(id ?? 'Unknown');
            const author = (book['author'] as string) ?? '';
            const isbn = book['isbn'] as string | undefined;
            const pages = (book['pages'] as number | undefined) ?? undefined;
            const club_id = (rec['club_id'] as number | string | undefined) ?? clubId;
            const assigned_date = rec['start_date'] as string | undefined;
            const target_date = rec['due_date'] as string | undefined;
            const status = (rec['status'] as string | undefined) ?? 'current';
            const created_at = (book['created_at'] as string | undefined) ?? new Date().toISOString();

            const idVal = id as number | string | undefined;
            const clubIdVal = club_id as number | string | undefined;
            const statusVal = status as BookApi['status'];
            out.push({
                id: (idVal ?? 0) as number | string,
                title,
                author,
                isbn,
                pages,
                club_id: (clubIdVal ?? clubId) as number | string,
                assigned_date,
                target_date,
                status: statusVal ?? 'current',
                created_at
            });
        }

        return out;
    } catch (err) {
        console.warn('listClubBooks: failed to fetch club reading assignments', err);
        return [];
    }
}

async function createBook(data: {
    title: string;
    author: string;
    isbn?: string;
    pages: number;
    description: string;
    genre: string;
    published_year: number;
    cover_url?: string;
}): Promise<BookApi> {
    const response = await fetch(`/api/v1/books`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create book: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result.book || result;
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

    // First, create the book if it doesn't exist
    const book = await createBook({
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        pages: data.pages || 300,  // default page count
        description: `Book assigned to club ${club_id}`,
        genre: "Unknown",  // required field
        published_year: new Date().getFullYear()  // required field
    });

    // Then assign it to the club using the correct endpoint
    const assignmentData = {
        book_id: book.id,
        start_date: new Date().toISOString(),
        due_date: data.target_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        target_page: data.pages || 300,
        checkpoint: `Reading assignment: ${data.title}`
    };

    const response = await fetch(`/api/v1/clubs/${club_id}/reading/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(assignmentData)
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

export async function listReadingLogs(clubId: string | number): Promise<ReadingLogApi[]> {
    // Use club reading assignments endpoint since there's no specific reading logs endpoint
    const res = await api<ClubReading[]>(`/api/v1/clubs/${clubId}/reading`);
    
    // Transform club reading data into reading log format
    if (Array.isArray(res)) {
        return res.map((assignment: ClubReading) => ({
            id: assignment.id || `${clubId}-${assignment.book_id}`,
            book_id: assignment.book_id,
            user_id: assignment.user_id || 'unknown',
            pages_read: assignment.target_page || 0,
            note: assignment.checkpoint || '',
            created_at: assignment.start_date || new Date().toISOString()
        }));
    }
    
    return [];
}

type ClubReading = {
    id?: string | number;
    book_id: number;
    user_id?: string | number;
    target_page?: number;
    checkpoint?: string;
    start_date?: string;
    updated_at?: string;
};

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

    // Since there's no direct reading logs endpoint, we'll simulate adding a reading log
    // by creating a mock response that matches the expected format
    const mockLog: ReadingLogApi = {
        id: `${club_id}-${book_id}-${Date.now()}`,
        book_id: book_id,
        user_id: 'current_user', // Would need to get actual user ID
        pages_read: data.pages_read,
        note: data.note || '',
        created_at: new Date().toISOString()
    };

    // TODO: When reading log endpoints are available, replace this with actual API call
    console.warn("addReadingLog: Using mock data - no reading logs endpoint available");
    return mockLog;
}