import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, type RegisterData } from "../lib/auth";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";

const GENRE_OPTIONS = [
  "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy",
  "Thriller", "Biography", "History", "Self-Help", "Poetry", "Horror", 
  "Young Adult", "Children", "Classic", "Contemporary", "Literary Fiction"
];

const Register: React.FC = () => {
  const nav = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    is_active: true,
    role: "user",
    avatar_url: "",
    location: "",
    favorite_genres: [],
    bio: "",
    reading_goal: 12
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof RegisterData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres?.includes(genre)
        ? prev.favorite_genres.filter(g => g !== genre)
        : [...(prev.favorite_genres || []), genre]
    }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    // Validation
    if (formData.password !== confirmPassword) {
      setErr("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    if (!formData.username || !formData.email || !formData.first_name || !formData.last_name) {
      setErr("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Clean up form data - remove empty strings and set defaults
      const cleanData: RegisterData = {
        ...formData,
        avatar_url: formData.avatar_url || undefined,
        location: formData.location || undefined,
        bio: formData.bio || undefined,
        favorite_genres: formData.favorite_genres?.length ? formData.favorite_genres : undefined,
      };

      const { message } = await register(cleanData);
      setSuccess(message);
      
      // Redirect after success
      setTimeout(() => {
        nav("/login", { 
          state: { 
            message: "Registration successful! Please sign in." 
          } 
        });
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.detail?.message || e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card variant="elevated" className="text-center">
            <div className="py-8">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome to BookClub!</h2>
              <p className="text-success mb-4">{success}</p>
              <p className="text-muted">Redirecting you to sign in...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h1 className="section-title mb-2">Join BookClub</h1>
          <p className="text-muted">Create your account and start your reading journey</p>
        </div>

        <Card variant="elevated">
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={e => handleInputChange("first_name", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={e => handleInputChange("last_name", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                    Username *
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={e => handleInputChange("username", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={e => handleInputChange("password", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Reading Profile
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="e.g. Istanbul, Turkey"
                      value={formData.location}
                      onChange={e => handleInputChange("location", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="reading_goal" className="block text-sm font-medium text-slate-700 mb-2">
                      Annual Reading Goal
                    </label>
                    <input
                      id="reading_goal"
                      type="number"
                      min="1"
                      max="365"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="12"
                      value={formData.reading_goal}
                      onChange={e => handleInputChange("reading_goal", parseInt(e.target.value) || 12)}
                    />
                    <p className="text-xs text-muted mt-1">How many books do you want to read this year?</p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="avatar_url" className="block text-sm font-medium text-slate-700 mb-2">
                    Avatar URL
                  </label>
                  <input
                    id="avatar_url"
                    type="url"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="https://example.com/your-photo.jpg"
                    value={formData.avatar_url}
                    onChange={e => handleInputChange("avatar_url", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Tell us about yourself and your reading interests..."
                    value={formData.bio}
                    onChange={e => handleInputChange("bio", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Favorite Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_OPTIONS.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className="transition-all duration-200"
                      >
                        <Badge 
                          variant={formData.favorite_genres?.includes(genre) ? "gradient" : "outline"}
                          className="cursor-pointer hover:scale-105"
                        >
                          {genre}
                        </Badge>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Selected: {formData.favorite_genres?.length || 0} genres
                  </p>
                </div>
              </div>
            </div>

            {err && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700">{err}</span>
                </div>
              </div>
            )}

            <button 
              className="w-full btn btn-lg" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-muted hover:text-slate-800 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;