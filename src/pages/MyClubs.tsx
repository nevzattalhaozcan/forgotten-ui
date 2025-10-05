import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { listClubs, getUserClubs, type ClubApi } from "../lib/clubs";

const MyClubs: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myClubs, setMyClubs] = useState<ClubApi[]>([]);
  const [recommendedClubs, setRecommendedClubs] = useState<ClubApi[]>([]);

  const isLoggedIn = !!localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const loadClubs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's clubs using the new approach
      const userClubs = await getUserClubs();
      setMyClubs(userClubs);

      // Fetch all clubs for recommendations
      const allClubs = await listClubs();

      // Get recommended clubs (public clubs user hasn't joined)
      const recommendedClubs = allClubs.filter(club => {
        const isUserClub = userClubs.some(userClub => userClub.id === club.id);
        return !club.is_private && !isUserClub;
      }).slice(0, 6);
      setRecommendedClubs(recommendedClubs);

    } catch (e: unknown) {
      console.error("Error loading clubs:", e);
      const errorObj = e as { detail?: { message?: string }; message?: string };
      setError(errorObj?.detail?.message || errorObj?.message || "Failed to load clubs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    // Initial load
    loadClubs();

    // Listen for club membership changes
    const handleClubMembershipChange = () => {
      loadClubs();
    };

    window.addEventListener('clubMembershipChanged', handleClubMembershipChange);

    return () => {
      window.removeEventListener('clubMembershipChanged', handleClubMembershipChange);
    };
  }, [isLoggedIn, navigate, loadClubs]);

  const getUserRole = (club: ClubApi): string => {
    if (!club.members) return "member";
    const userMember = club.members.find(member => String(member.user_id) === userId);
    if (!userMember) return "member";
    return userMember.role === "club_admin" ? "owner" : userMember.role;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner": return "gradient";
      case "moderator": return "success";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="space-y-6">
          <div className="h-8 w-48 loading-card rounded-lg"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="loading-card h-48 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Card variant="elevated" className="text-center">
          <div className="py-8">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Clubs</h2>
            <p className="text-error mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn">
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-8">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">My Clubs</h1>
          <p className="text-muted mt-1">Manage your reading communities and discover new ones</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadClubs}
            disabled={loading}
            className={`
              px-4 py-2 rounded-lg border font-medium text-sm transition-all duration-200 shadow-sm
              ${loading 
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
              }
            `}
            title="Refresh clubs"
          >
            <svg className={`w-4 h-4 mr-2 transition-transform duration-200 ${loading ? 'animate-spin' : 'hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link 
            to="/discover" 
            className="px-4 py-2 rounded-lg border font-medium text-sm transition-all duration-200 shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover Clubs
          </Link>
          <button className="px-4 py-2 rounded-lg border font-medium text-sm transition-all duration-200 shadow-sm bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg">
            <svg className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Club
          </button>
        </div>
      </div>

      {/* My Clubs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-subtitle flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Your Clubs
          </h2>
          {myClubs.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {myClubs.length} clubs
            </Badge>
          )}
        </div>

        {myClubs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myClubs.map((club) => (
              <Card key={club.id} variant="elevated" className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="space-y-4">
                  {/* Club Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {club.name}
                      </h3>
                      <p className="text-muted text-sm line-clamp-2 mt-1">
                        {club.description || "No description"}
                      </p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(getUserRole(club))} className="text-xs ml-2 flex-shrink-0">
                      {getUserRole(club)}
                    </Badge>
                  </div>

                  {/* Club Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {club.members_count} members
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {club.genre}
                      </span>
                    </div>

                    {club.location && (
                      <div className="flex items-center text-xs text-muted">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {club.location}
                      </div>
                    )}

                    {/* Currently Reading */}
                    {club.current_book?.title && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center text-xs text-muted">
                          <svg className="w-3 h-3 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                          Currently: <span className="font-medium ml-1">{club.current_book.title}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link 
                      to={`/club/${club.id}`}
                      className="flex-1 text-center px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Open Club
                    </Link>
                    <Link 
                      to={`/club/${club.id}/details`}
                      className="px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md shadow-sm"
                      title="View club details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="glass" className="text-center">
            <div className="py-12">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Clubs Yet</h3>
              <p className="text-muted mb-6 max-w-md mx-auto">
                You haven't joined any book clubs yet. Discover amazing reading communities and start your literary journey!
              </p>
              <Link to="/discover" className="btn btn-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Clubs to Join
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Recommended Clubs */}
      {recommendedClubs.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="section-subtitle flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommended for You
            </h2>
            <Link to="/discover" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedClubs.map((club) => (
              <Card key={club.id} variant="default" className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <div className="space-y-4">
                  {/* Club Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {club.name}
                      </h3>
                      <p className="text-muted text-sm line-clamp-2 mt-1">
                        {club.description || "No description"}
                      </p>
                    </div>
                    <Badge variant="success" className="text-xs ml-2 flex-shrink-0">
                      🌍 Public
                    </Badge>
                  </div>

                  {/* Club Info */}
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {club.members_count} members
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {club.genre}
                    </span>
                    {club.rating && (
                      <span className="flex items-center">
                        ⭐ {club.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link 
                      to={`/club/${club.id}/details`}
                      className="flex-1 text-center px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Link>
                    <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg shadow-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Join
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClubs;