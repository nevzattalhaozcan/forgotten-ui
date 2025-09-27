import React, { useState } from "react";
import Card from "../components/common/Card";
import ProfileCard from "../components/user/ProfileCard";
import StatsRow from "../components/user/StatsRow";
import EditableField from "../components/user/EditableField";
import { currentUser as seed, type User } from "../data/users";

const UserDashboard: React.FC = () => {
    const [user, setUser] = useState<User>(seed);

    const update = (patch: Partial<User>) => setUser({ ...user, ...patch });
    const updatePrefs = (patch: Partial<User["preferences"]>) => update({ preferences: { ...user.preferences, ...patch } });


    return (
        <div className="container space-y-6">
            <h1 className="text-2xl font-bold">Your Profile</h1>

            <ProfileCard
                name={user.name}
                email={user.email}
                city={user.city}
                bio={user.bio}
                avatarUrl={user.avatarUrl}
                favoriteGenres={user.preferences.favoriteGenres}
            />

            <Card title="Edit Details">
                <div className="grid gap-6 sm:grid-cols-2">
                    <EditableField label="Name" value={user.name} onSave={(val) => update({ name: val })} />
                    <EditableField label="City" value={user.city ?? ""} onSave={(val) => update({ city: val })} placeholder="Your city" />
                    <div className="sm:col-span-2">
                        <EditableField label="Bio" value={user.bio ?? ""} onSave={(val) => update({ bio: val })} placeholder="A few words about you" multiline />
                    </div>
                </div>
            </Card>

            <Card title="Reading Stats">
                <StatsRow
                    booksRead={user.stats.booksRead}
                    meetingsAttended={user.stats.meetingsAttended}
                    notesShared={user.stats.notesShared}
                    streakDays={user.stats.streakDays}
                />
            </Card>

            <Card title="Preferences">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-700">Favorite genres:</span>
                        {user.preferences.favoriteGenres.map((g, i) => (
                            <span key={g + i} className="badge">{g}</span>
                        ))}
                        <button
                            className="btn"
                            onClick={() => updatePrefs({ favoriteGenres: [...user.preferences.favoriteGenres, "new-genre"] })}
                        >+ Add example</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={user.preferences.notifyUpcomingEvents}
                                onChange={(e) => updatePrefs({ notifyUpcomingEvents: e.target.checked })}
                            />
                            Notify me about upcoming events
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={user.preferences.weeklyDigest}
                                onChange={(e) => updatePrefs({ weeklyDigest: e.target.checked })}
                            />
                            Send weekly digest
                        </label>
                    </div>
                </div>
            </Card>

            <div className="text-xs text-gray-500">Changes are local only (no backend yet).</div>
        </div>
    );
};

export default UserDashboard;