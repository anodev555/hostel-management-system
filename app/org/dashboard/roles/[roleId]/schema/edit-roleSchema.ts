import { roleSchema } from "../../schema/roleSchema"
import z from "zod"

export const editRoleSchema = roleSchema.extend({
  roleId: z.string().min(1, "role id is required"),
})

export type EditRoleSchemaType = z.infer<typeof editRoleSchema>
