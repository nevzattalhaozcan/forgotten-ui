import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "../components/common/Card";
import CurrentBookCard from "../components/club/CurrentBookCard";
import GatheringCard from "../components/club/GatheringCard";
import Feed from "../components/club/Feed";
import MemberList from "../components/club/MemberList";
import RoleGate from "../components/club/RoleGate";

import Tabs from "../components/common/Tabs";
import DiscussionComposer from "../components/discuss/DiscussionComposer";
import DiscussionThreadCard from "../components/discuss/DiscussionThread";
import AnnotationsPanel from "../components/discuss/AnnotationsPanel";

import { getClub } from "../lib/clubs";
import { listPosts, createPost } from "../lib/posts";
import { listClubEvents } from "../lib/events"; // optional

import { currentSession } from "../data/session";
import { sampleThreads as threadsSeed, sampleAnnotations as annSeed } from "../data/threads";
import type { DiscussionThread, Annotation } from "../data/threads";
import ModerationPanel from "../components/club/ModerationPanel";

// Shape expected by your existing components
type ClubMember = { id: string; name: string; role: "member" | "moderator" | "owner"; joinedISO: string; is_approved: boolean };
type FeedPost = {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: "member" | "moderator" | "owner";
    type: "post" | "announcement";
    content: string;
    createdAtISO: string;
};

