export default function PosLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-violet-500" />
        <p className="text-sm text-gray-400">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
