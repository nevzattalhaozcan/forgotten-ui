import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { getHomeData } from "../lib/home";
import type { PostApi } from "../lib/posts";
import type { EventApi } from "../lib/events";
import type { ClubApi } from "../lib/clubs";

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

type AnnView = {
  id: number|string;
  clubId: number|string;
  clubName?: string;
  title?: string;
  content: string;
  author?: string;
  createdISO?: string;
};

type EventView = {
  id: number|string;
  clubId: number|string;
  clubName?: string;
  whenISO?: string;
  endTimeISO?: string;
  location?: string;
  onlineLink?: string;
  topic?: string;
  title?: string;
  eventType?: string;
  maxAttendees?: number;
  isPublic?: boolean;
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 loading-card rounded-lg"></div>
      <div className="h-6 w-32 loading-card rounded-lg"></div>
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-6 w-40 loading-card rounded-lg"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="loading-card h-32 rounded-xl"></div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-6 w-32 loading-card rounded-lg"></div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="loading-card h-24 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
);

const Home: React.FC = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [anns, setAnns] = useState<AnnView[]>([]);
  const [evs, setEvs] = useState<EventView[]>([]);
  const [isPublicMode, setIsPublicMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr(null); setLoading(true);
        const { announcements, events, clubs } = await getHomeData();
        
        // Create club lookup for names
        const clubMap = new Map<string|number, ClubApi>();
        (clubs || []).forEach(club => clubMap.set(club.id, club));

        // Get current user info for filtering private events
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const isLoggedIn = !!token;

        // Create set of club IDs where user is a member
        const userClubIds = new Set<string|number>();
        if (isLoggedIn && userId) {
          (clubs || []).forEach(club => {
            if (club.members && club.members.some(member => String(member.user_id) === userId)) {
              userClubIds.add(club.id);
            }
          });
        }

        const mappedAnns: AnnView[] = announcements
          .sort((a,b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
          .slice(0, 6)
          .map((p: PostApi) => ({
            id: p.id,
            clubId: p.club_id,
            clubName: clubMap.get(p.club_id)?.name,
            title: p.title,
            content: p.content || "",
            author: p.user?.username || p.user?.email || "Member",
            createdISO: p.created_at
          }));

        const now = Date.now();
        const mappedEvs: EventView[] = events
          .filter(e => e.start_time && new Date(e.start_time).getTime() >= now)
          // Filter private events: show only if user is logged in AND is a member of the club
          .filter(e => {
            // Always show public events
            if (e.is_public) return true;
            // For private events, only show if user is logged in and is a club member
            return isLoggedIn && userClubIds.has(e.club_id);
          })
          .sort((a,b) => new Date(a.start_time ?? 0).getTime() - new Date(b.start_time ?? 0).getTime())
          .slice(0, 6)
          .map((e: EventApi) => ({
            id: e.id,
            clubId: e.club_id,
            clubName: clubMap.get(e.club_id)?.name,
            whenISO: e.start_time,
            endTimeISO: e.end_time,
            location: e.location,
            onlineLink: e.online_link,
            topic: e.topic || e.title,
            title: e.title,
            eventType: e.event_type,
            maxAttendees: e.max_attendees,
            isPublic: e.is_public
          }));

        setAnns(mappedAnns);
        setEvs(mappedEvs);
        setIsPublicMode(!clubs || clubs.length === 0); // Assume public mode if no clubs returned
      } catch (e: unknown) {
        const errorObj = e as { detail?: { message?: string }; message?: string };
        setErr(errorObj?.detail?.message || errorObj?.message || "Failed to load home data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasData = useMemo(() => anns.length || evs.length, [anns, evs]);

  if (loading) {
    return (
      <div className="container">
        <LoadingSkeleton />
      </div>
    );
  }

  if (err) {
    return (
      <div className="container space-y-6">
        <div className="section-header">
          <h1 className="section-title">Welcome to BookClub</h1>
        </div>
        <Card variant="elevated" className="text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Connection Issue</h3>
              <p className="text-error mb-4">{err}</p>
              <p className="text-muted mb-6">
                Having trouble loading content? Try browsing public clubs or sign in to see personalized content.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button className="btn" onClick={()=>nav("/discover")}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Clubs
              </button>
              <button className="btn-outline" onClick={()=>nav("/login")}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-8">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            {isPublicMode ? "Discover BookClub" : "Welcome Back"}
          </h1>
          <p className="text-muted mt-1">
            {isPublicMode 
              ? "Join reading communities and connect with fellow book lovers" 
              : "Stay updated with your reading community"
            }
          </p>
        </div>
        {isPublicMode && (
          <div className="flex items-center gap-3">
            <button className="btn" onClick={()=>nav("/login")}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>
            <span className="text-muted text-sm">for personalized content</span>
          </div>
        )}
      </div>

      {!hasData && (
        <Card variant="glass" className="text-center">
          <div className="space-y-4 py-8">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {isPublicMode ? "Welcome to BookClub!" : "Getting Started"}
              </h3>
              <p className="text-muted mb-6 max-w-md mx-auto">
                {isPublicMode 
                  ? "Discover amazing reading communities, join book discussions, and connect with readers who share your passion."
                  : "No announcements or upcoming events yet. Start by discovering and joining some book clubs."
                }
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button className="btn btn-lg" onClick={()=>nav("/discover")}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isPublicMode ? "Explore Clubs" : "Discover Clubs"}
              </button>
              {isPublicMode && (
                <button className="btn-outline btn-lg" onClick={()=>nav("/register")}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Join Now
                </button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="section-subtitle flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              {isPublicMode ? "Popular Announcements" : "Latest Announcements"}
            </h2>
            {anns.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {anns.length} recent
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {anns.map((a, index) => (
              <Card
                key={a.id}
                title={a.title || "Announcement"}
                variant={index === 0 ? "elevated" : "default"}
                actions={
                  <div className="flex flex-col items-end gap-1">
                    {a.clubName && <Badge variant="gradient">{a.clubName}</Badge>}
                    <Badge variant="outline" className="text-xs">Club #{a.clubId}</Badge>
                  </div>
                }
              >
                <div className="space-y-3">
                  {a.author && (
                    <div className="flex items-center text-xs text-muted">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      by {a.author} • {fmt(a.createdISO)}
                    </div>
                  )}
                  <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3 leading-relaxed">
                    {a.content}
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button className="btn btn-sm" onClick={() => nav(`/club/${a.clubId}/details`)}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {isPublicMode ? "View Club" : "Open Club"}
                    </button>
                    {isPublicMode && (
                      <button className="btn-outline btn-sm" onClick={() => nav("/login")}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Join Discussion
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {anns.length === 0 && (
              <Card className="text-center py-8">
                <div className="text-muted">
                  <svg className="w-8 h-8 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                  </svg>
                  {isPublicMode ? "No public announcements available." : "No announcements yet."}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right: Upcoming Events */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="section-subtitle flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming Events
            </h2>
            {evs.length > 0 && (
              <Badge variant="success" className="text-xs">
                {evs.length} events
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {evs.map((e, index) => (
              <Card
                key={e.id}
                title={e.title || e.topic || "Club Event"}
                variant={index === 0 ? "elevated" : "default"}
                hover={false}
                actions={
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="default" className="text-xs whitespace-nowrap">
                      {fmt(e.whenISO)}
                    </Badge>
                    {e.isPublic && <Badge variant="success" className="text-xs">🌍 Public</Badge>}
                    {e.eventType && (
                      <Badge variant="outline" className="text-xs">
                        {e.eventType === "online" ? "💻 Online" : 
                         e.eventType === "in_person" ? "📍 In-Person" : "🔀 Hybrid"}
                      </Badge>
                    )}
                  </div>
                }
              >
                <div className="space-y-2">
                  {e.location && (
                    <div className="text-sm text-slate-700 flex items-start">
                      <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {e.location}
                    </div>
                  )}
                  {e.onlineLink && e.eventType !== "in_person" && (
                    <div className="text-sm">
                      <a 
                        href={e.onlineLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Join Online
                      </a>
                    </div>
                  )}
                  {e.maxAttendees && (
                    <div className="text-xs text-muted flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Max {e.maxAttendees} attendees
                    </div>
                  )}
                  {e.clubName && (
                    <div className="text-xs text-muted flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {e.clubName}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button className="btn btn-sm flex-1" onClick={() => nav(`/club/${e.clubId}/details`)}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Club
                    </button>
                    {isPublicMode && (
                      <button className="btn-outline btn-sm" onClick={() => nav("/login")}>
                        {e.isPublic ? "RSVP" : "Join"}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {evs.length === 0 && (
              <Card className="text-center py-8">
                <div className="text-muted">
                  <svg className="w-8 h-8 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  No upcoming events.
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;