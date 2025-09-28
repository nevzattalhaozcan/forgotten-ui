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

        const mappedAnns: AnnView[] = announcements
          .sort((a,b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
          .slice(0, 6)
          .map((p: PostApi) => ({
            id: p.id,
            clubId: p.club_id,
            clubName: clubMap.get(p.club_id)?.name,
            title: p.title,
            content: p.content,
            author: p.user?.username || p.user?.email || "Member",
            createdISO: p.created_at
          }));

        const now = Date.now();
        const mappedEvs: EventView[] = events
          .filter(e => e.start_time && new Date(e.start_time).getTime() >= now)
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
      <div className="container space-y-4">
        <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 3 }).map((_,i) => <div key={i} className="card h-24 animate-pulse" />)}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_,i) => <div key={i} className="card h-20 animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container space-y-4">
        <h1 className="text-2xl font-bold">Welcome to BookClub</h1>
        <div className="card p-5">
          <div className="text-sm text-red-700 mb-3">Error: {err}</div>
          <p className="text-sm text-gray-600 mb-4">
            Having trouble loading content? Try browsing public clubs or sign in to see personalized content.
          </p>
          <div className="flex gap-2">
            <button className="btn" onClick={()=>nav("/discover")}>
              Browse Clubs
            </button>
            <button className="btn" onClick={()=>nav("/login")}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isPublicMode ? "Discover BookClub" : "Welcome"}
        </h1>
        {isPublicMode && (
          <div className="text-sm text-gray-600">
            <button className="btn inline-block mr-2" onClick={()=>nav("/login")}>Sign In</button>
            to see personalized content
          </div>
        )}
      </div>

      {!hasData && (
        <div className="card p-6 text-center">
          <h3 className="font-semibold mb-2">
            {isPublicMode ? "Welcome to BookClub!" : "Getting started..."}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isPublicMode 
              ? "Join reading communities, discover new books, and connect with fellow readers."
              : "No announcements or upcoming events yet."
            }
          </p>
          <div className="flex gap-2 justify-center">
            <button className="btn" onClick={()=>nav("/discover")}>
              {isPublicMode ? "Explore Clubs" : "Discover Clubs"}
            </button>
            {isPublicMode && (
              <button className="btn" onClick={()=>nav("/login")}>Join Now</button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">
            {isPublicMode ? "Popular announcements" : "Latest announcements"}
          </h2>

          {anns.map(a => (
            <Card
              key={a.id}
              title={a.title || "Announcement"}
              actions={
                <div className="flex items-center gap-2">
                  {a.clubName && <Badge>{a.clubName}</Badge>}
                  <Badge>Club #{a.clubId}</Badge>
                </div>
              }
            >
              <div className="space-y-2">
                {a.author && <div className="text-xs text-gray-600">by {a.author} • {fmt(a.createdISO)}</div>}
                <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-3">{a.content}</p>
                <div className="pt-2 flex gap-2">
                  <button className="btn" onClick={() => nav(`/club/${a.clubId}`)}>
                    {isPublicMode ? "View Club" : "Open club"}
                  </button>
                  {isPublicMode && (
                    <button className="btn btn-secondary" onClick={() => nav("/login")}>
                      Join Discussion
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {anns.length === 0 && (
            <div className="card p-5 text-sm text-gray-600">
              {isPublicMode ? "No public announcements available." : "No announcements."}
            </div>
          )}
        </div>

        {/* Right: Upcoming Events */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upcoming events</h2>

          {evs.map(e => (
            <Card
              key={e.id}
              title={e.title || e.topic || "Club Event"}
              actions={
                <div className="flex flex-col items-end gap-1">
                  <Badge>{fmt(e.whenISO)}</Badge>
                  {e.isPublic && <Badge variant="secondary">🌍 Public</Badge>}
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
                  <div className="text-sm text-gray-700">
                    📍 {e.location}
                  </div>
                )}
                {e.onlineLink && e.eventType !== "in_person" && (
                  <div className="text-sm text-blue-600">
                    💻 <a href={e.onlineLink} target="_blank" rel="noopener noreferrer" className="underline">
                      Join Online
                    </a>
                  </div>
                )}
                {e.maxAttendees && (
                  <div className="text-xs text-gray-600">
                    Max attendees: {e.maxAttendees}
                  </div>
                )}
                {e.clubName && <div className="text-xs text-gray-600">{e.clubName}</div>}
                <div className="flex gap-2">
                  <button className="btn" onClick={() => nav(`/club/${e.clubId}`)}>View Club</button>
                  {isPublicMode && (
                    <button className="btn btn-secondary text-xs" onClick={() => nav("/login")}>
                      {e.isPublic ? "RSVP" : "Join to RSVP"}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {evs.length === 0 && (
            <div className="card p-5 text-sm text-gray-600">No upcoming events.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;