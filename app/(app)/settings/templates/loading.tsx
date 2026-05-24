export default function TemplatesLoading() {
  return (
    <div className="space-y-6">
      {/* h1 + ボタンのスケルトン */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-9 bg-gray-200 rounded animate-pulse w-28" />
      </div>

      {/* カード 3枚分のスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
