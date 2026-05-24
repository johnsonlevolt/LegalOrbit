export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* h1スケルトン */}
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />

      {/* サマリーカード 4枚 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>

      {/* テーブル1 */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
        {/* テーブルヘッダー */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
        </div>
        {/* テーブル行 5行 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        ))}
      </div>

      {/* テーブル2 */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
        {/* テーブルヘッダー */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        {/* テーブル行 5行 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
