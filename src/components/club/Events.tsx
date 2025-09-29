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

    return (
        <div className="space-y-4" data-testid="events-component">
            {canManageEvents && (
                <Card title="Event Management" data-testid="event-management-card">
                    <div className="space-y-3">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            data-testid="toggle-create-event-button"
                        >
                            {showCreateForm ? "Cancel" : "Create New Event"}
                        </button>

                        {showCreateForm && (
                            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50" data-testid="create-event-form">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Event title..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    data-testid="event-title-input"
                                />
                                
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Event description..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    rows={3}
                                    data-testid="event-description-input"
                                />
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        data-testid="event-date-input"
                                    />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        data-testid="event-time-input"
                                    />
                                </div>
                                
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Event location..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    data-testid="event-location-input"
                                />
                                
                                <input
                                    type="number"
                                    value={maxAttendees}
                                    onChange={(e) => setMaxAttendees(e.target.value)}
                                    placeholder="Max attendees (optional)"
                                    min="1"
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    data-testid="event-max-attendees-input"
                                />
                                
                                <button
                                    onClick={handleCreateEvent}
                                    disabled={!title.trim() || !description.trim() || !date || !time || !location.trim()}
                                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    data-testid="create-event-submit-button"
                                >
                                    Create Event
                                </button>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <div className="space-y-4" data-testid="events-list">
                {events.length === 0 ? (
                    <Card data-testid="no-events-placeholder">
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
                            <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`event-card-${event.id}`}>
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900" data-testid={`event-title-${event.id}`}>{event.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1" data-testid={`event-description-${event.id}`}>{event.description}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${(() => {
                                            const status = event.status;
                                            switch (status) {
                                                case "upcoming":
                                                    return "bg-blue-100 text-blue-800";
                                                case "ongoing":
                                                    return "bg-green-100 text-green-800";
                                                case "completed":
                                                    return "bg-gray-100 text-gray-600";
                                                case "cancelled":
                                                    return "bg-red-100 text-red-800";
                                                default:
                                                    return "bg-gray-100 text-gray-800";
                                            }
                                        })()}`} data-testid={`event-status-${event.id}`}>
                                            {(() => {
                                                switch (event.status) {
                                                    case "upcoming":
                                                        return "🗓️";
                                                    case "ongoing":
                                                        return "🎉";
                                                    case "completed":
                                                        return "✅";
                                                    case "cancelled":
                                                        return "❌";
                                                    default:
                                                        return "📅";
                                                }
                                            })()} {event.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" data-testid={`event-details-${event.id}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📅</span>
                                            <span data-testid={`event-datetime-${event.id}`}>{formattedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📍</span>
                                            <span data-testid={`event-location-${event.id}`}>{event.location}</span>
                                        </div>
                                        {event.attendees !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">👥</span>
                                                <span data-testid={`event-attendees-${event.id}`}>
                                                    {event.attendees} attending
                                                    {event.maxAttendees && ` (${event.maxAttendees} max)`}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">👤</span>
                                            <span data-testid={`event-creator-${event.id}`}>Created by {event.createdByName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100" data-testid={`event-actions-${event.id}`}>
                                        <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" data-testid={`attend-event-${event.id}`}>
                                            Attend
                                        </button>
                                        {canManageEvents && (
                                            <>
                                                <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors" data-testid={`edit-event-${event.id}`}>
                                                    Edit
                                                </button>
                                                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" data-testid={`cancel-event-${event.id}`}>
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