export default function ClubDashboard() {
    const params = useParams<{ id: string }>();
    const clubId = params.id; // we expect /club/:id
    const navigate = useNavigate();

    // Loading & error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Live club state
    const [clubName, setClubName] = useState("Club");
    const [clubDesc, setClubDesc] = useState("");
    const [members, setMembers] = useState<ClubMember[]>([]);
    const [posts, setPosts] = useState<FeedPost[]>([]);

    // Optional: derive current book & next gathering from API when available
    const [currentBook, setCurrentBook] = useState<{ title: string; author: string; progressPct: number; annotations: number; discussions: number } | null>(null);
    const [nextGathering, setNextGathering] = useState<{ id: string; dateISO: string; location: string; agenda?: string } | null>(null);

    // UI states you already had
    const [showMembers, setShowMembers] = useState(false);
    const [showModeration, setShowModeration] = useState(false); // hook up later to backend moderation

    // Tabs + discussions/annotations (mock)
    const [tab, setTab] = useState<"feed" | "discuss" | "notes">("feed");
    const [threads, setThreads] = useState<DiscussionThread[]>(threadsSeed);
    const [annotations, setAnnotations] = useState<Annotation[]>(annSeed);

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
            // If user hits /club without id, send them to Discover
            navigate("/discover", { replace: true });
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);

                // 1) Club detail (includes members)
                const club = await getClub(clubId);
                setClubName(club.name);
                setClubDesc(club.description ?? "");

                // 2) Members from embedded array
                // Members → map to your MemberList shape
                const embeddedMembers: ClubMember[] = (club.members ?? []).map((m) => ({
                    id: String(m.id),
                    name: m.user?.first_name && m.user?.last_name 
                        ? `${m.user.first_name} ${m.user.last_name}`
                        : m.user?.username || m.user?.email || String(m.user_id),
                    role: (m.role === "club_admin" ? "owner" : m.role) as ClubMember["role"],
                    joinedISO: m.joined_at ?? new Date().toISOString(),
                    is_approved: m.is_approved
                }));
                setMembers(embeddedMembers);

                // 3) Posts (global) → filter by club
                const allPosts = await listPosts();
                // Posts → filter by club_id and map to your Feed shape
                const mappedPosts: FeedPost[] = (allPosts ?? [])
                    .filter((p) => String(p.club_id) === String(clubId))
                    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
                    .map((p) => ({
                        id: String(p.id),
                        authorId: String(p.user?.id ?? "unknown"),
                        authorName: p.user?.first_name && p.user?.last_name 
                            ? `${p.user.first_name} ${p.user.last_name}`
                            : p.user?.username || p.user?.email || "Member",
                        authorRole: "member",
                        type: p.type,
                        content: p.content,
                        createdAtISO: p.created_at ?? new Date().toISOString(),
                    }));
                setPosts(mappedPosts);

                // 4) Optional: events
                try {
                    const events = await listClubEvents(clubId);
                    const upcoming = events
                        .map(ev => ({ id: String(ev.id), dateISO: ev.start_time ?? "", location: ev.location ?? "", agenda: ev.topic }))
                        .filter(ev => ev.dateISO)
                        .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
                    if (upcoming[0]) setNextGathering(upcoming[0]);
                } catch { /* ignore if not available */ }

                // 5) Optional: current book
                if (club.current_book?.title || club.current_book?.author) {
                    setCurrentBook({
                        title: club.current_book?.title ?? "—",
                        author: club.current_book?.author ?? "—",
                        progressPct: Math.round((club.current_book?.progress ?? 0) * 100) || 0,
                        annotations: 0,
                        discussions: 0,
                    });
                } else {
                    setCurrentBook(null);
                }

            } catch (e: unknown) {
                console.error("Club load error", e);
                const errorObj = e as { detail?: { message?: string }; message?: string };
                setError(errorObj?.detail?.message || errorObj?.message || "Failed to load club");
            } finally {
                setLoading(false);
            }
        })();
    }, [clubId, navigate]);


    // Composer → create post via API, then prepend
    const addPost: React.ComponentProps<typeof Feed>["onCreate"] = async (content, as) => {
        if (!clubId) return;
        const post = await createPost({ club_id: clubId, content, type: as });
        setPosts(prev => [
            {
                id: String(post.id),
                authorId: currentSession.userId,
                authorName: "You",
                authorRole: currentSession.roleInClub,
                type: as,
                content: post.content,
                createdAtISO: post.created_at ?? new Date().toISOString(),
            },
            ...prev,
        ]);
    };

    // Discussions/Annotations handlers (mock, unchanged)
    const createThread: React.ComponentProps<typeof DiscussionComposer>["onCreate"] = (title, chapter, quote) => {
        const t: DiscussionThread = {
            id: Math.random().toString(36).slice(2),
            title, chapter, quote,
            createdAtISO: new Date().toISOString(),
            authorId: currentSession.userId,
            authorName: "You",
            comments: [],
        };
        setThreads([t, ...threads]);
    };
    const addComment = (threadId: string, text: string) => {
        setThreads(threads.map(t => t.id === threadId
            ? { ...t, comments: [...t.comments, { id: Math.random().toString(36).slice(2), authorId: currentSession.userId, authorName: "You", createdAtISO: new Date().toISOString(), text }] }
            : t));
    };
    const addAnnotation: React.ComponentProps<typeof AnnotationsPanel>["onAdd"] = (text, chapter, page) => {
        const a: Annotation = { id: Math.random().toString(36).slice(2), text, chapter, page, createdAtISO: new Date().toISOString(), authorId: currentSession.userId, authorName: "You" };
        setAnnotations([a, ...annotations]);
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
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{clubName}</h1>
                    {clubDesc && <p className="text-sm text-gray-600">{clubDesc}</p>}
                </div>
                <div className="flex gap-2">
                    <button className="btn" onClick={() => setShowMembers(true)}>View members ({members.length})</button>
                    <RoleGate allow={["owner", "moderator"]}>
                        <button className="btn" onClick={() => setShowModeration(true)}>Manage users</button>
                    </RoleGate>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Tabs
                        tabs={[
                            { id: "feed", label: "Feed" },
                            { id: "discuss", label: "Discussions" },
                            { id: "notes", label: "Annotations" },
                        ]}
                        value={tab}
                        onChange={(id) => setTab(id as typeof tab)}
                    />

                    {tab === "feed" && (
                        <Feed posts={posts} onCreate={addPost} />
                    )}

                    {tab === "discuss" && (
                        <>
                            <DiscussionComposer onCreate={createThread} />
                            <div className="space-y-4">
                                {threads.map(t => (
                                    <DiscussionThreadCard key={t.id} thread={t} onAddComment={addComment} />
                                ))}
                                {threads.length === 0 && <div className="text-sm text-gray-600">No discussions yet.</div>}
                            </div>
                        </>
                    )}

                    {tab === "notes" && (
                        <AnnotationsPanel annotations={annotations} onAdd={addAnnotation} />
                    )}
                </div>

                <div className="space-y-4">
                    {currentBook && <CurrentBookCard {...currentBook} />}
                    {nextGathering && <GatheringCard {...nextGathering} />}
                    <RoleGate allow={["owner"]} otherwise={<Card title="Owner tools"><div className="text-sm text-gray-600">Owner actions are hidden.</div></Card>}>
                        <Card title="Owner tools">
                            <div className="space-y-2 text-sm">
                                <button className="btn w-full">Post announcement</button>
                                <button className="btn w-full">(Later) Create poll</button>
                                <button className="btn w-full">(Later) Edit club details</button>
                            </div>
                        </Card>
                    </RoleGate>
                </div>
            </div>

            {showMembers && (
                <MemberList members={members} onClose={() => setShowMembers(false)} />
            )}
            {showModeration && (
                <ModerationPanel
                    me={currentSession.roleInClub}
                    members={members.map(m => ({ ...m, id: String(m.id) }))}
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
