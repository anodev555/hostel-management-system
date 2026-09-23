import ErrorPage from "@/utils/error-page";
import { getAllRolesAction } from "../action/get-allroles";
import RolesList from "./roles-list";
import { ErrorResolver } from "@/utils/error-resolver";

export default async function Roles({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>
}) {
    try {
        const search = await searchParams
        const response = await getAllRolesAction(search)

        if (!response.success || !response.data) {
            return <ErrorPage message={response.message ?? "Failed to load rooms"} />
        }
        console.log(response.data)

        return <RolesList roles={response.data} />
    } catch (error) {
        return <ErrorResolver error={error} />
    }
}