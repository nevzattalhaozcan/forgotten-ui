import React from "react";
import Badge from "../common/Badge";

export type ProfileProps = {
    name: string;
    email: string;
    city?: string;
    bio?: string;
    avatarUrl?: string;
    favoriteGenres: string[];
};

const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const ProfileCard: React.FC<ProfileProps> = ({ name, email, city, bio, avatarUrl, favoriteGenres }) => {
    return (
        <div className="card">
            <div className="card-body flex items-start gap-4">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="h-16 w-16 rounded-2xl object-cover" />
                ) : (
                    <div className="h-16 w-16 rounded-2xl bg-gray-200 flex items-center justify-center text-lg font-semibold">{initials(name)}</div>
                )}
                <div className="flex-1 space-y-2">
                    <div className="text-lg font-semibold">{name}</div>
                    <div className="text-sm text-gray-600">{email}</div>
                    {city && <div className="text-sm">📍 {city}</div>}
                    {bio && <p className="text-sm text-gray-700">{bio}</p>}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {favoriteGenres.map(g => <Badge key={g}>{g}</Badge>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;