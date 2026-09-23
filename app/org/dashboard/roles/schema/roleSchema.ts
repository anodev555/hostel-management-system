import { orgPermissions } from "@/lib/org-permissions"
import z from "zod"

 
// Extract all unique actions from orgPermissions dynamically
const allActions = Array.from(
  new Set(Object.values(orgPermissions).flat())
) as ["create" | "read" | "update" | "delete" | "collectpayment" | "checkout" | "edit"]
 const resources = Object.keys(orgPermissions) as [
  keyof typeof orgPermissions,
  ...(keyof typeof orgPermissions)[],
]

const permissionsSchema = z.record(z.enum(resources), z.array(z.enum(allActions)))

export const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: permissionsSchema.refine(
    (p) => Object.values(p).some((v) => v.length > 0),
    {
      message: "Select as least one permission",
    }
  ),
})

export type CreateRoleSchemaType = z.infer<typeof roleSchema>
