export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="ml-3 text-blue-600 font-medium">Loading... Please wait...</p>
      </div>
    </div>
  );
}