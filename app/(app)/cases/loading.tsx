export default function CasesLoading() {
  return (
    <div className="space-y-6">
      {/* h1 + ボタンのスケルトン */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
        <div className="h-9 bg-gray-200 rounded animate-pulse w-24" />
      </div>

      {/* フィルターバーのスケルトン */}
      <div className="flex gap-2 flex-wrap">
        <div className="h-9 bg-gray-200 rounded animate-pulse w-48" />
        <div className="h-9 bg-gray-200 rounded animate-pulse w-32" />
        <div className="h-9 bg-gray-200 rounded animate-pulse w-32" />
        <div className="h-9 bg-gray-200 rounded animate-pulse w-24" />
      </div>

      {/* テーブル 8行分 */}
      <div className="border rounded-lg p-4 space-y-3">
        {/* テーブルヘッダー */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
        </div>
        {/* テーブル行 8行 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
