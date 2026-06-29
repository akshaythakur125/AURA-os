"use client";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, action, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="mb-2 text-lg text-gray-300">{title}</p>
      <p className="mb-6 text-sm text-gray-500 max-w-md">{message}</p>
      <div className="flex gap-3">
        {action}
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/10"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
