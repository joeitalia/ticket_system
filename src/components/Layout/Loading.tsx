export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="ml-3 text-blue-600 font-medium">Loading... Please wait...</p>
    </div>
  );
}