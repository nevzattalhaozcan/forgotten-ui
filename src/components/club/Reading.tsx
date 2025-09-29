import React, { useState } from "react";
import Card from "../common/Card";

type Book = {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    pages?: number;
    assignedDate?: string;
    targetDate?: string;
    status: "current" | "completed" | "upcoming";
};

type ReadingLog = {
    id: string;
    userId: string;
    userName: string;
    bookId: string;
    pagesRead: number;
    totalPages: number;
    note?: string;
    createdAtISO: string;
};

type Props = {
    books: Book[];
    readingLogs: ReadingLog[];
    userRole: "member" | "moderator" | "owner";
    onAssignBook?: (title: string, author: string, pages: number, targetDate?: string) => void;
    onAddReadingLog?: (bookId: string, pagesRead: number, note?: string) => void;
};

const Reading: React.FC<Props> = ({ books, readingLogs, userRole, onAssignBook, onAddReadingLog }) => {
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const [selectedBook, setSelectedBook] = useState("");
    
    // Assign book form
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [pages, setPages] = useState("");
    const [targetDate, setTargetDate] = useState("");
    
    // Reading log form
    const [pagesRead, setPagesRead] = useState("");
    const [note, setNote] = useState("");

    const canManageReading = userRole === "moderator" || userRole === "owner";
    const currentBook = books.find(book => book.status === "current");

    const handleAssignBook = () => {
        if (!title.trim() || !author.trim() || !pages) return;
        
        onAssignBook?.(
            title.trim(),
            author.trim(),
            parseInt(pages),
            targetDate || undefined
        );
        
        // Reset form
        setTitle("");
        setAuthor("");
        setPages("");
        setTargetDate("");
        setShowAssignForm(false);
    };

    const handleAddLog = () => {
        if (!selectedBook || !pagesRead) return;
        
        onAddReadingLog?.(
            selectedBook,
            parseInt(pagesRead),
            note.trim() || undefined
        );
        
        // Reset form
        setSelectedBook("");
        setPagesRead("");
        setNote("");
        setShowLogForm(false);
    };

    const getBookProgress = (bookId: string, totalPages: number) => {
        const bookLogs = readingLogs.filter(log => log.bookId === bookId);
        const totalRead = bookLogs.reduce((sum, log) => sum + log.pagesRead, 0);
        const progress = Math.min((totalRead / totalPages) * 100, 100);
        return { totalRead, progress };
    };

    const getBookStatusBadge = (status: Book["status"]) => {
        switch (status) {
            case "current":
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">📖 Reading</span>;
            case "completed":
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">✅ Completed</span>;
            case "upcoming":
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Upcoming</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {canManageReading && (
                <Card title="Reading Management">
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAssignForm(!showAssignForm)}
                                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                                {showAssignForm ? "Cancel" : "Assign Book"}
                            </button>
                            <button
                                onClick={() => setShowLogForm(!showLogForm)}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                {showLogForm ? "Cancel" : "Add Reading Log"}
                            </button>
                        </div>

                        {showAssignForm && (
                            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Book title..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Author name..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={pages}
                                        onChange={(e) => setPages(e.target.value)}
                                        placeholder="Total pages"
                                        min="1"
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>
                                <button
                                    onClick={handleAssignBook}
                                    disabled={!title.trim() || !author.trim() || !pages}
                                    className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Assign Book
                                </button>
                            </div>
                        )}

                        {showLogForm && (
                            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <select
                                    value={selectedBook}
                                    onChange={(e) => setSelectedBook(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                >
                                    <option value="">Select a book...</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} by {book.author}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={pagesRead}
                                    onChange={(e) => setPagesRead(e.target.value)}
                                    placeholder="Pages read"
                                    min="1"
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                />
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add a note (optional)..."
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                    rows={3}
                                />
                                <button
                                    onClick={handleAddLog}
                                    disabled={!selectedBook || !pagesRead}
                                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Reading Log
                                </button>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Current Book Section */}
            {currentBook && (
                <Card title="Current Book" className="border-l-4 border-green-500">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{currentBook.title}</h3>
                                <p className="text-gray-600">by {currentBook.author}</p>
                                {getBookStatusBadge(currentBook.status)}
                            </div>
                        </div>

                        {currentBook.pages && (
                            <div className="space-y-2">
                                {(() => {
                                    const { totalRead, progress } = getBookProgress(currentBook.id, currentBook.pages);
                                    return (
                                        <>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>{totalRead} of {currentBook.pages} pages</span>
                                                <span>{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {currentBook.targetDate && (
                            <div className="text-sm text-gray-600">
                                Target completion: {new Date(currentBook.targetDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* All Books */}
            <Card title="Book Library">
                <div className="space-y-4">
                    {books.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📚</div>
                            <p>No books assigned yet.</p>
                            {canManageReading && (
                                <p className="text-sm mt-2">Assign your first book to get started!</p>
                            )}
                        </div>
                    ) : (
                        books.map(book => {
                            const { totalRead, progress } = book.pages ? getBookProgress(book.id, book.pages) : { totalRead: 0, progress: 0 };
                            
                            return (
                                <div key={book.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{book.title}</h4>
                                            <p className="text-sm text-gray-600">by {book.author}</p>
                                        </div>
                                        {getBookStatusBadge(book.status)}
                                    </div>

                                    {book.pages && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>{totalRead} of {book.pages} pages</span>
                                                <span>{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                <div 
                                                    className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* Recent Reading Activity */}
            {readingLogs.length > 0 && (
                <Card title="Recent Reading Activity">
                    <div className="space-y-3">
                        {readingLogs.slice(0, 5).map(log => {
                            const book = books.find(b => b.id === log.bookId);
                            const logDate = new Date(log.createdAtISO).toLocaleDateString();
                            
                            return (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {log.userName} read {log.pagesRead} pages
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {book?.title} • {logDate}
                                        </div>
                                        {log.note && (
                                            <div className="text-xs text-gray-500 mt-1 italic">
                                                "{log.note}"
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {log.totalPages && `${((log.pagesRead / log.totalPages) * 100).toFixed(1)}%`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Reading;