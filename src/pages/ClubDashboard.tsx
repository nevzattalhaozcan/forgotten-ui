import React, { useMemo, useState } from "react";
import Card from "../components/common/Card";
import CurrentBookCard from "../components/club/CurrentBookCard";
import GatheringCard from "../components/club/GatheringCard";
import Feed from "../components/club/Feed";
import MemberList from "../components/club/MemberList";
import RoleGate from "../components/club/RoleGate";
import PollCard from "../components/club/PollCard";
import PollCreator from "../components/club/PollCreator";
import ModerationPanel from "../components/club/ModerationPanel";
import { clubDetail as seed } from "../data/clubDetail";
import { samplePolls as pollsSeed, type Poll } from "../data/polls";
import { currentSession } from "../data/session";

const ClubDashboard: React.FC = () => {
    const [club, setClub] = useState(seed);
    const [polls, setPolls] = useState<Poll[]>(pollsSeed);
    const [votes, setVotes] = useState<Record<string, string>>({}); // key = pollId:userId → optionId
    const [showMembers, setShowMembers] = useState(false);
    const [showModeration, setShowModeration] = useState(false);

    const isOwner = useMemo(() => club.ownerId === currentSession.userId, [club]);
    console.log({ isOwner, club, currentSession });

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

    const vote = (pollId: string, optionId: string, userId: string) => {
        const key = `${pollId}:${userId}`;
        if (votes[key]) return; // already voted
        setVotes({ ...votes, [key]: optionId });
        setPolls(polls.map(p => {
            if (p.id !== pollId) return p;
            return { ...p, options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) };
        }));
    };

    const createPoll = (p: Poll) => setPolls([p, ...polls]);

    const promote = (id: string) =>
        setClub({ ...club, members: club.members.map(m => m.id === id ? { ...m, role: "moderator" } : m) });
    const demote = (id: string) =>
        setClub({ ...club, members: club.members.map(m => m.id === id ? { ...m, role: "member" } : m) });
    const remove = (id: string) =>
        setClub({ ...club, members: club.members.filter(m => m.id !== id) });

    return (
        <div className="container space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{club.name}</h1>
                    <p className="text-sm text-gray-600">{club.description}</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn" onClick={() => setShowMembers(true)}>View members ({club.members.length})</button>
                    <RoleGate allow={["owner", "moderator"]}>
                        <button className="btn" onClick={() => setShowModeration(true)}>Manage users</button>
                    </RoleGate>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Feed posts={club.posts} onCreate={addPost} />

                    <Card title="Polls">
                        <div className="space-y-4">
                            {polls.map(p => (
                                <PollCard
                                    key={p.id}
                                    poll={p}
                                    onVote={vote}
                                    votedOptionId={votes[`${p.id}:${currentSession.userId}`]}
                                />
                            ))}
                            {polls.length === 0 && <div className="text-sm text-gray-600">No polls yet.</div>}
                        </div>
                    </Card>
                </div>
                <div className="space-y-4">
                    <CurrentBookCard {...club.currentBook} />
                    {club.nextGathering && (<GatheringCard {...club.nextGathering} />)}

                    <RoleGate
                        allow={["owner"]}
                        otherwise={
                            <Card title="Owner tools">
                                <div className="text-sm text-gray-600">Owner actions are hidden.</div>
                            </Card>
                        }
                    >
                        <PollCreator onCreate={createPoll} />
                    </RoleGate>
                </div>
            </div>

            {showMembers && <MemberList members={club.members} onClose={() => setShowMembers(false)} />}
            {showModeration && (
                <ModerationPanel
                    me={currentSession.roleInClub}
                    members={club.members}
                    onClose={() => setShowModeration(false)}
                    onPromote={promote}
                    onDemote={demote}
                    onRemove={remove}
                />
            )}
        </div>
    );
};

export default ClubDashboard;
