import React, { useState } from "react";
import Card from "../common/Card";
import { type DiscussionThread } from "../../data/threads";
import { currentSession } from "../../data/session";

function since(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.round(ms / 36e5); if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24); return `${d}d ago`;
}

type Props = {
  thread: DiscussionThread;
  onAddComment: (threadId: string, text: string) => void;
};

const DiscussionThreadCard: React.FC<Props> = ({ thread, onAddComment }) => {
  const [text, setText] = useState("");

  return (
    <Card title={`${thread.title}`} actions={<span className="badge">by {thread.authorName}</span>}>
      <div className="space-y-3">
        <div className="text-xs text-gray-600">Opened {since(thread.createdAtISO)} {thread.chapter && `• Ch. ${thread.chapter}`}</div>
        {thread.quote && <blockquote className="text-sm italic text-gray-700 border-l-4 pl-3">“{thread.quote}”</blockquote>}

        <div className="space-y-3">
          {thread.comments.map(c => (
            <div key={c.id} className="rounded-2xl border border-gray-100 bg-white p-3">
              <div className="text-xs text-gray-600 mb-1">{c.authorName} • {since(c.createdAtISO)}</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{c.text}</div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <textarea
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Add a comment…"
            value={text}
            onChange={e=>setText(e.target.value)}
          />
          <div className="text-right pt-2">
            <button className="btn" onClick={()=>{
              if(!text.trim()) return;
              onAddComment(thread.id, text.trim());
              setText("");
            }}>
              Comment as {currentSession.userId === "u1" ? "You" : "Member"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DiscussionThreadCard;
