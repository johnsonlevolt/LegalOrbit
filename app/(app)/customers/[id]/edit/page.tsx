import { notFound } from 'next/navigation'
import { getCustomer } from '@/lib/actions/customers'
import { CustomerForm } from '@/components/forms/customer-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage(props: Props) {
  const params = await props.params;
  const customer = await getCustomer(params.id)
  if (!customer) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">顧客編集</h1>
      <CustomerForm customer={customer} />
    </div>
  )
}
