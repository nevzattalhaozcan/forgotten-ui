import React, { useState } from "react";
import Card from "../common/Card";

function fmt(iso: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)); }

type Props = { dateISO: string; location: string; agenda?: string };

const GatheringCard: React.FC<Props> = ({ dateISO, location, agenda }) => {
    const [rsvp, setRsvp] = useState<"yes" | "no" | "maybe" | null>(null);
    return (
        <Card title="Upcoming Gathering">
            <div className="space-y-2">
                <div className="text-sm">📅 {fmt(dateISO)}</div>
                <div className="text-sm">📍 {location}</div>
                {agenda && <div className="text-sm text-gray-700">Agenda: {agenda}</div>}
                <div className="pt-2 flex gap-2">
                    {(["yes", "maybe", "no"] as const).map(opt => (
                        <button key={opt} className={`btn ${rsvp === opt ? "bg-gray-100" : ""}`} onClick={() => setRsvp(opt)}>
                            RSVP {opt.toUpperCase()}
                        </button>
                    ))}
                </div>
                {rsvp && <div className="text-xs text-gray-600">You responded: {rsvp.toUpperCase()}</div>}
            </div>
        </Card>
    );
};

export default GatheringCard;