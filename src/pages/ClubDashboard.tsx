import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import CurrentBookCard from "../components/club/CurrentBookCard";
import GatheringCard from "../components/club/GatheringCard";
import Feed from "../components/club/Feed";
import MemberList from "../components/club/MemberList";
import RoleGate from "../components/club/RoleGate";
import Discussions from "../components/club/Discussions";
import Reviews from "../components/club/Reviews";
import Events from "../components/club/Events";
import Reading from "../components/club/Reading";

import Tabs from "../components/common/Tabs";

import { getClub, type ClubApi } from "../lib/clubs";
import { listPosts, createPost } from "../lib/posts";
import { listClubEvents } from "../lib/events";

import { currentSession } from "../data/session";
import ModerationPanel from "../components/club/ModerationPanel";

// Enhanced types based on API capabilities
type ClubMember = { 
  id: string; 
  name: string; 
  role: "member" | "moderator" | "owner" | "club_admin"; 
  joinedISO: string; 
  is_approved: boolean;
  avatar_url?: string;
  location?: string;
};

type FeedPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "member" | "moderator" | "owner";
  type: "discussion" | "announcement" | "event" | "poll" | "review" | "annotation";
  content: string;
  title?: string;
  createdAtISO: string;
  likes?: number;
  comments?: number;
};

type ClubEvent = {
  id: string;
  title: string;
  description?: string;
  event_type: "online" | "in_person" | "hybrid";
  start_time: string;
  end_time?: string;
  location?: string;
  online_link?: string;
  max_attendees?: number;
  is_public: boolean;
  attendees?: number;
  user_rsvp?: "going" | "maybe" | "not_going" | null;
};

