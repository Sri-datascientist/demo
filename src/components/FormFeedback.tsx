export function FormFeedback({
  error,
  success,
  loading,
  loadingText = 'Saving...',
}: {
  error?: string;
  success?: string;
  loading?: boolean;
  loadingText?: string;
}) {
  if (loading) {
    return <p className="text-sm text-neutral-600 font-medium">{loadingText}</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-red-700 font-medium rounded-xl bg-red-50 border border-red-200 px-4 py-3">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="text-sm text-green-800 font-medium rounded-xl bg-green-50 border border-green-200 px-4 py-3">
        {success}
      </p>
    );
  }
  return null;
}
