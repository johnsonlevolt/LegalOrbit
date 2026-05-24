export default function AppLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* サイドバースケルトン */}
      <div className="w-64 bg-gray-200 animate-pulse flex-shrink-0" />

      {/* メインエリアスケルトン */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* ヘッダー */}
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />

        {/* カード行 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>

        {/* コンテンツブロック */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
        </div>

        {/* テーブルブロック */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
