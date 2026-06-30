interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="mb-2 text-sm font-semibold text-red-300">{title}</h3>
      <p className="mb-6 max-w-xs text-xs text-gray-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="inline-flex items-center justify-center rounded-xl border border-purple-500/50 px-5 py-2.5 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/10">Try Again</button>
      )}
    </div>
  );
}
