import FoodingDetail from "./_components/fooding-detail"

export default function page({
  params,
}: {
  params: Promise<{ foodingId: string }>
}) {
  return <FoodingDetail params={params} />
}
