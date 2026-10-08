import HostelDetailManagement from "./hosteldetail-management";
import { getHostelDetailAction } from "../action/get-hosteldetail";

type HostelDetailProps = {
  params: Promise<{ hostel: string }>;
};

export default async function HostelDetailPage({
  params,
}: HostelDetailProps) {
  const { hostel: hostelId } = await params;
  const response = await getHostelDetailAction({ hostelId });

  if (!response.success) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-destructive">{response.message}</p>
      </div>
    );
  }

  return <HostelDetailManagement data={response.data} />;
}