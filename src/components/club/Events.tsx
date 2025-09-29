import React, { useState } from "react";
import Card from "../common/Card";

type ClubEvent = {
    id: string;
    title: string;
    description: string;
    dateISO: string;
    location: string;
    createdByName: string;
    attendees?: number;
    maxAttendees?: number;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
};

type Props = {
    events: ClubEvent[];
    userRole: "member" | "moderator" | "owner";
    onCreateEvent?: (title: string, description: string, date: string, location: string, maxAttendees?: number) => void;
};

const Events: React.FC<Props> = ({ events, userRole, onCreateEvent }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [maxAttendees, setMaxAttendees] = useState("");

    const canManageEvents = userRole === "moderator" || userRole === "owner";

    const handleCreateEvent = () => {
        if (!title.trim() || !description.trim() || !date || !time || !location.trim()) return;
        
        const eventDateTime = `${date}T${time}:00.000Z`;
        onCreateEvent?.(
            title.trim(),
            description.trim(),
            eventDateTime,
            location.trim(),
            maxAttendees ? parseInt(maxAttendees) : undefined
        );
        
        // Reset form
        setTitle("");
        setDescription("");
        setDate("");
        setTime("");
        setLocation("");
        setMaxAttendees("");
        setShowCreateForm(false);
    };

    const getEventStatusBadge = (event: ClubEvent) => {
        const status = event.status;
        let bgColor = "bg-gray-100 text-gray-800";
        let emoji = "📅";
        
        switch (status) {
            case "upcoming":
                bgColor = "bg-blue-100 text-blue-800";
                emoji = "🗓️";
                break;
            case "ongoing":
                bgColor = "bg-green-100 text-green-800";
                emoji = "🎉";
                break;
            case "completed":
                bgColor = "bg-gray-100 text-gray-600";
                emoji = "✅";
                break;
            case "cancelled":
                bgColor = "bg-red-100 text-red-800";
                emoji = "❌";
                break;
        }
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                {emoji} {status}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {canManageEvents && (
                <Card title="Event Management">
                    <div className="space-y-3">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            {showCreateForm ? "Cancel" : "Create New Event"}
                        </button>

                        {showCreateForm && (
                            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Event title..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                                
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Event description..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    rows={3}
                                />
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                </div>
                                
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Event location..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                                
                                <input
                                    type="number"
                                    value={maxAttendees}
                                    onChange={(e) => setMaxAttendees(e.target.value)}
                                    placeholder="Max attendees (optional)"
                                    min="1"
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                                
                                <button
                                    onClick={handleCreateEvent}
                                    disabled={!title.trim() || !description.trim() || !date || !time || !location.trim()}
                                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Event
                                </button>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <div className="space-y-4">
                {events.length === 0 ? (
                    <Card>
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📅</div>
                            <p>No events scheduled yet.</p>
                            {canManageEvents && (
                                <p className="text-sm mt-2">Create your first event to get started!</p>
                            )}
                        </div>
                    </Card>
                ) : (
                    events.map(event => {
                        const eventDate = new Date(event.dateISO);
                        const formattedDate = eventDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                        </div>
                                        {getEventStatusBadge(event)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📅</span>
                                            <span>{formattedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📍</span>
                                            <span>{event.location}</span>
                                        </div>
                                        {event.attendees !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">👥</span>
                                                <span>
                                                    {event.attendees} attending
                                                    {event.maxAttendees && ` (${event.maxAttendees} max)`}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">👤</span>
                                            <span>Created by {event.createdByName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                        <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                            Attend
                                        </button>
                                        {canManageEvents && (
                                            <>
                                                <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                                    Edit
                                                </button>
                                                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Events;