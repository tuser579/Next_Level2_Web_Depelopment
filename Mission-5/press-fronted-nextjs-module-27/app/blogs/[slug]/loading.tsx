export default function Loading() {
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>

      {/* Subtitle / slug skeleton */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

      {/* Content lines skeleton */}
      <div className="space-y-2 pt-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}