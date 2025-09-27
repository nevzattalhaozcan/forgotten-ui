import React from "react";

type Props = {
    booksRead: number;
    meetingsAttended: number;
    notesShared: number;
    streakDays: number;
};

const Stat: React.FC<{ label: string; value: number | string; }> = ({ label, value }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
    </div>
);

const StatsRow: React.FC<Props> = (s) => (
    <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Books read" value={s.booksRead} />
        <Stat label="Meetings attended" value={s.meetingsAttended} />
        <Stat label="Notes shared" value={s.notesShared} />
        <Stat label="Reading streak (days)" value={s.streakDays} />
    </div>
);

export default StatsRow;