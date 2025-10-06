type AlertProps = {
  message: string;
  type?: "error" | "success" | "info" | "warning";
  onClose?: () => void;
};

export default function Alert({ message, type = "error", onClose }: AlertProps) {
  const base = "p-3 rounded flex items-start gap-3";
  const variants: Record<string, string> = {
    error: "bg-red-50 border border-red-200 text-red-800",
    success: "bg-green-50 border border-green-200 text-green-800",
    info: "bg-blue-50 border border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border border-yellow-200 text-yellow-800",
  };

  return (
    <div className={`${base} ${variants[type]}`} role="alert" aria-live="polite">
      <div className="flex-1 text-sm">
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="text-sm font-medium opacity-80 hover:opacity-100 px-2 py-1 rounded"
        >
          Close
        </button>
      )}
    </div>
  );
}
