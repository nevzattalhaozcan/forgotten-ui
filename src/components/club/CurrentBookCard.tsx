import React from "react";
import Card from "../common/Card";

type Props = { title: string; author: string; progressPct: number; annotations: number; discussions: number };

const CurrentBookCard: React.FC<Props> = ({ title, author, progressPct, annotations, discussions }) => (
    <Card title="Currently Reading">
        <div className="space-y-3">
            <div className="text-lg font-semibold">{title} <span className="text-gray-500 text-sm">— {author}</span></div>
            <div>
                <div className="h-2 w-full rounded bg-gray-200">
                    <div className="h-2 rounded bg-gray-800" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-600">Progress: {progressPct}%</div>
            </div>
            <div className="flex gap-4 text-sm text-gray-700">
                <span>📝 Annotations: {annotations}</span>
                <span>💬 Discussions: {discussions}</span>
            </div>
            <div className="pt-2 flex gap-2">
                <button className="btn">Share annotation</button>
                <button className="btn">Open discussion</button>
            </div>
        </div>
    </Card>
);

export default CurrentBookCard;