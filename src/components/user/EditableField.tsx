import React, { useState } from "react";

type Props = {
    label: string;
    value: string;
    placeholder?: string;
    onSave: (val: string) => void;
    multiline?: boolean;
};

const EditableField: React.FC<Props> = ({ label, value, onSave, placeholder, multiline }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    const [error, setError] = useState<string | null>(null);

    const save = () => {
        if (val.trim().length === 0) { setError("Cannot be empty"); return; }
        setError(null);
        onSave(val.trim());
        setEditing(false);
    };

    const inputBase = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

    return (
        <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            {!editing ? (
                <div className="flex items-center justify-between gap-3">
                    <div className={`text-sm ${value ? "text-gray-900" : "text-gray-500"}`}>{value || (placeholder ?? "—")}</div>
                    <button className="btn" onClick={() => { setVal(value); setEditing(true); }}>Edit</button>
                </div>
            ) : (
                <div className="space-y-2">
                    {multiline ? (
                        <textarea className={`${inputBase} h-24`} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} />
                    ) : (
                        <input className={inputBase} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} />
                    )}
                    {error && <div className="text-xs text-red-600">{error}</div>}
                    <div className="flex items-center gap-2">
                        <button className="btn" onClick={save}>Save</button>
                        <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditableField;