import React, { useMemo, useState } from "react";
import Card from "../components/common/Card";
import CurrentBookCard from "../components/club/CurrentBookCard";
import GatheringCard from "../components/club/GatheringCard";
import Feed from "../components/club/Feed";
import MemberList from "../components/club/MemberList";
import RoleGate from "../components/club/RoleGate";
import { clubDetail as seed } from "../data/clubDetail";
import { currentSession } from "../data/session";

const ClubDashboard: React.FC = () => {
    const [club, setClub] = useState(seed);
    const [showMembers, setShowMembers] = useState(false);

    const isOwner = useMemo(() => club.ownerId === currentSession.userId, [club]);
    console.log({ isOwner });
    
    const addPost: React.ComponentProps<typeof Feed>["onCreate"] = (content, as) => {
        const next = {
            id: Math.random().toString(36).slice(2),
            authorId: currentSession.userId,
            authorName: "You",
            authorRole: currentSession.roleInClub,
            type: as,
            content,
            createdAtISO: new Date().toISOString(),
        };
        setClub({ ...club, posts: [next, ...club.posts] });
    };

    return (
        <div className="container space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{club.name}</h1>
                    <p className="text-sm text-gray-600">{club.description}</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn" onClick={() => setShowMembers(true)}>
                        View members ({club.members.length})
                    </button>
                    <RoleGate allow={["owner", "moderator"]}>
                        <button className="btn">Manage users</button>
                    </RoleGate>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Feed posts={club.posts} onCreate={addPost} />
                </div>
                <div className="space-y-4">
                    <CurrentBookCard {...club.currentBook} />
                    {club.nextGathering && <GatheringCard {...club.nextGathering} />}
                    <RoleGate
                        allow={["owner"]}
                        otherwise={
                            <Card title="Owner tools">
                                <div className="text-sm text-gray-600">Owner actions are hidden.</div>
                            </Card>
                        }
                    >
                        <Card title="Owner tools">
                            <div className="space-y-2 text-sm">
                                <button className="btn w-full">Post announcement</button>
                                <button className="btn w-full">(Next step) Create poll</button>
                                <button className="btn w-full">(Next step) Edit club details</button>
                            </div>
                        </Card>
                    </RoleGate>
                </div>
            </div>

            {showMembers && <MemberList members={club.members} onClose={() => setShowMembers(false)} />}
        </div>
    );
};

export default ClubDashboard;
