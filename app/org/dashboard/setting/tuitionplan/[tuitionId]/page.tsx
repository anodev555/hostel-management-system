import TuitionDetail from "./_components/tuition-detail"

export default function page({
  params,
}: {
  params: Promise<{ tuitionId: string }>
}) {
  return <TuitionDetail params={params} />
}
