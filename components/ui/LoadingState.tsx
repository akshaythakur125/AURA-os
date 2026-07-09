interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-400" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
