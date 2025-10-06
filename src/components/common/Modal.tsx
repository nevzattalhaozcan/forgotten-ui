import React from "react";

type ModalTone = "default" | "danger" | "success" | "info" | "warning";

export type ModalProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  actions?: React.ReactNode;
  tone?: ModalTone;
};

export default function Modal({
  title,
  subtitle,
  children,
  open,
  onClose,
  actions,
  tone = "default",
}: ModalProps) {
  if (!open) return null;

  const toneStyles: Record<ModalTone, { badge: string; iconBg: string; iconColor: string }> = {
    default: {
      badge: "bg-slate-100 text-slate-600 border border-slate-200",
      iconBg: "bg-slate-200",
      iconColor: "text-slate-600",
    },
    danger: {
      badge: "bg-red-50 text-red-700 border border-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    success: {
      badge: "bg-green-50 text-green-700 border border-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    info: {
      badge: "bg-blue-50 text-blue-700 border border-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    warning: {
      badge: "bg-yellow-50 text-yellow-800 border border-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
  };

  const iconPaths: Record<ModalTone, React.ReactNode> = {
    default: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    danger: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M9.172 18H14.83a2 2 0 001.414-.586l3.172-3.172a2 2 0 000-2.828L16.244 8.17A2 2 0 0014.83 7H9.172a2 2 0 00-1.414.586L4.586 10.758a2 2 0 000 2.828l3.172 3.172A2 2 0 009.172 18z" />
    ),
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    warning: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M19.938 18H4.062a1 1 0 01-.894-1.447l7.938-14a1 1 0 011.788 0l7.938 14A1 1 0 0119.938 18z" />
    ),
  };

  const toneStyle = toneStyles[tone];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={`flex items-center gap-3 px-6 py-5 ${toneStyle.badge}`}>
          <span className={`flex h-12 w-12 items-center justify-center rounded-full ${toneStyle.iconBg} ${toneStyle.iconColor}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              {iconPaths[tone]}
            </svg>
          </span>
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
          </div>
        </div>

        <div className="px-6 py-5 text-sm text-slate-600">{children}</div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          {actions ?? (
            <button className="btn" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
