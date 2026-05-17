export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary-600 animate-pulse" />
        <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
      </div>
    </div>
  );
}
