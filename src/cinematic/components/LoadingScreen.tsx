interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Preparing cinematic experience..." }: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-brand">St. Stephen's College</div>
      <div className="loading-line" />
      <p>{message}</p>
    </div>
  );
}
