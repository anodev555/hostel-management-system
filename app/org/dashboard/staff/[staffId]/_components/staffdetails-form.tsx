"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffData, StaffDetail } from "@/types/staff-type";
import StaffHeader from "./staff-header";
import StaffProfile from "./staff-profile";
import StaffSalary from "./staff-salary";
import StaffSecurity from "./staff-security";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function StaffDetailsForm({
  staffData,
}: {
  staffData: StaffData;
}) {
  const router = useRouter();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
      <div className="flex flex-col items-start w-full justify-start gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            router.push("/org/dashboard/staff");
          }}
        >
          <ArrowLeft /> Back
        </Button>
        <div className="flex flex-row   justify-between w-full">
          <div className=" flex items-center gap-2">
            <div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={staffData.staffDetail.image ?? ""} />
                <AvatarFallback>
                  {(staffData.staffDetail.name?.charAt(0) ?? "") +
                    (staffData.staffDetail.name?.charAt(1) ?? "")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-2xl font-semibold capitalize">
                {staffData.staffDetail.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {staffData.staffDetail.username}
              </p>
            </div>
          </div>
          <Button
          variant="destructive"
          >delete</Button>
        </div>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList variant="default" className="w-full space-x-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <StaffProfile
            staffDetail={{
              userId: staffData.staffDetail.userId,
              name: staffData.staffDetail.name || "",
              email: staffData.staffDetail.email || "",
              role: staffData.staffDetail.role || "",
              username: staffData.staffDetail.username || "",
              contactPhone: staffData.staffDetail.phone || "",
            }}
          />
        </TabsContent>
        <TabsContent value="salary">
          <StaffSalary
            memberId={staffData.staffDetail.id}
            salary={staffData.staffDetail.salary}
            salaryHistory={staffData.salaryHistory}
          />
        </TabsContent>
        <TabsContent value="security">
          <StaffSecurity
            userId={staffData.staffDetail.userId}
            staffId={staffData.staffDetail.staffId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and download your detailed reports. Export data in
                multiple formats for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You have 5 reports ready and available to export.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
