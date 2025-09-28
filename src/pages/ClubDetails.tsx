import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { getClub, joinClub, leaveClub, type ClubApi } from "../lib/clubs";
import { listClubEvents } from "../lib/events";
import { listPosts } from "../lib/posts";

type ClubEvent = {
  id: string | number;
  title: string;
  start_time: string;
  end_time?: string;
  location?: string;
  topic?: string;
  event_type: string;
  is_public: boolean;
};

type ClubPost = {
  id: string | number;
  title: string;
  content: string;
  type: string;
  created_at: string;
  user?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
};

const ClubDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [club, setClub] = useState<ClubApi | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [joinLoading, setJoinLoading] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  
  // Check if user is a member
  const isMember = club?.members && userId 
    ? club.members.some(member => String(member.user_id) === userId)
    : false;

  useEffect(() => {
    if (!id) {
      navigate("/discover", { replace: true });
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch club details
        const clubData = await getClub(id);
        setClub(clubData);

        // Fetch public events for this club
        try {
          const eventsData = await listClubEvents(id);
          const publicEvents = eventsData.filter(event => event.is_public);
          setEvents(publicEvents);
        } catch (e) {
          console.warn("Could not load events:", e);
        }

        // Fetch recent public posts for this club
        try {
          const postsData = await listPosts();
          const clubPosts = postsData
            .filter(post => post.club_id === parseInt(id))
            .slice(0, 5) // Show recent 5 posts
            .map(post => ({
              id: post.id,
              title: post.title || "",
              content: post.content,
              type: post.type,
              created_at: post.created_at || new Date().toISOString(),
              user: post.user ? {
                username: post.user.username || post.user.email || "Unknown",
                first_name: post.user.first_name,
                last_name: post.user.last_name
              } : undefined
            }));
          setPosts(clubPosts);
        } catch (e) {
          console.warn("Could not load posts:", e);
        }

      } catch (e: unknown) {
        console.error("Error loading club:", e);
        const errorObj = e as { detail?: { message?: string }; message?: string };
        setError(errorObj?.detail?.message || errorObj?.message || "Failed to load club details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(dateString));
  };

  const handleJoinClub = async () => {
    if (!club || !id) return;
    
    setJoinLoading(true);
    setError(null);
    
    try {
      if (isMember) {
        await leaveClub(id);
      } else {
        await joinClub(id);
      }
      
      // Refresh club data to get updated membership
      const updatedClub = await getClub(id);
      setClub(updatedClub);
      
      // Notify other components about membership change
      window.dispatchEvent(new CustomEvent('clubMembershipChanged', { 
        detail: { clubId: id, action: isMember ? 'leave' : 'join' } 
      }));
      
    } catch (error) {
      console.error('Error joining/leaving club:', error);
      const errorMessage = error as { detail?: { message?: string }; message?: string };
      setError(errorMessage?.detail?.message || errorMessage?.message || 
               (isMember ? 'Failed to leave club' : 'Failed to join club'));
    } finally {
      setJoinLoading(false);
    }
  };

  const getAuthorName = (user?: ClubPost["user"]) => {
    if (!user) return "Anonymous";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || "Member";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="space-y-6">
          <div className="h-8 w-64 loading-card rounded-lg"></div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="loading-card h-48 rounded-xl"></div>
              <div className="loading-card h-32 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="loading-card h-32 rounded-xl"></div>
              <div className="loading-card h-24 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container">
        <Card variant="elevated" className="text-center">
          <div className="py-8">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Club Not Found</h2>
            <p className="text-error mb-4">{error || "This club doesn't exist or is not accessible."}</p>
            <div className="flex gap-3 justify-center">
              <Link to="/discover" className="btn">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Clubs
              </Link>
              <Link to="/" className="btn-outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-8">
      {/* Club Header */}
      <div className="relative">
        {club.cover_image_url && (
          <div 
            className="h-48 bg-cover bg-center rounded-xl"
            style={{ backgroundImage: `url(${club.cover_image_url})` }}
          />
        )}
        <div className={`${club.cover_image_url ? 'absolute inset-0 bg-black/40 rounded-xl' : ''} flex items-end p-6`}>
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-3xl font-bold ${club.cover_image_url ? 'text-white' : 'section-title'}`}>
                    {club.name}
                  </h1>
                  {!club.is_private && (
                    <Badge variant="success" className="text-xs">
                      🌍 Public
                    </Badge>
                  )}
                  {club.is_private && (
                    <Badge variant="secondary" className="text-xs">
                      🔒 Private
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className={`flex items-center ${club.cover_image_url ? 'text-white/90' : 'text-muted'}`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {club.members_count} members
                  </span>
                  {club.location && (
                    <span className={`flex items-center ${club.cover_image_url ? 'text-white/90' : 'text-muted'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {club.location}
                    </span>
                  )}
                  <span className={`flex items-center ${club.cover_image_url ? 'text-white/90' : 'text-muted'}`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {club.genre}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {isLoggedIn ? (
                  <>
                    <button 
                      onClick={handleJoinClub}
                      disabled={joinLoading}
                      className={`btn ${joinLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {joinLoading ? (
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMember ? "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"} />
                        </svg>
                      )}
                      {isMember ? 'Leave Club' : 'Join Club'}
                    </button>
                    <Link to={`/club/${club.id}`} className="btn-outline">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In to Join
                    </Link>
                    <Link to="/register" className="btn-outline">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card title="About This Club" variant="elevated">
            <div className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                {club.description || "No description provided."}
              </p>
              
              {club.tags && club.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {club.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-sm font-medium text-slate-700">Max Members</span>
                  <p className="text-muted">{club.max_members}</p>
                </div>
                {club.rating && (
                  <div>
                    <span className="text-sm font-medium text-slate-700">Rating</span>
                    <p className="text-muted">
                      ⭐ {club.rating.toFixed(1)} ({club.ratings_count} reviews)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Current Book */}
          {club.current_book?.title && (
            <Card title="Currently Reading" variant="elevated">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{club.current_book.title}</h4>
                  {club.current_book.author && (
                    <p className="text-muted">by {club.current_book.author}</p>
                  )}
                  {club.current_book.progress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>Progress</span>
                        <span>{Math.round(club.current_book.progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${club.current_book.progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Recent Posts */}
          {posts.length > 0 && (
            <Card title="Recent Activity" variant="elevated">
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-800">
                            {getAuthorName(post.user)}
                          </span>
                          <Badge variant={post.type === "announcement" ? "gradient" : "secondary"} className="text-xs">
                            {post.type}
                          </Badge>
                        </div>
                        {post.title && (
                          <h5 className="font-medium text-slate-800 mb-1">{post.title}</h5>
                        )}
                        <p className="text-sm text-slate-600 line-clamp-2">{post.content}</p>
                      </div>
                      <span className="text-xs text-muted whitespace-nowrap">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Meeting */}
          {club.next_meeting && (
            <Card title="Next Meeting" variant="elevated">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-700">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(club.next_meeting.date)}
                </div>
                {club.next_meeting.location && (
                  <div className="flex items-center text-sm text-slate-700">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {club.next_meeting.location}
                  </div>
                )}
                {club.next_meeting.topic && (
                  <div className="pt-2 border-t border-slate-100">
                    <h5 className="text-sm font-medium text-slate-700 mb-1">Topic</h5>
                    <p className="text-sm text-slate-600">{club.next_meeting.topic}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Upcoming Events */}
          {events.length > 0 && (
            <Card title="Upcoming Events" variant="elevated">
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="border-b border-slate-100 last:border-b-0 pb-3 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-slate-800">
                          {event.title || event.topic || "Club Event"}
                        </h5>
                        <p className="text-xs text-muted">
                          {formatDate(event.start_time)}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted mt-1">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type === "online" ? "💻" : 
                         event.event_type === "in_person" ? "📍" : "🔀"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Club Owner */}
          <Card title="Club Leader" variant="elevated">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                {club.owner.first_name?.[0] || club.owner.username[0] || 'U'}
              </div>
              <div>
                <h5 className="text-sm font-medium text-slate-800">
                  {club.owner.first_name && club.owner.last_name 
                    ? `${club.owner.first_name} ${club.owner.last_name}`
                    : club.owner.username
                  }
                </h5>
                <p className="text-xs text-muted">Club Owner</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;