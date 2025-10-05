import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import CurrentBookCard from "../components/club/CurrentBookCard";
import GatheringCard from "../components/club/GatheringCard";
import Feed from "../components/club/Feed";
import MemberList from "../components/club/MemberList";
import RoleGate from "../components/club/RoleGate";
import type { ReviewTypeData, PollTypeData, AnnotationTypeData, PostSharingTypeData } from "../lib/posts";
import Events from "../components/club/Events";
import Reading from "../components/club/Reading";

import Tabs from "../components/common/Tabs";

import { getClub, type ClubApi } from "../lib/clubs";
import { listClubPostSummaries, getPostComments, createPost, voteOnPoll, unvoteOnPoll } from "../lib/posts";
import { listClubEvents, createEvent } from "../lib/events";
import { listClubBooks, assignBook, addReadingLog, listReadingLogs, type BookApi, type ReadingLogApi } from "../lib/books";

import { likePost, unlikePost } from "../lib/likes";
import { createComment, deleteComment, likeComment, unlikeComment, isCommentLikedByUser, type CommentApi } from "../lib/comments";

import { currentSession } from "../data/session";
import { type Role } from "../data/session";
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

interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  type: "discussion" | "announcement" | "event" | "poll" | "review" | "annotation" | "post";
  content: string;
  title?: string;
  likes?: number;
  comments?: number;
  createdAtISO: string;
  userLiked?: boolean;
  commentsData?: CommentApi[];
  typeData?: ReviewTypeData | PollTypeData | AnnotationTypeData | PostSharingTypeData; // Type-specific data
}

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
    const [books, setBooks] = useState<BookApi[]>([]);
    const [readingLogs, setReadingLogs] = useState<ReadingLogApi[]>([]);
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

                // 3) Load club posts with enhanced metadata (now includes like status!)
                const clubPosts = await listClubPostSummaries(clubId);
                
                const mappedPosts = clubPosts
                    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
                    .map((p): FeedPost => {
                        return {
                            id: String(p.id),
                            authorId: String(p.user?.id ?? "unknown"),
                            authorName: p.user?.username || "Member",
                            authorRole: "member" as Role, // TODO: Map from club member role
                            type: p.type,
                            content: p.content, // Now available in summary!
                            title: p.title,
                            createdAtISO: p.created_at ?? new Date().toISOString(),
                            likes: p.likes_count || 0,
                            comments: p.comments_count || 0,
                            userLiked: p.has_user_liked || false, // From API (optional field)
                            commentsData: [], // Will be loaded when clicking on comments
                            typeData: p.type_data, // Include type data for enhanced UI
                        };
                    });
                setPosts(mappedPosts);

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

                // 7) Load books and reading logs
                const [booksData, readingLogsData] = await Promise.all([
                    listClubBooks(clubId),
                    listReadingLogs(clubId)
                ]);
                
                setBooks(booksData);
                setReadingLogs(readingLogsData);

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
    const addPost: React.ComponentProps<typeof Feed>["onCreate"] = async (title, content, type, typeData) => {
        if (!currentSession?.userId || !clubId) return;
        
        try {
            // Convert poll creation data to proper format if needed
            let processedTypeData = typeData;
            if (type === "poll" && typeData && 'options' in typeData) {
                processedTypeData = {
                    ...typeData,
                    options: typeData.options.map((opt, index) => ({
                        id: String(index),
                        text: opt.text,
                        votes: 0
                    }))
                };
            }
            
            const post = await createPost({
                club_id: clubId,
                title,
                content,
                type,
                type_data: processedTypeData as ReviewTypeData | PollTypeData | AnnotationTypeData | PostSharingTypeData | undefined
            });
            
            setPosts(prev => [
                {
                    id: String(post.id),
                    authorId: currentSession.userId,
                    authorName: "You",
                    authorRole: currentSession.roleInClub,
                    type: type as FeedPost["type"],
                    content: post.content,
                    title: post.title,
                    createdAtISO: post.created_at ?? new Date().toISOString(),
                    likes: 0,
                    comments: 0,
                    userLiked: false,
                    commentsData: [],
                },
                ...prev,
            ]);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    // Comment handlers
    const handleCommentsLoad = async (postId: string | number): Promise<void> => {
        try {
            const comments = await getPostComments(postId);
            
            // Update the post's comments data
            setPosts(prev => prev.map(p => 
                p.id === String(postId) 
                    ? { 
                        ...p, 
                        commentsData: comments
                    } 
                    : p
            ));
        } catch (error) {
            console.error("Error loading comments:", error);
            throw error;
        }
    };

    const handleCommentCreate = async (postId: string | number, content: string) => {
        try {
            const comment = await createComment(postId, content);
            
            // Update the post's comments data and count
            setPosts(prev => prev.map(p => 
                p.id === String(postId) 
                    ? { 
                        ...p, 
                        comments: (p.comments || 0) + 1,
                        commentsData: [...(p.commentsData || []), comment]
                    } 
                    : p
            ));
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    };

    const handleCommentDelete = async (postId: string | number, commentId: string | number) => {
        try {
            await deleteComment(commentId);
            
            // Update the post's comments data and count
            setPosts(prev => prev.map(p => 
                p.id === String(postId) 
                    ? { 
                        ...p, 
                        comments: Math.max((p.comments || 0) - 1, 0),
                        commentsData: p.commentsData?.filter(c => c.id !== commentId) || []
                    } 
                    : p
            ));
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    };

    const handleCommentLike = async (commentId: string | number) => {
        try {
            // Find the comment to check if it's already liked
            let targetComment: CommentApi | null = null;
            posts.forEach(post => {
                const comment = post.commentsData?.find(c => c.id === commentId);
                if (comment) targetComment = comment;
            });

            if (!targetComment) return;

            const isCurrentlyLiked = isCommentLikedByUser(targetComment);
            
            if (isCurrentlyLiked) {
                await unlikeComment(commentId);
                // Update comment like status
                setPosts(prev => prev.map(p => ({
                    ...p,
                    commentsData: p.commentsData?.map(c => 
                        c.id === commentId 
                            ? { 
                                ...c, 
                                user_liked: false,
                                likes_count: Math.max((c.likes_count || 0) - 1, 0)
                            } 
                            : c
                    ) || []
                })));
            } else {
                await likeComment(commentId);
                // Update comment like status
                setPosts(prev => prev.map(p => ({
                    ...p,
                    commentsData: p.commentsData?.map(c => 
                        c.id === commentId 
                            ? { 
                                ...c, 
                                user_liked: true,
                                likes_count: (c.likes_count || 0) + 1
                            } 
                            : c
                    ) || []
                })));
            }
        } catch (error) {
            console.error("Error toggling comment like:", error);
            throw error;
        }
    };

    // Poll voting handlers
    const handlePollVote = async (postId: string | number, optionIds: string[]) => {
        try {
            if (optionIds.length === 0) {
                // Unvote - call unvote endpoint
                await unvoteOnPoll(postId, []);
            } else {
                // Vote - call vote endpoint
                await voteOnPoll(postId, optionIds);
            }
            
            // Simple refresh by reloading the page data - can be optimized later
            window.location.reload();
        } catch (error) {
            console.error("Error voting on poll:", error);
            throw error;
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
        <div className="container space-y-6" data-testid="club-dashboard">
            {/* Enhanced Club Header */}
            <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-slate-200" data-testid="club-header">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                <div className="relative p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" data-testid="club-name">
                                    {club?.name || "Loading..."}
                                </h1>
                                {club?.is_private && (
                                    <Badge variant="secondary" className="text-xs" data-testid="club-privacy-private">
                                        🔒 Private
                                    </Badge>
                                )}
                                {!club?.is_private && (
                                    <Badge variant="success" className="text-xs" data-testid="club-privacy-public">
                                        🌍 Public
                                    </Badge>
                                )}
                            </div>
                            
                            {club?.description && (
                                <p className="text-slate-600 mb-3 leading-relaxed" data-testid="club-description">{club.description}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600" data-testid="club-stats">
                                <span className="flex items-center" data-testid="club-members-count">
                                    <svg className="w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {club?.members_count || members.length} members
                                </span>
                                {club?.location && (
                                    <span className="flex items-center" data-testid="club-location">
                                        <svg className="w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {club.location}
                                    </span>
                                )}
                                {clubRating && (
                                    <span className="flex items-center" data-testid="club-rating">
                                        <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        {clubRating.average.toFixed(1)} ({clubRating.count} reviews)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Enhanced Navigation Tabs */}
            <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-1" data-testid="club-navigation">
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
                    data-testid="club-tabs"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3" data-testid="club-content">
                <div className="lg:col-span-2 space-y-6">
                    {/* Tab Content */}
                    {tab === "feed" && (
                        <div className="space-y-4" data-testid="feed-tab-content">
                            <Feed 
                                posts={posts.map(post => ({
                                    ...post,
                                    isLikedByUser: post.userLiked || false,
                                    isBookmarked: false, // TODO: implement bookmarking
                                    // Add enhanced data based on actual type_data from API
                                    ...(post.type === "poll" && post.typeData && {
                                        pollData: {
                                            question: (post.typeData as PollTypeData).question || post.title || "Poll question",
                                            options: (post.typeData as PollTypeData).options || [],
                                            totalVotes: (post.typeData as PollTypeData).options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0,
                                            allowMultiple: (post.typeData as PollTypeData).allow_multiple || false,
                                            userVote: [], // TODO: Get user's vote from API
                                            expiresAt: (post.typeData as PollTypeData).expires_at
                                        }
                                    }),
                                    ...(post.type === "review" && post.typeData && {
                                        reviewData: {
                                            rating: (post.typeData as ReviewTypeData).rating || 0,
                                            bookTitle: (post.typeData as ReviewTypeData).book_title || "Unknown Book"
                                        }
                                    }),
                                    ...(post.type === "annotation" && post.typeData && {
                                        annotationData: {
                                            bookTitle: (post.typeData as AnnotationTypeData).book_title || "Unknown Book",
                                            bookAuthor: (post.typeData as AnnotationTypeData).book_author || "Unknown Author",
                                            page: (post.typeData as AnnotationTypeData).page,
                                            chapter: (post.typeData as AnnotationTypeData).chapter,
                                            quote: (post.typeData as AnnotationTypeData).quote
                                        }
                                    }),
                                    ...(post.type === "post" && post.typeData && {
                                        shareData: {
                                            originalPostId: (post.typeData as PostSharingTypeData).post_id,
                                            originalPostTitle: (post.typeData as PostSharingTypeData).post_title,
                                            originalPostContent: (post.typeData as PostSharingTypeData).post_content
                                        }
                                    })
                                }))}
                                onCreate={addPost}
                                onLike={async (postId) => {
                                    try {
                                        // Find the current post to check like status
                                        const currentPost = posts.find(p => p.id === postId);
                                        const isCurrentlyLiked = currentPost?.userLiked || false;
                                        
                                        if (isCurrentlyLiked) {
                                            // Unlike the post
                                            await unlikePost(postId);
                                            const newLikesCount = Math.max((currentPost?.likes || 0) - 1, 0);
                                            
                                            setPosts(prev => prev.map(p => 
                                                p.id === postId 
                                                    ? { 
                                                        ...p, 
                                                        likes: newLikesCount,
                                                        userLiked: false
                                                    }
                                                    : p
                                            ));
                                        } else {
                                            // Like the post
                                            await likePost(postId);
                                            const newLikesCount = (currentPost?.likes || 0) + 1;
                                            
                                            setPosts(prev => prev.map(p => 
                                                p.id === postId 
                                                    ? { 
                                                        ...p, 
                                                        likes: newLikesCount,
                                                        userLiked: true
                                                    }
                                                    : p
                                            ));
                                        }
                                    } catch (error) {
                                        console.error("Failed to toggle like on post:", error);
                                    }
                                }}
                                onCommentsLoad={handleCommentsLoad}
                                onCommentCreate={handleCommentCreate}
                                onCommentDelete={handleCommentDelete}
                                onCommentLike={handleCommentLike}
                                onBookmark={(postId) => {
                                    console.log("Bookmark post", postId);
                                    // TODO: implement bookmark functionality
                                }}
                                onPollVote={handlePollVote}
                                userRole={userRole}
                            />
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
                            onCreateEvent={async (title, description, date, location, maxAttendees) => {
                                try {
                                    const newEvent = await createEvent({
                                        club_id: clubId!,
                                        title,
                                        description,
                                        start_time: date,
                                        location,
                                        max_attendees: maxAttendees,
                                        event_type: "in_person",
                                        is_public: false
                                    });
                                    
                                    // Update local state
                                    const mappedEvent: ClubEvent = {
                                        id: String(newEvent.id),
                                        title: newEvent.title,
                                        description: newEvent.description,
                                        event_type: newEvent.event_type,
                                        start_time: newEvent.start_time,
                                        end_time: newEvent.end_time,
                                        location: newEvent.location,
                                        online_link: newEvent.online_link,
                                        max_attendees: newEvent.max_attendees,
                                        is_public: newEvent.is_public,
                                        attendees: 0,
                                        user_rsvp: null
                                    };
                                    
                                    setEvents(prev => [mappedEvent, ...prev]);
                                } catch (error) {
                                    console.error("Failed to create event:", error);
                                }
                            }}
                        />
                    )}

                    {tab === "reading" && (
                        <Reading 
                            books={books.map(book => ({
                                id: String(book.id),
                                title: book.title,
                                author: book.author,
                                isbn: book.isbn,
                                pages: book.pages,
                                assignedDate: book.assigned_date,
                                targetDate: book.target_date,
                                status: book.status
                            }))}
                            readingLogs={readingLogs.map(log => ({
                                id: String(log.id),
                                userId: String(log.user_id),
                                userName: log.user?.first_name && log.user?.last_name
                                    ? `${log.user.first_name} ${log.user.last_name}`
                                    : log.user?.username || "Anonymous",
                                bookId: String(log.book_id),
                                pagesRead: log.pages_read,
                                totalPages: 0, // Not available in API, would need book lookup
                                note: log.note,
                                createdAtISO: log.created_at
                            }))}
                            userRole={userRole}
                            onAssignBook={async (title, author, pages, targetDate) => {
                                try {
                                    const newBook = await assignBook({
                                        club_id: clubId!,
                                        title,
                                        author,
                                        pages,
                                        target_date: targetDate,
                                        status: "current"
                                    });
                                    
                                    setBooks(prev => [newBook, ...prev]);
                                } catch (error) {
                                    console.error("Failed to assign book:", error);
                                }
                            }}
                            onAddReadingLog={async (bookId, pagesRead, note) => {
                                try {
                                    const newLog = await addReadingLog({
                                        club_id: clubId!,
                                        book_id: bookId,
                                        pages_read: pagesRead,
                                        note
                                    });
                                    
                                    setReadingLogs(prev => [newLog, ...prev]);
                                } catch (error) {
                                    console.error("Failed to add reading log:", error);
                                }
                            }}
                        />
                    )}

                    {tab === "discussions" && (
                        <Feed 
                            posts={posts.map(post => ({
                                ...post,
                                isLikedByUser: post.userLiked || false,
                                isBookmarked: false,
                            }))}
                            filterType="discussion"
                            onCreate={async (title, content) => {
                                try {
                                    const newPost = await createPost({
                                        club_id: clubId!,
                                        title,
                                        content,
                                        type: "discussion"
                                    });
                                    
                                    setPosts(prev => [newPost, ...prev]);
                                } catch (error) {
                                    console.error("Failed to create discussion:", error);
                                }
                            }}
                            onLike={async (postId) => {
                                try {
                                    const currentPost = posts.find(p => p.id === postId);
                                    const isCurrentlyLiked = currentPost?.userLiked || false;
                                    
                                    if (isCurrentlyLiked) {
                                        await unlikePost(postId);
                                        const newLikesCount = Math.max((currentPost?.likes || 0) - 1, 0);
                                        
                                        setPosts(prev => prev.map(p => 
                                            p.id === postId 
                                                ? { 
                                                    ...p, 
                                                    likes: newLikesCount,
                                                    userLiked: false
                                                }
                                                : p
                                        ));
                                    } else {
                                        await likePost(postId);
                                        const newLikesCount = (currentPost?.likes || 0) + 1;
                                        
                                        setPosts(prev => prev.map(p => 
                                            p.id === postId 
                                                ? { 
                                                    ...p, 
                                                    likes: newLikesCount,
                                                    userLiked: true
                                                }
                                                : p
                                        ));
                                    }
                                } catch (error) {
                                    console.error("Failed to toggle like on discussion:", error);
                                }
                            }}
                            onCommentsLoad={handleCommentsLoad}
                            onCommentCreate={handleCommentCreate}
                            onCommentDelete={handleCommentDelete}
                            onCommentLike={handleCommentLike}
                            onBookmark={(postId) => {
                                console.log("Bookmark discussion", postId);
                            }}
                            userRole={userRole}
                        />
                    )}

                    {tab === "reviews" && (
                        <Feed 
                            posts={posts.map(post => ({
                                ...post,
                                isLikedByUser: post.userLiked || false,
                                isBookmarked: false,
                                ...(post.type === "review" && post.typeData && {
                                    reviewData: {
                                        rating: (post.typeData as ReviewTypeData).rating || 0,
                                        bookTitle: (post.typeData as ReviewTypeData).book_title || post.title || "Book Review"
                                    }
                                })
                            }))}
                            filterType="review"
                            onCreate={async (title, content) => {
                                try {
                                    const newPost = await createPost({
                                        club_id: clubId!,
                                        title,
                                        content,
                                        type: "review"
                                    });
                                    
                                    setPosts(prev => [newPost, ...prev]);
                                } catch (error) {
                                    console.error("Failed to create review:", error);
                                }
                            }}
                            onLike={async (postId) => {
                                try {
                                    const currentPost = posts.find(p => p.id === postId);
                                    const isCurrentlyLiked = currentPost?.userLiked || false;
                                    
                                    if (isCurrentlyLiked) {
                                        await unlikePost(postId);
                                        const newLikesCount = Math.max((currentPost?.likes || 0) - 1, 0);
                                        
                                        setPosts(prev => prev.map(p => 
                                            p.id === postId 
                                                ? { 
                                                    ...p, 
                                                    likes: newLikesCount,
                                                    userLiked: false
                                                }
                                                : p
                                        ));
                                    } else {
                                        await likePost(postId);
                                        const newLikesCount = (currentPost?.likes || 0) + 1;
                                        
                                        setPosts(prev => prev.map(p => 
                                            p.id === postId 
                                                ? { 
                                                    ...p, 
                                                    likes: newLikesCount,
                                                    userLiked: true
                                                }
                                                : p
                                        ));
                                    }
                                } catch (error) {
                                    console.error("Failed to toggle like on review:", error);
                                }
                            }}
                            onCommentsLoad={handleCommentsLoad}
                            onCommentCreate={handleCommentCreate}
                            onCommentDelete={handleCommentDelete}
                            onCommentLike={handleCommentLike}
                            onBookmark={(postId) => {
                                console.log("Bookmark review", postId);
                            }}
                            userRole={userRole}
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
