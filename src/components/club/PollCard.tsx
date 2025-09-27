import React, { useMemo, useState } from "react";
import Card from "../common/Card";
import { type Poll } from "../../data/polls";
import { currentSession } from "../../data/session";

function totalVotes(p: Poll) { return p.options.reduce((a, b) => a + b.votes, 0); }

type Props = {
    poll: Poll;
    onVote: (pollId: string, optionId: string, userId: string) => void;
    votedOptionId?: string | null;
};

const PollCard: React.FC<Props> = ({ poll, onVote, votedOptionId }) => {
    const [selected, setSelected] = useState<string | null>(votedOptionId ?? null);
    const sum = useMemo(() => totalVotes(poll), [poll]);
    const disabled = !!votedOptionId;

    return (
        <Card title={poll.question}>
            <div className="space-y-3">
                {poll.options.map(opt => {
                    const pct = sum === 0 ? 0 : Math.round((opt.votes / sum) * 100);
                    const active = votedOptionId === opt.id;
                    return (
                        <label key={opt.id} className="block">
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name={`poll-${poll.id}`}
                                    disabled={disabled}
                                    checked={selected === opt.id}
                                    onChange={() => setSelected(opt.id)}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={`font-medium ${active ? "underline" : ""}`}>{opt.label}</span>
                                        <span className="text-gray-600">{pct}% ({opt.votes})</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full rounded bg-gray-200">
                                        <div className="h-2 rounded bg-gray-800" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            </div>
                        </label>
                    );
                })}
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Total votes: {sum}</span>
                    {disabled ? (
                        <span>Thanks for voting!</span>
                    ) : (
                        <button
                            className="btn"
                            onClick={() => { if (!selected) return; onVote(poll.id, selected, currentSession.userId); }}
                        >
                            Submit vote
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default PollCard;
