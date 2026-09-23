"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffData, StaffDetail } from "@/types/staff-type"
import StaffHeader from "./staff-header"
import StaffProfile from "./staff-profile"
import StaffSalary from "./staff-salary"
import StaffSecurity from "./staff-security"

export default function StaffDetailsForm({
  staffData,
}: {
  staffData: StaffData
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
      <StaffHeader staff={staffData.staffDetail} />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList variant="line">
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
  )
}
