export function ReleaseBanner() {
  if (process.env.NEXT_PUBLIC_RELEASE_STAGE !== 'beta') return null
  return (
    <div className="bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 print:hidden">
      β版です。AI出力・PDF転記・テンプレート内容は必ず人間が確認してから提出してください。
    </div>
  )
}