export default function ClubDashboard() {
    const params = useParams<{ id: string }>();
    const clubId = params.id; // we expect /club/:id
    const navigate = useNavigate();

    // Loading & error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Enhanced club state
    const [club, setClub] = useState<ClubApi | null>(null);
    const [members, setMembers] = useState<ClubMember[]>([]);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [clubRating, setClubRating] = useState<{ average: number; count: number } | null>(null);

    // Book and reading management
    const [currentBook, setCurrentBook] = useState<{ title: string; author: string; progressPct: number; annotations: number; discussions: number } | null>(null);
    const [nextGathering, setNextGathering] = useState<{ id: string; dateISO: string; location: string; agenda?: string } | null>(null);
    
    // Enhanced UI states
    const [showMembers, setShowMembers] = useState(false);
    const [showModeration, setShowModeration] = useState(false);

    // Enhanced tabs with new features
    const [tab, setTab] = useState<"feed" | "events" | "reading" | "discussions" | "reviews">("feed");

    // Get user's role in this club
    const getUserRole = () => {
        const userId = localStorage.getItem("userId");
        if (!userId || !club) return "member";
        
        const member = club.members?.find(m => String(m.user_id) === userId);
        if (!member) return "member";
        
        if (member.role === "club_admin" || String(club.owner_id) === userId) return "owner";
        return member.role;
    };

    const userRole = getUserRole();

    // clubId comes from useParams
    // Member management functions (stub for now - not implemented in backend)
    const promoteMember = async (userId: string | number) => {
        console.log("Promote member", userId);
        // TODO: implement when backend API is ready
    };

    const demoteMember = async (userId: string | number) => {
        console.log("Demote member", userId);  
        // TODO: implement when backend API is ready
    };

    const removeMember = async (userId: string | number) => {
        console.log("Remove member", userId);
        // TODO: implement when backend API is ready
    };

    const approveMember = async (userId: string | number) => {
        console.log("Approve member", userId);
        // TODO: implement when backend API is ready
    };

    useEffect(() => {
        if (!clubId) {
            navigate("/discover", { replace: true });
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);

                // 1) Load club details with enhanced information
                const clubData = await getClub(clubId);
                setClub(clubData);

                // 2) Enhanced members mapping with role normalization
                const embeddedMembers: ClubMember[] = (clubData.members ?? []).map((m) => ({
                    id: String(m.id),
                    name: m.user?.first_name && m.user?.last_name 
                        ? `${m.user.first_name} ${m.user.last_name}`
                        : m.user?.username || m.user?.email || String(m.user_id),
                    role: (m.role === "club_admin" ? "owner" : m.role) as ClubMember["role"],
                    joinedISO: m.joined_at ?? new Date().toISOString(),
                    is_approved: m.is_approved,
                    avatar_url: m.user?.avatar_url || undefined,
                    location: m.user?.location || undefined
                }));
                setMembers(embeddedMembers);

                // 3) Load club posts with enhanced metadata
                const allPosts = await listPosts();
                const clubPosts = allPosts
                    .filter((p) => String(p.club_id) === String(clubId))
                    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
                    .map((p): FeedPost => ({
                        id: String(p.id),
                        authorId: String(p.user?.id ?? "unknown"),
                        authorName: p.user?.first_name && p.user?.last_name 
                            ? `${p.user.first_name} ${p.user.last_name}`
                            : p.user?.username || p.user?.email || "Member",
                        authorRole: "member", // TODO: Map from club member role
                        type: p.type,
                        content: p.content,
                        title: p.title,
                        createdAtISO: p.created_at ?? new Date().toISOString(),
                        likes: 0, // TODO: Implement when like API is available
                        comments: 0, // TODO: Implement when comment count API is available
                    }));
                setPosts(clubPosts);

                // 4) Load club events with RSVP status
                try {
                    const eventsData = await listClubEvents(clubId);
                    const mappedEvents: ClubEvent[] = eventsData.map((e): ClubEvent => ({
                        id: String(e.id),
                        title: e.title,
                        description: e.description,
                        event_type: e.event_type,
                        start_time: e.start_time,
                        end_time: e.end_time,
                        location: e.location,
                        online_link: e.online_link,
                        max_attendees: e.max_attendees,
                        is_public: e.is_public,
                        attendees: 0, // TODO: Get from attendees API
                        user_rsvp: null // TODO: Get user's RSVP status
                    }));
                    setEvents(mappedEvents);

                    // Set next gathering from upcoming events
                    const upcoming = mappedEvents
                        .filter(e => new Date(e.start_time) > new Date())
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
                    
                    if (upcoming[0]) {
                        setNextGathering({
                            id: upcoming[0].id,
                            dateISO: upcoming[0].start_time,
                            location: upcoming[0].location || upcoming[0].online_link || "TBD",
                            agenda: upcoming[0].description
                        });
                    }
                } catch (e) {
                    console.warn("Could not load events:", e);
                    setEvents([]);
                }

                // 5) Enhanced current book with reading progress
                if (clubData.current_book?.title) {
                    setCurrentBook({
                        title: clubData.current_book.title,
                        author: clubData.current_book.author ?? "Unknown",
                        progressPct: Math.round((clubData.current_book.progress ?? 0) * 100),
                        annotations: 0, // Placeholder for annotations count
                        discussions: 0, // Placeholder for discussions count
                    });
                }

                // 6) Club rating information
                if (clubData.rating && clubData.ratings_count) {
                    setClubRating({
                        average: clubData.rating,
                        count: clubData.ratings_count
                    });
                }

            } catch (e: unknown) {
                console.error("Club dashboard load error:", e);
                const errorObj = e as { detail?: { message?: string }; message?: string };
                setError(errorObj?.detail?.message || errorObj?.message || "Failed to load club dashboard");
            } finally {
                setLoading(false);
            }
        })();
    }, [clubId, navigate]);


    // Composer → create post via API, then prepend
    const addPost: React.ComponentProps<typeof Feed>["onCreate"] = async (content, as, title) => {
        if (!clubId) {
            console.error("Club ID is missing - cannot create post");
            return;
        }
        
        try {
            console.log("Creating post with club ID:", clubId, "content length:", content.length, "type:", as, "title:", title);
            const post = await createPost({ 
                club_id: clubId, // Pass as string, will be converted to number in the API function
                content, 
                type: as,
                title 
            });
            
            setPosts(prev => [
                {
                    id: String(post.id),
                    authorId: currentSession.userId,
                    authorName: "You",
                    authorRole: currentSession.roleInClub,
                    type: as,
                    content: post.content,
                    title: post.title,
                    createdAtISO: post.created_at ?? new Date().toISOString(),
                    likes: 0,
                    comments: 0,
                },
                ...prev,
            ]);
        } catch (error) {
            console.error("Error creating post:", error);
            // You might want to show a user-friendly error message here
            alert("Failed to create post. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="container space-y-4">
                <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
                    </div>
                    <div className="space-y-3">
                        <div className="card h-24 animate-pulse" />
                        <div className="card h-24 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="container space-y-4">
                <h1 className="text-2xl font-bold">Club</h1>
                <div className="card p-5 text-sm text-red-700">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="container space-y-6">
            {/* Enhanced Club Header */}
            <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-slate-200">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                <div className="relative p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {club?.name || "Loading..."}
                                </h1>
                                {club?.is_private && (
                                    <Badge variant="secondary" className="text-xs">
                                        🔒 Private
                                    </Badge>
                                )}
                                {!club?.is_private && (
                                    <Badge variant="success" className="text-xs">
                                        🌍 Public
                                    </Badge>
                                )}
                            </div>
                            
                            {club?.description && (
                                <p className="text-slate-600 mb-3 leading-relaxed">{club.description}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {club?.members_count || members.length} members
                                </span>
                                {club?.location && (
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {club.location}
                                    </span>
                                )}
                                {clubRating && (
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        {clubRating.average.toFixed(1)} ({clubRating.count} reviews)
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Enhanced Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button 
                                className="btn-outline"
                                onClick={() => setShowMembers(true)}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                Members ({members.length})
                            </button>
                            
                            {(userRole === "owner" || userRole === "moderator") && (
                                <>
                                    <button 
                                        className="btn"
                                        onClick={() => alert("Event creation coming soon!")}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Create Event
                                    </button>
                                    <button 
                                        className="btn-outline"
                                        onClick={() => setShowModeration(true)}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Manage
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Enhanced Navigation Tabs */}
            <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-1">
                <Tabs
                    tabs={[
                        { id: "feed", label: "Feed" },
                        { id: "events", label: "Events" },
                        { id: "reading", label: "Reading" },
                        { id: "discussions", label: "Discussions" },
                        { id: "reviews", label: "Reviews" },
                    ]}
                    value={tab}
                    onChange={(id) => setTab(id as typeof tab)}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Tab Content */}
                    {tab === "feed" && (
                        <div className="space-y-4">
                            <Feed posts={posts} onCreate={addPost} />
                        </div>
                    )}

                    {tab === "events" && (
                        <Events 
                            events={events.map(event => ({
                                id: event.id,
                                title: event.title,
                                description: event.description || "",
                                dateISO: event.start_time,
                                location: event.location || "TBD",
                                createdByName: "Club Admin", // You might want to add this field to the API
                                attendees: event.attendees,
                                maxAttendees: event.max_attendees,
                                status: new Date(event.start_time) > new Date() ? "upcoming" : "completed" as "upcoming" | "ongoing" | "completed" | "cancelled"
                            }))}
                            userRole={userRole}
                            onCreateEvent={(title, description, date, location, maxAttendees) => {
                                // Handle event creation
                                console.log("Creating event:", { title, description, date, location, maxAttendees });
                            }}
                        />
                    )}

                    {tab === "reading" && (
                        <Reading 
                            books={[]}
                            readingLogs={[]}
                            userRole={userRole}
                            onAssignBook={(title, author, pages, targetDate) => {
                                // Handle book assignment
                                console.log("Assigning book:", { title, author, pages, targetDate });
                            }}
                            onAddReadingLog={(bookId, pagesRead, note) => {
                                // Handle reading log
                                console.log("Adding reading log:", { bookId, pagesRead, note });
                            }}
                        />
                    )}

                    {tab === "discussions" && (
                        <Discussions 
                            discussions={[]}
                            onCreate={(title, content) => {
                                // Handle discussion creation
                                console.log("Creating discussion:", { title, content });
                            }}
                        />
                    )}

                    {tab === "reviews" && (
                        <Reviews 
                            reviews={[]}
                            onCreate={(title, content, rating) => {
                                // Handle review creation
                                console.log("Creating review:", { title, content, rating });
                            }}
                        />
                    )}
                </div>

                {/* Enhanced Sidebar */}
                <div className="space-y-6">
                    {currentBook && <CurrentBookCard {...currentBook} />}
                    {nextGathering && <GatheringCard {...nextGathering} />}
                    
                    {/* Quick Stats Card */}
                    <Card title="Club Statistics" variant="elevated">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-indigo-600">{members.length}</div>
                                <div className="text-xs text-slate-500">Members</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{posts.length}</div>
                                <div className="text-xs text-slate-500">Posts</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{events.length}</div>
                                <div className="text-xs text-slate-500">Events</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">0</div>
                                <div className="text-xs text-slate-500">Discussions</div>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Owner/Moderator Tools */}
                    <RoleGate allow={["owner", "moderator"]} otherwise={
                        <Card title="Member Tools" variant="elevated">
                            <div className="text-sm text-slate-600 text-center py-4">
                                Limited access - join discussions and events!
                            </div>
                        </Card>
                    }>
                        <Card title="Management Tools" variant="elevated">
                            <div className="space-y-3">
                                <button 
                                    className="btn w-full"
                                    onClick={() => alert("Event creation coming soon!")}
                                >
                                    📅 Create Event
                                </button>
                                <button 
                                    className="btn w-full"
                                    onClick={() => alert("Book assignment coming soon!")}
                                >
                                    📚 Assign Book
                                </button>
                                <button 
                                    className="btn-outline w-full"
                                    onClick={() => setShowModeration(true)}
                                >
                                    ⚙️ Manage Members
                                </button>
                                {userRole === "owner" && (
                                    <button className="btn-outline w-full">
                                        🎨 Edit Club
                                    </button>
                                )}
                            </div>
                        </Card>
                    </RoleGate>
                </div>
            </div>

            {/* Modals */}
            {showMembers && (
                <MemberList 
                    members={members.map(m => ({ 
                        ...m, 
                        role: m.role === "club_admin" ? "owner" : (m.role as "member" | "moderator")
                    }))} 
                    onClose={() => setShowMembers(false)} 
                />
            )}
            {showModeration && (
                <ModerationPanel
                    me={userRole as "owner" | "moderator" | "member"}
                    members={members.map(m => ({ 
                        ...m, 
                        id: String(m.id),
                        role: m.role === "club_admin" ? "owner" : (m.role as "member" | "moderator")
                    }))}
                    onClose={() => setShowModeration(false)}
                    onPromote={promoteMember}
                    onDemote={demoteMember}
                    onRemove={removeMember}
                    onApprove={approveMember}
                    pendingId={null}
                />
            )}
        </div>
    );
}
