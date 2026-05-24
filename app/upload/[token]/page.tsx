import { UploadClientForm } from '@/components/portal/upload-client-form'

interface Props {
  params: Promise<{ token: string }>
}

export default async function UploadPortalPage(props: Props) {
  const { token } = await props.params
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">資料アップロード</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          事務所から案内された資料をアップロードしてください。
        </p>
        <UploadClientForm token={token} />
      </div>
    </main>
  )
}
