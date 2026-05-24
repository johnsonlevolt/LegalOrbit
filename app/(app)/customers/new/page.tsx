import { CustomerForm } from '@/components/forms/customer-form'

export default function NewCustomerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">顧客登録</h1>
      <CustomerForm />
    </div>
  )
}
