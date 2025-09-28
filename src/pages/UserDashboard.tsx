import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import EditableField from "../components/user/EditableField";
import Badge from "../components/common/Badge";
import { getUser, updateUser, type UserApi } from "../lib/users";

type ViewUser = {
  id: string | number;
  name: string;
  email: string;
  city?: string;
  bio?: string;
  avatar?: string;
  favoriteGenres: string[];
  readingGoal?: number;
  role?: string;
};

export default function UserDashboard() {
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [u, setU] = useState<ViewUser>({
    id: userId || "",
    name: "",
    email: "",
    favoriteGenres: [],
  });

  useEffect(() => {
    if (!userId) { setErr("No userId in session"); setLoading(false); return; }
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const api = await getUser(userId);
        setU({
          id: api.id,
          name: api.username || [api.first_name, api.last_name].filter(Boolean).join(" ") || api.email,
          email: api.email,
          city: api.location,
          bio: api.bio,
          avatar: api.avatar_url,
          favoriteGenres: api.favorite_genres ?? [],
          readingGoal: api.reading_goal,
          role: api.role,
        });
      } catch (e: any) {
        setErr(e?.detail?.message || e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function save<K extends keyof ViewUser>(key: K, value: ViewUser[K]) {
    if (!userId) return;
    try {
      setErr(null);
      // Map UI fields → API fields
      const patch: Partial<UserApi> = {};
      if (key === "name") {
        // Prefer username (your backend has both username and first/last)
        patch.username = String(value);
      } else if (key === "city") {
        patch.location = String(value || "");
      } else if (key === "bio") {
        patch.bio = String(value || "");
      } else if (key === "favoriteGenres") {
        patch.favorite_genres = value as string[];
      } else if (key === "readingGoal") {
        patch.reading_goal = Number(value);
      } else if (key === "avatar") {
        patch.avatar_url = String(value || "");
      }
      const updated = await updateUser(userId, patch);
      setU(prev => ({
        ...prev,
        name: updated.username || [updated.first_name, updated.last_name].filter(Boolean).join(" ") || updated.email,
        city: updated.location,
        bio: updated.bio,
        avatar: updated.avatar_url,
        favoriteGenres: updated.favorite_genres ?? [],
        readingGoal: updated.reading_goal,
        role: updated.role,
        email: updated.email,
      }));
    } catch (e: any) {
      setErr(e?.detail?.message || e?.message || "Failed to update profile");
    }
  }

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

  if (err) {
    return (
      <div className="container space-y-4">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <div className="card p-5 text-sm text-red-700">Error: {err}</div>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      <header className="flex items-center gap-4">
        {u.avatar ? (
          <img src={u.avatar} alt={u.name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{u.name}</h1>
          <div className="text-sm text-gray-600">{u.email}</div>
          {u.role && <div className="text-xs text-gray-600">Role: {u.role}</div>}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="About you">
            <div className="space-y-3">
              <EditableField label="Display name" value={u.name} onSave={v => save("name", v)} />
              <EditableField label="City" value={u.city ?? ""} onSave={v => save("city", v)} />
              <EditableField label="Bio" value={u.bio ?? ""} multiline onSave={v => save("bio", v)} />
              <EditableField label="Avatar URL" value={u.avatar ?? ""} onSave={v => save("avatar", v)} />
            </div>
          </Card>

          <Card title="Reading goals">
            <div className="space-y-3">
              <EditableField
                label="Yearly goal (books)"
                value={String(u.readingGoal ?? "")}
                onSave={v => save("readingGoal", v ? Number(v) : 0)}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Favorite genres">
            <div className="flex flex-wrap gap-2 mb-3">
              {u.favoriteGenres.length ? u.favoriteGenres.map(g => <Badge key={g}>{g}</Badge>) : <div className="text-sm text-gray-600">None</div>}
            </div>
            <EditableField
              label="Comma-separated genres"
              value={u.favoriteGenres.join(", ")}
              onSave={v => {
                const arr = v.split(",").map(s => s.trim()).filter(Boolean);
                save("favoriteGenres", arr);
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
